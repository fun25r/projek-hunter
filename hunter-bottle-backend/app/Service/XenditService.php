<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;

class XenditService
{
    private string $secretKey;
    private string $baseUrl = 'https://api.xendit.co';

    public function __construct()
    {
        $this->secretKey = config('services.xendit.secret_key');
    }

    public function createInvoice(array $data): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post($this->baseUrl . '/v2/invoices', $data);

        return $response->json();
    }

    public function getInvoice(string $invoiceId): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get($this->baseUrl . '/v2/invoices/' . $invoiceId);

        return $response->json();
    }
}
