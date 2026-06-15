<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;

class RajaOngkirService
{
    private string $apiKey;
    private string $baseUrl;
    private int $originCityId;

    public function __construct()
    {
        $this->apiKey = config('services.rajaongkir.api_key');
        $this->baseUrl = config('services.rajaongkir.base_url');
        $this->originCityId = (int) config('services.rajaongkir.origin_city_id');
    }

    public function getProvinces(): array
    {
        return $this->get('/province');
    }

    public function getCities(?int $provinceId = null): array
    {
        $params = $provinceId ? ['province' => $provinceId] : [];
        return $this->get('/city', $params);
    }

    public function getSubdistricts(int $cityId): array
    {
        return $this->get('/subdistrict', ['city' => $cityId]);
    }

    public function getCost(int $destinationCityId, int $weightGram, string $courier): array
    {
        return $this->post('/cost', [
            'origin'      => $this->originCityId,
            'destination' => $destinationCityId,
            'weight'      => $weightGram,
            'courier'     => $courier,
        ]);
    }

    private function get(string $endpoint, array $params = []): array
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->get($this->baseUrl . $endpoint, $params);

        return $response->json();
    }

    private function post(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->asForm()
            ->post($this->baseUrl . $endpoint, $data);

        return $response->json();
    }
}
