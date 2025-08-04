<?php

return [

    'currency' => env('DEFAULT_CURRENCY', 'USD'),
    'min_deposit_amount' => env('MIN_DEPOSIT_AMOUNT', 10.00),
    'max_deposit_amount' => env('MAX_DEPOSIT_AMOUNT', 10000.00),
    'referral_commission_rate' => env('REFERRAL_COMMISSION_RATE', 5.0),

    // Feature flags
    'enable_referral_system' => env('ENABLE_REFERRAL_SYSTEM', true),
    'enable_two_factor' => env('ENABLE_TWO_FACTOR', true),
    'enable_kyc_verification' => env('ENABLE_KYC_VERIFICATION', false),
    'enable_crypto_payments' => env('ENABLE_CRYPTO_PAYMENTS', true),
    'enable_promo_codes' => env('ENABLE_PROMO_CODES', true),

    // Rate limiting
    'rate_limit_login' => env('RATE_LIMIT_LOGIN', 5),
    'rate_limit_api' => env('RATE_LIMIT_API', 100),
    'rate_limit_purchase' => env('RATE_LIMIT_PURCHASE', 10),

    // File upload settings
    'max_upload_size' => env('MAX_UPLOAD_SIZE', 10240), // KB
    'allowed_image_types' => explode(',', env('ALLOWED_IMAGE_TYPES', 'jpeg,png,jpg,gif,webp')),
    'allowed_document_types' => explode(',', env('ALLOWED_DOCUMENT_TYPES', 'pdf,txt,doc,docx')),

    // Admin settings
    'admin_email' => env('ADMIN_EMAIL', 'admin@accszone.com'),
    'support_email' => env('SUPPORT_EMAIL', 'support@accszone.com'),
    'default_timezone' => env('DEFAULT_TIMEZONE', 'UTC'),

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => 'UTC',

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
