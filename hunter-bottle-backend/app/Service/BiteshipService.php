<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipService
{
    private string $apiKey;
    private string $baseUrl;
    private float $originLat;
    private float $originLng;
    private string $originAddress;

    public function __construct()
    {
        $this->apiKey = config('services.biteship.api_key');
        $this->baseUrl = config('services.biteship.base_url');
        $this->originLat = (float) config('services.biteship.origin_latitude');
        $this->originLng = (float) config('services.biteship.origin_longitude');
        $this->originAddress = config('services.biteship.origin_address');
    }

    /**
     * POST /v1/rates/couriers — hitung tarif pengiriman real-time (instant/express)
     */
    public function getRates(array $destination): array
    {
        $payload = [
            'origin_latitude'      => $this->originLat,
            'origin_longitude'     => $this->originLng,
            'destination_latitude' => (float) ($destination['latitude'] ?? 0),
            'destination_longitude'=> (float) ($destination['longitude'] ?? 0),
            'couriers'             => $destination['courier'] ?? '',
            'items'                => $destination['items'] ?? [
                [
                    'name'   => 'Hunter Bottle Package',
                    'description' => 'Package',
                    'value'  => $destination['value'] ?? 100000,
                    'weight' => $destination['weight'] ?? 1000,
                    'quantity'=> 1,
                ],
            ],
        ];

        $http = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ]);

        if (!app()->environment('production')) {
            $http = $http->withoutVerifying();
        }

        $response = $http->post($this->baseUrl . '/v1/rates/couriers', $payload);

        if (!$response->successful()) {
            Log::error('Biteship rates error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return [
                'origin'      => ['address' => $this->originAddress, 'latitude' => $this->originLat, 'longitude' => $this->originLng],
                'destination' => [],
                'pricing'     => [],
                'results'     => [],
            ];
        }

        $data = $response->json();

        return $this->formatRates($data);
    }

    /**
     * Format Biteship response menjadi format mirip RajaOngkir
     * agar frontend tidak pecah.
     */
    private function formatRates(array $data): array
    {
        $results = [];

        $pricing = $data['pricing'] ?? [];

        foreach ($pricing as $rate) {
            $serviceType = $rate['service_type'] ?? '';
            $courierName = $rate['courier_name'] ?? $rate['courier_code'] ?? '';
            $duration = $rate['duration'] ?? '';
            $price = $rate['price'] ?? 0;
            $courierCode = $rate['courier_code'] ?? '';

            $results[] = [
                'code'         => $courierCode,
                'name'         => strtoupper($courierName),
                'service'      => $rate['service_name'] ?? $serviceType,
                'service_type' => $serviceType,
                'description'  => $rate['description'] ?? '',
                'cost'         => (int) $price,
                'etd'          => $duration,
                'duration'     => $duration,
            ];
        }

        return [
            'origin'      => $data['origin'] ?? [
                'address'   => $this->originAddress,
                'latitude'  => $this->originLat,
                'longitude' => $this->originLng,
            ],
            'destination' => $data['destination'] ?? [],
            'pricing'     => $results,
            'results'     => $results,
        ];
    }

    /**
     * Ambil tarif instant/express saja (Gojek, Grab, Shopee Express)
     */
    public function getInstantExpressRates(array $destination): array
    {
        $full = $this->getRates($destination);
        $pricing = $full['results'] ?? [];

        $filtered = array_filter($pricing, function ($r) {
            $type = strtolower($r['service_type'] ?? '');
            return in_array($type, ['instant', 'express', 'same_day', 'sameday']);
        });

        if (empty($filtered)) {
            $filtered = $pricing;
        }

        return [
            'origin'      => $full['origin'],
            'destination' => $full['destination'],
            'results'     => array_values($filtered),
        ];
    }

    /**
     * Dapatkan harga terendah dari hasil tarif
     */
    public function getLowestPrice(array $destination): int
    {
        $rates = $this->getInstantExpressRates($destination);
        if (empty($rates['results'])) return 0;

        $prices = array_column($rates['results'], 'cost');
        return !empty($prices) ? min($prices) : 0;
    }
}
