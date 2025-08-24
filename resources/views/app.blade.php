{{-- File: resources/views/app.blade.php --}}

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'ACCSZone') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/assets/images/favicon.png">

    <!-- Meta Tags -->
    <meta name="description"
        content="ACCSZone - Your trusted marketplace for digital products. Fast delivery, secure payments, and excellent customer support.">
    <meta name="keywords" content="digital products, verified accounts, instant delivery, crypto payments">
    <meta name="author" content="ACCSZone">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('app.name', 'ACCSZone') }}">
    <meta property="og:description" content="Your trusted marketplace for digital products">
    <meta property="og:url" content="{{ config('app.url') }}">
    <meta property="og:image" content="{{ asset('images/og-image.png') }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name', 'ACCSZone') }}">
    <meta name="twitter:description" content="Your trusted marketplace for digital products">
    <meta name="twitter:image" content="{{ asset('images/og-image.png') }}">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"]) @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
