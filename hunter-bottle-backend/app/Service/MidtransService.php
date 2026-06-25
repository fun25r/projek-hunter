<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    private string $serverKey;
    private string $clientKey;
    private string $baseUrl;
    private bool $isProduction;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key');
        $this->clientKey = config('services.midtrans.client_key');
        $this->isProduction = config('services.midtrans.is_production', false);
        $this->baseUrl = $this->isProduction
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    /**
     * Buat Snap Invoice lengkap dengan item_details termasuk ongkir Biteship.
     * Payment methods diaktifkan: qris, gopay, shopeepay, bank_transfer.
     */
    public function createSnapInvoice(array $orderData): array
    {
        $payload = [
            'transaction_details' => [
                'order_id'     => $orderData['order_number'],
                'gross_amount' => (int) $orderData['total_amount'],
            ],
            'customer_details' => [
                'first_name' => $orderData['customer_name'],
                'email'      => $orderData['customer_email'],
                'phone'      => $orderData['customer_phone'],
            ],
            'item_details' => $this->buildItemDetails(
                $orderData['items'] ?? [],
                $orderData['delivery_fee'] ?? 0
            ),
            'enabled_payments' => [
                'qris',
                'gopay',
                'shopeepay',
                'bank_transfer',
            ],
            'callbacks' => [
                'finish' => config('services.xendit.success_redirect_url')
                    ?? config('app.url') . '/checkout/success',
            ],
        ];

        $http = Http::withBasicAuth($this->serverKey, '')
            ->withHeaders(['Content-Type' => 'application/json']);

        if (!app()->environment('production')) {
            $http = $http->withoutVerifying();
        }

        $response = $http->post($this->baseUrl . '/snap/v1/transactions', $payload);

        if (!$response->successful()) {
            Log::error('Midtrans Snap error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \Exception('Gagal membuat invoice pembayaran: ' . $response->body());
        }

        $result = $response->json();

        return [
            'token'         => $result['token'] ?? '',
            'redirect_url'  => $result['redirect_url'] ?? '',
        ];
    }

    /**
     * Generate Snap token saja (untuk popup)
     */
    public function getSnapToken(array $transaction): array
    {
        $http = Http::withBasicAuth($this->serverKey, '')
            ->withHeaders(['Content-Type' => 'application/json']);

        if (!app()->environment('production')) {
            $http = $http->withoutVerifying();
        }

        $response = $http->post($this->baseUrl . '/snap/v1/transactions', $transaction);

        return $response->json();
    }

    /**
     * Bangun item_details termasuk biaya ongkir sebagai item terpisah
     */
    private function buildItemDetails(array $items, int $deliveryFee): array
    {
        $details = [];

        foreach ($items as $item) {
            $details[] = [
                'id'       => (string) ($item['product_id'] ?? $item['id'] ?? '0'),
                'price'    => (int) ($item['product_price'] ?? $item['price'] ?? 0),
                'quantity' => (int) ($item['quantity'] ?? 1),
                'name'     => substr($item['product_name'] ?? $item['name'] ?? 'Item', 0, 50),
            ];
        }

        if ($deliveryFee > 0) {
            $details[] = [
                'id'       => 'DELIVERY_FEE',
                'price'    => $deliveryFee,
                'quantity' => 1,
                'name'     => 'Biaya Pengiriman (Biteship)',
            ];
        }

        return $details;
    }

    /**
     * Verifikasi signature key dari callback Midtrans
     */
    public function verifySignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '0';
        $signatureKey = $payload['signature_key'] ?? '';

        $raw = $orderId . $statusCode . $grossAmount . $this->serverKey;
        $calculated = hash('sha512', $raw);

        return hash_equals($calculated, $signatureKey);
    }

    /**
     * Cek status transaksi ke Midtrans API
     */
    public function getTransactionStatus(string $orderId): array
    {
        $response = Http::withBasicAuth($this->serverKey, '')
            ->get($this->baseUrl . '/v2/' . $orderId . '/status');

        return $response->json();
    }

    public static function mapStatus(string $midtransStatus): string
    {
        return match ($midtransStatus) {
            'settlement', 'capture' => 'paid',
            'pending'               => 'pending',
            'deny', 'cancel', 'expire', 'failure' => 'failed',
            default                 => 'pending',
        };
    }
}
