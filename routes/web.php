<?php
// File: routes/web.php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\OrdersController as DashboardOrdersController;
use App\Http\Controllers\Dashboard\FundsController;
use App\Http\Controllers\Dashboard\TransactionsController;
use App\Http\Controllers\Dashboard\TicketsController;
use App\Http\Controllers\Dashboard\ReferralsController;
use App\Http\Controllers\Dashboard\ProfileController as DashboardProfileController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ProductManagementController;
use App\Http\Controllers\Admin\OrderManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\TransactionManagementController;
use App\Http\Controllers\Admin\SupportManagementController;
use App\Http\Controllers\Admin\PromoCodeController;
use App\Http\Controllers\Admin\CmsController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\CmsPageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::get('/', [HomepageController::class, 'index'])->name('homepage');
Route::get('/search', [HomepageController::class, 'search'])->name('search');
Route::get('/categories', [ProductController::class, 'categories'])->name('categories.index');
Route::get('/categories/{category:slug}', [ProductController::class, 'category'])->name('categories.show');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/products/{product:slug}/availability', [ProductController::class, 'checkAvailability'])->name('products.availability');
Route::post('/products/{product:slug}/validate-quantity', [ProductController::class, 'validateQuantity'])->name('products.validate-quantity');

// CMS Pages
Route::get('/about', [CmsPageController::class, 'show'])->name('cms.about');
Route::get('/terms', [CmsPageController::class, 'show'])->name('cms.terms');
Route::get('/privacy', [CmsPageController::class, 'show'])->name('cms.privacy');
Route::get('/help', [CmsPageController::class, 'show'])->name('cms.help');
Route::get('/contact', [CmsPageController::class, 'show'])->name('cms.contact');
Route::get('/page/{slug}', [CmsPageController::class, 'show'])->name('cms.page');

// Authentication Routes (handled by Breeze)
require __DIR__ . '/auth.php';

// Order Routes (requires auth)
Route::middleware('auth')->group(function () {
    Route::get('/checkout/{product:slug}', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}/payment', [OrderController::class, 'payment'])->name('orders.payment');
    Route::post('/orders/{order}/pay-with-balance', [OrderController::class, 'payWithBalance'])->name('orders.pay-balance');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/validate-promo-code', [OrderController::class, 'validatePromoCode'])->name('orders.validate-promo');
});

// Dashboard Routes
Route::middleware(['auth', 'verified', 'role:customer|admin|support'])->prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Orders
    Route::get('/orders', [DashboardOrdersController::class, 'index'])->name('dashboard.orders.index');
    Route::get('/orders/{order}', [DashboardOrdersController::class, 'show'])->name('dashboard.orders.show');
    Route::get('/orders/{order}/download', [DashboardOrdersController::class, 'downloadCredentials'])->name('dashboard.orders.download');
    Route::get('/orders/{order}/invoice', [DashboardOrdersController::class, 'downloadInvoice'])->name('dashboard.orders.invoice'); // ADD THIS LINE


    // Funds & Transactions
    Route::post('/funds/check-payment-status', [FundsController::class, 'checkPaymentStatus'])->name('api.funds.check-status');
    Route::get('/funds', [FundsController::class, 'index'])->name('dashboard.funds.index');
    Route::post('/funds/add', [FundsController::class, 'create'])->name('dashboard.funds.add');
    Route::post('/funds/crypto', [FundsController::class, 'createCryptoPayment'])->name('dashboard.funds.crypto');
    Route::get('/funds/payment/{paymentId}', [FundsController::class, 'showPayment'])->name('dashboard.funds.payment');


    Route::get('/transactions', [TransactionsController::class, 'index'])->name('dashboard.transactions.index');
    Route::get('/transactions/{transaction}', [TransactionsController::class, 'show'])->name('dashboard.transactions.show');

    // Support Tickets
    Route::get('/tickets', [TicketsController::class, 'index'])->name('dashboard.tickets.index');
    Route::get('/tickets/create', [TicketsController::class, 'create'])->name('dashboard.tickets.create');
    Route::post('/tickets', [TicketsController::class, 'store'])->name('dashboard.tickets.store');
    Route::get('/tickets/{ticket}', [TicketsController::class, 'show'])->name('dashboard.tickets.show');
    Route::post('/tickets/{ticket}/messages', [TicketsController::class, 'addMessage'])->name('dashboard.tickets.message');
    Route::post('/tickets/{ticket}/close', [TicketsController::class, 'close'])->name('dashboard.tickets.close');

    // Referrals
    Route::get('/referrals', [ReferralsController::class, 'index'])->name('dashboard.referrals.index');
    Route::post('/referrals/generate-code', [ReferralsController::class, 'generateCode'])->name('dashboard.referrals.generate');

    // Profile
    Route::get('/profile', [DashboardProfileController::class, 'edit'])->name('dashboard.profile.edit');
    Route::patch('/profile', [DashboardProfileController::class, 'update'])->name('dashboard.profile.update');
    Route::delete('/profile', [DashboardProfileController::class, 'destroy'])->name('dashboard.profile.destroy');
    Route::post('/profile/2fa/enable', [DashboardProfileController::class, 'enableTwoFactor'])->name('dashboard.profile.2fa.enable');
    Route::delete('/profile/2fa/disable', [DashboardProfileController::class, 'disableTwoFactor'])->name('dashboard.profile.2fa.disable');
    Route::post('/profile/2fa/confirm', [DashboardProfileController::class, 'confirmTwoFactor'])->name('dashboard.profile.2fa.confirm');
    Route::delete('/profile/2fa/disable', [DashboardProfileController::class, 'disableTwoFactor'])->name('dashboard.profile.2fa.disable');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // // Product Management
    Route::get('/products', [ProductManagementController::class, 'index'])->name('admin.products.index');
    Route::get('/products/create', [ProductManagementController::class, 'create'])->name('admin.products.create');
    Route::post('/products', [ProductManagementController::class, 'store'])->name('admin.products.store');
    Route::get('/products/{product}', [ProductManagementController::class, 'show'])->name('admin.products.show');
    Route::get('/products/{product}/edit', [ProductManagementController::class, 'edit'])->name('admin.products.edit');
    Route::post('/products/{product}', [ProductManagementController::class, 'update'])->name('admin.products.update');
    Route::delete('/products/{product}', [ProductManagementController::class, 'destroy'])->name('admin.products.destroy');
    Route::post('/products/{product}/access-codes/bulk', [ProductManagementController::class, 'bulkUploadCodes'])->name('admin.products.codes.bulk');
    Route::post('/products/{product}/toggle-status', [ProductManagementController::class, 'toggleStatus'])->name('admin.products.toggle-status');

    // // Category Management
    Route::get('/categories', [ProductManagementController::class, 'categories'])->name('admin.categories.index');
    Route::post('/categories', [ProductManagementController::class, 'storeCategory'])->name('admin.categories.store');
    Route::put('/categories/{category}', [ProductManagementController::class, 'updateCategory'])->name('admin.categories.update');
    Route::delete('/categories/{category}', [ProductManagementController::class, 'destroyCategory'])->name('admin.categories.destroy');

    // // Order Management
    Route::get('/orders', [OrderManagementController::class, 'index'])->name('admin.orders.index');
    Route::get('/orders/{order}', [OrderManagementController::class, 'show'])->name('admin.orders.show');
    Route::post('/orders/{order}/process', [OrderManagementController::class, 'process'])->name('admin.orders.process');
    Route::post('/orders/{order}/cancel', [OrderManagementController::class, 'cancel'])->name('admin.orders.cancel');
    Route::post('/orders/{order}/refund', [OrderManagementController::class, 'refund'])->name('admin.orders.refund');
    Route::post('/orders/{order}/assign-codes', [OrderManagementController::class, 'assignCodes'])->name('admin.orders.assign-codes');

    // // User Management
    Route::get('/users', [UserManagementController::class, 'index'])->name('admin.users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{user}', [UserManagementController::class, 'show'])->name('admin.users.show');
    Route::get('/users/{user}/edit', [UserManagementController::class, 'edit'])->name('admin.users.edit');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('admin.users.update');
    Route::post('/users/{user}/suspend', [UserManagementController::class, 'suspend'])->name('admin.users.suspend');
    Route::post('/users/{user}/activate', [UserManagementController::class, 'activate'])->name('admin.users.activate');
    Route::post('/users/{user}/add-balance', [UserManagementController::class, 'addBalance'])->name('admin.users.add-balance');

    // Transaction Management
    Route::get('/transactions', [TransactionManagementController::class, 'index'])->name('admin.transactions.index');
    Route::get('/transactions/{transaction}', [TransactionManagementController::class, 'show'])->name('admin.transactions.show');
    Route::post('/transactions/{transaction}/approve', [TransactionManagementController::class, 'approve'])->name('admin.transactions.approve');
    Route::post('/transactions/{transaction}/reject', [TransactionManagementController::class, 'reject'])->name('admin.transactions.reject');
    Route::post('/transactions/create', [TransactionManagementController::class, 'create'])->name('admin.transactions.create');

    // // Support Management
    // Route::get('/support', [SupportManagementController::class, 'index'])->name('admin.support.index');
    // Route::get('/support/{ticket}', [SupportManagementController::class, 'show'])->name('admin.support.show');
    // Route::post('/support/{ticket}/assign', [SupportManagementController::class, 'assign'])->name('admin.support.assign');
    // Route::post('/support/{ticket}/status', [SupportManagementController::class, 'updateStatus'])->name('admin.support.status');
    // Route::post('/support/{ticket}/reply', [SupportManagementController::class, 'reply'])->name('admin.support.reply');

    // // Promo Code Management
    // Route::get('/promo-codes', [PromoCodeController::class, 'index'])->name('admin.promo-codes.index');
    // Route::get('/promo-codes/create', [PromoCodeController::class, 'create'])->name('admin.promo-codes.create');
    // Route::post('/promo-codes', [PromoCodeController::class, 'store'])->name('admin.promo-codes.store');
    // Route::get('/promo-codes/{promoCode}', [PromoCodeController::class, 'show'])->name('admin.promo-codes.show');
    // Route::get('/promo-codes/{promoCode}/edit', [PromoCodeController::class, 'edit'])->name('admin.promo-codes.edit');
    // Route::put('/promo-codes/{promoCode}', [PromoCodeController::class, 'update'])->name('admin.promo-codes.update');
    // Route::delete('/promo-codes/{promoCode}', [PromoCodeController::class, 'destroy'])->name('admin.promo-codes.destroy');
    // Route::post('/promo-codes/{promoCode}/toggle-status', [PromoCodeController::class, 'toggleStatus'])->name('admin.promo-codes.toggle-status');

    // // CMS Management
    // Route::get('/cms', [CmsController::class, 'index'])->name('admin.cms.index');
    // Route::get('/cms/create', [CmsController::class, 'create'])->name('admin.cms.create');
    // Route::post('/cms', [CmsController::class, 'store'])->name('admin.cms.store');
    // Route::get('/cms/{cmsPage}', [CmsController::class, 'show'])->name('admin.cms.show');
    // Route::get('/cms/{cmsPage}/edit', [CmsController::class, 'edit'])->name('admin.cms.edit');
    // Route::put('/cms/{cmsPage}', [CmsController::class, 'update'])->name('admin.cms.update');
    // Route::delete('/cms/{cmsPage}', [CmsController::class, 'destroy'])->name('admin.cms.destroy');
    // Route::post('/cms/{cmsPage}/toggle-status', [CmsController::class, 'toggleStatus'])->name('admin.cms.toggle-status');

    // // Reports & Analytics
    // Route::get('/reports', [ReportsController::class, 'index'])->name('admin.reports.index');
    // Route::get('/reports/sales', [ReportsController::class, 'sales'])->name('admin.reports.sales');
    // Route::get('/reports/users', [ReportsController::class, 'users'])->name('admin.reports.users');
    // Route::get('/reports/products', [ReportsController::class, 'products'])->name('admin.reports.products');
    // Route::get('/reports/transactions', [ReportsController::class, 'transactions'])->name('admin.reports.transactions');
    // Route::post('/reports/export', [ReportsController::class, 'export'])->name('admin.reports.export');
});

// API Routes for AJAX calls
Route::middleware('auth')->prefix('api')->group(function () {
    Route::post('/products/{product}/check-stock', [ProductController::class, 'checkStock'])->name('api.products.check-stock');
    Route::get('/notifications', function () {
        return response()->json(['notifications' => []]);
    })->name('api.notifications');
});

// Webhook Routes (no auth required)
Route::post('/webhooks/nowpayments', [FundsController::class, 'nowpaymentsWebhook'])->name('webhooks.nowpayments');

// Fallback route for SPA
Route::fallback(function () {
    return Inertia::render('Error', [
        'status' => 404,
        'message' => 'Page not found'
    ]);
});
