<?php
// File: config/nowpayments.php

return [
    'api_key' => env('NOWPAYMENTS_API_KEY'),
    'sandbox_api_key' => env('NOWPAYMENTS_SANDBOX_API_KEY'),
    'ipn_secret' => env('NOWPAYMENTS_IPN_SECRET'),
    'sandbox' => env('NOWPAYMENTS_SANDBOX', true),
    'base_url' => env('NOWPAYMENTS_SANDBOX', true)
        ? 'https://api-sandbox.nowpayments.io/v1'
        : 'https://api.nowpayments.io/v1',

    'supported_currencies' => [
        'btc' => ['name' => 'Bitcoin', 'symbol' => 'BTC'],
        'eth' => ['name' => 'Ethereum', 'symbol' => 'ETH'],
        'usdt' => ['name' => 'Tether', 'symbol' => 'USDT'],
        'usdc' => ['name' => 'USD Coin', 'symbol' => 'USDC'],
        'ltc' => ['name' => 'Litecoin', 'symbol' => 'LTC'],
        'bch' => ['name' => 'Bitcoin Cash', 'symbol' => 'BCH'],
    ],

    'minimum_amount' => 10, // Minimum USD amount
    'maximum_amount' => 10000, // Maximum USD amount

    'callback_url' => env('NOWPAYMENTS_IPN_CALLBACK') ?: env('APP_URL') . '/webhooks/nowpayments',
];
