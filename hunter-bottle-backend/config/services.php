<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'rajaongkir' => [
        'api_key' => env('RAJAONGKIR_API_KEY'),
        'base_url' => env('RAJAONGKIR_BASE_URL', 'https://api.rajaongkir.com/starter'),
        'origin_city_id' => env('SHOP_ORIGIN_CITY_ID', 115),
    ],

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
        'success_redirect_url' => env('XENDIT_SUCCESS_REDIRECT_URL', 'http://localhost:5173/checkout/success'),
        'failure_redirect_url' => env('XENDIT_FAILURE_REDIRECT_URL', 'http://localhost:5173/checkout'),
    ],

    'midtrans' => [
        'merchant_id' => env('MIDTRANS_MERCHANT_ID'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'is_sandbox' => env('MIDTRANS_SANDBOX', true),
    ],

    'biteship' => [
        'api_key' => env('BITESHIP_API_KEY'),
        'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com'),
        'origin_latitude' => env('SHOP_ORIGIN_LATITUDE', '-6.2415'),
        'origin_longitude' => env('SHOP_ORIGIN_LONGITUDE', '106.5285'),
        'origin_address' => env('SHOP_ORIGIN_ADDRESS', 'Samanea Kuliner Junction, Jl. Suvarna Sutera Boulevard C19-20, Pasir Gadung, Cikupa, Tangerang, Banten, 15710'),
    ],

    'store' => [
        'whatsapp_number' => env('STORE_WHATSAPP_NUMBER'),
        'name' => env('STORE_NAME', 'Hunter Bottle'),
    ],

];
