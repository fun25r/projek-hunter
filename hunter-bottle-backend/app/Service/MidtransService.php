<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MidtransService — Integrasi Midtrans Payment Gateway (Sandbox)
 * 
 * Flow:
 * 1. getSnapToken() — dapatkan token untuk Midtrans Snap popup
 * 2. verifySignature() — validasi callback dari Midtrans webhook
 * 3. getTransactionStatus() — cek status transaksi via API
 */
class MidtransService
{
    private string $serverKey;
    private string $baseUrl;
    private bool $isProduction;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key');
        $this->isProduction = config('services.midtrans.is_production', false);
        $this->baseUrl = $this->isProduction
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    /**
     * Generate Snap token untuk Midtrans popup
     */
    public function getSnapToken(array $transaction): array
    {
        $response = Http::withBasicAuth($this->serverKey, '')
            ->post($this->baseUrl . '/snap/v1/transactions', $transaction);

        return $response->json();
    }

    /**
     * Verifikasi signature key dari callback Midtrans
     * Formula: SHA512(order_id + status_code + gross_amount + server_key)
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
            ->get($this->baseUrl . '/snap/v1/transactions/' . $orderId . '/status');

        return $response->json();
    }

    /**
     * Map Midtrans status ke payment_status internal
     */
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
