<?php
// File: app/Http/Controllers/CmsPageController.php

namespace App\Http\Controllers;

use App\Models\CmsPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CmsPageController extends Controller
{
    /**
     * Display the specified CMS page.
     */
    public function show(Request $request, $slug = null)
    {
        // Handle named routes
        $routeName = $request->route()->getName();

        // Map route names to slugs
        $routeSlugMap = [
            'cms.about' => 'about',
            'cms.terms' => 'terms',
            'cms.privacy' => 'privacy',
            'cms.help' => 'help',
            'cms.contact' => 'contact',
        ];

        // Get slug from route mapping or use provided slug
        $pageSlug = $routeSlugMap[$routeName] ?? $slug;

        if (!$pageSlug) {
            abort(404);
        }

        // Try to find the CMS page in database
        $cmsPage = CmsPage::where('slug', $pageSlug)
            ->where('is_published', true)
            ->first();

        // If no CMS page found, return default content
        if (!$cmsPage) {
            $cmsPage = $this->getDefaultContent($pageSlug);
        }

        if (!$cmsPage) {
            abort(404);
        }

        return Inertia::render('CmsPage', [
            'page' => $cmsPage,
            'meta' => [
                'title' => $cmsPage['title'] ?? ucfirst($pageSlug),
                'description' => $cmsPage['meta_description'] ?? 'Learn more about ' . config('app.name'),
            ]
        ]);
    }

    /**
     * Get default content for CMS pages when not found in database
     */
    private function getDefaultContent($slug)
    {
        $defaultContent = [
            'about' => [
                'title' => 'About Us',
                'content' => $this->getAboutContent(),
                'slug' => 'about',
                'meta_description' => 'Learn about our company and mission'
            ],
            'terms' => [
                'title' => 'Terms of Service',
                'content' => $this->getTermsContent(),
                'slug' => 'terms',
                'meta_description' => 'Terms and conditions for using our service'
            ],
            'privacy' => [
                'title' => 'Privacy Policy',
                'content' => $this->getPrivacyContent(),
                'slug' => 'privacy',
                'meta_description' => 'How we handle and protect your personal information'
            ],
            'help' => [
                'title' => 'Help Center',
                'content' => $this->getHelpContent(),
                'slug' => 'help',
                'meta_description' => 'Get help and find answers to common questions'
            ],
            'contact' => [
                'title' => 'Contact Us',
                'content' => $this->getContactContent(),
                'slug' => 'contact',
                'meta_description' => 'Get in touch with our support team'
            ],
        ];

        return $defaultContent[$slug] ?? null;
    }

    private function getAboutContent()
    {
        return '
            <div class="prose max-w-none">
                <h2>About ' . config('app.name') . '</h2>
                <p>Welcome to ' . config('app.name') . ', your trusted marketplace for premium digital accounts and services. We specialize in providing high-quality, verified accounts across various platforms to meet your business and personal needs.</p>

                <h3>Our Mission</h3>
                <p>Our mission is to provide secure, reliable, and instant access to digital accounts while maintaining the highest standards of quality and customer service. We understand the importance of verified accounts in today\'s digital landscape and strive to make them accessible to everyone.</p>

                <h3>What We Offer</h3>
                <ul>
                    <li>Phone-verified Gmail accounts (PVA)</li>
                    <li>SMTP-enabled Gmail accounts for email marketing</li>
                    <li>Social media accounts across major platforms</li>
                    <li>Instant delivery upon payment confirmation</li>
                    <li>24/7 customer support</li>
                    <li>Secure cryptocurrency payments</li>
                </ul>

                <h3>Why Choose Us?</h3>
                <ul>
                    <li><strong>Quality Guarantee:</strong> All accounts are thoroughly tested and verified</li>
                    <li><strong>Instant Delivery:</strong> Receive your accounts immediately after payment</li>
                    <li><strong>Secure Payments:</strong> Support for multiple cryptocurrencies</li>
                    <li><strong>Customer Support:</strong> Dedicated support team available 24/7</li>
                    <li><strong>Competitive Pricing:</strong> Best prices in the market</li>
                </ul>

                <h3>Our Commitment</h3>
                <p>We are committed to providing exceptional service and building long-term relationships with our customers. Your success is our success, and we continuously work to improve our offerings and expand our inventory to meet your evolving needs.</p>
            </div>
        ';
    }

    private function getTermsContent()
    {
        return '
            <div class="prose max-w-none">
                <h2>Terms of Service</h2>
                <p><em>Last updated: ' . date('F j, Y') . '</em></p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using ' . config('app.name') . ', you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h3>2. Description of Service</h3>
                <p>' . config('app.name') . ' provides digital account sales and delivery services. We offer verified accounts for various platforms including but not limited to Gmail, social media platforms, and other digital services.</p>

                <h3>3. User Responsibilities</h3>
                <ul>
                    <li>You must be at least 18 years old to use our services</li>
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You agree to use purchased accounts in compliance with the respective platform\'s terms of service</li>
                    <li>You will not use our services for illegal activities</li>
                </ul>

                <h3>4. Payment Terms</h3>
                <ul>
                    <li>All payments are processed securely through cryptocurrency</li>
                    <li>Payments are non-refundable except in cases of non-delivery</li>
                    <li>Prices are subject to change without notice</li>
                </ul>

                <h3>5. Delivery and Support</h3>
                <ul>
                    <li>Digital products are delivered instantly upon payment confirmation</li>
                    <li>We provide 24-hour replacement guarantee for defective accounts</li>
                    <li>Support is available through our ticket system</li>
                </ul>

                <h3>6. Refund Policy</h3>
                <p>Refunds are only provided in cases where:</p>
                <ul>
                    <li>Accounts are not delivered within 24 hours</li>
                    <li>Accounts do not match the description provided</li>
                    <li>Technical issues prevent access to purchased accounts</li>
                </ul>

                <h3>7. Limitation of Liability</h3>
                <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>

                <h3>8. Modifications</h3>
                <p>We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of any changes.</p>

                <h3>9. Contact Information</h3>
                <p>For questions about these Terms of Service, please contact us through our support system.</p>
            </div>
        ';
    }

    private function getPrivacyContent()
    {
        return '
            <div class="prose max-w-none">
                <h2>Privacy Policy</h2>
                <p><em>Last updated: ' . date('F j, Y') . '</em></p>

                <h3>1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>

                <h4>Information you provide to us:</h4>
                <ul>
                    <li>Account information (username, email, password)</li>
                    <li>Payment information (cryptocurrency wallet addresses)</li>
                    <li>Communication data (support tickets, messages)</li>
                </ul>

                <h4>Information we collect automatically:</h4>
                <ul>
                    <li>Usage data (pages visited, features used)</li>
                    <li>Device information (IP address, browser type)</li>
                    <li>Transaction history and order details</li>
                </ul>

                <h3>2. How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide and improve our services</li>
                    <li>Process transactions and deliver digital products</li>
                    <li>Communicate with you about your account and orders</li>
                    <li>Provide customer support</li>
                    <li>Detect and prevent fraud</li>
                </ul>

                <h3>3. Information Sharing</h3>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
                <ul>
                    <li>With your consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and prevent fraud</li>
                    <li>With service providers who assist in our operations</li>
                </ul>

                <h3>4. Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                <h3>5. Data Retention</h3>
                <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations.</p>

                <h3>6. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of marketing communications</li>
                </ul>

                <h3>7. Cookies</h3>
                <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.</p>

                <h3>8. Changes to Privacy Policy</h3>
                <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

                <h3>9. Contact Us</h3>
                <p>If you have questions about this privacy policy, please contact us through our support system.</p>
            </div>
        ';
    }

    private function getHelpContent()
    {
        return '
            <div class="prose max-w-none">
                <h2>Help Center</h2>
                <p>Find answers to common questions and get the help you need.</p>

                <h3>Getting Started</h3>

                <h4>How do I create an account?</h4>
                <p>Click on "Register" in the top navigation, provide your email and password, then verify your email address to activate your account.</p>

                <h4>How do I add funds to my account?</h4>
                <p>Go to your dashboard and click "Add Funds." You can deposit using various cryptocurrencies including Bitcoin, Ethereum, and USDT.</p>

                <h3>Purchasing</h3>

                <h4>How do I buy accounts?</h4>
                <ol>
                    <li>Browse our products or use the search function</li>
                    <li>Select the product and quantity you need</li>
                    <li>Add to cart and proceed to checkout</li>
                    <li>Pay using your account balance or cryptocurrency</li>
                    <li>Receive your accounts instantly after payment confirmation</li>
                </ol>

                <h4>What payment methods do you accept?</h4>
                <p>We accept various cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and many others through our secure payment processor.</p>

                <h4>How quickly will I receive my accounts?</h4>
                <p>Digital accounts are delivered instantly to your dashboard once payment is confirmed. Cryptocurrency transactions typically confirm within 10-30 minutes.</p>

                <h3>Account Issues</h3>

                <h4>What if an account doesn\'t work?</h4>
                <p>We offer a 24-hour replacement guarantee. If an account doesn\'t work as described, create a support ticket with details and we\'ll replace it promptly.</p>

                <h4>How do I access my purchased accounts?</h4>
                <p>Go to your dashboard and click "My Orders." You can view and download credentials for all your purchased accounts.</p>

                <h3>Security</h3>

                <h4>Is my information secure?</h4>
                <p>Yes, we use industry-standard encryption and security measures to protect your data. We never store payment information and use secure cryptocurrency processors.</p>

                <h4>Can I enable two-factor authentication?</h4>
                <p>Yes, we highly recommend enabling 2FA in your profile settings for additional account security.</p>

                <h3>Support</h3>

                <h4>How do I contact support?</h4>
                <p>Create a support ticket from your dashboard. Our team typically responds within 2-4 hours.</p>

                <h4>What information should I include in a support ticket?</h4>
                <p>Please include:</p>
                <ul>
                    <li>Order number (if applicable)</li>
                    <li>Detailed description of the issue</li>
                    <li>Screenshots if relevant</li>
                    <li>Steps you\'ve already tried</li>
                </ul>

                <h3>Referral Program</h3>

                <h4>How does the referral program work?</h4>
                <p>Share your unique referral link with others. When they make their first purchase, you\'ll earn a commission added to your account balance.</p>

                <h3>Still Need Help?</h3>
                <p>If you can\'t find the answer you\'re looking for, please <a href="/contact" class="text-blue-600 hover:text-blue-800">contact our support team</a> and we\'ll be happy to assist you.</p>
            </div>
        ';
    }

    private function getContactContent()
    {
        return '
            <div class="prose max-w-none">
                <h2>Contact Us</h2>
                <p>We\'re here to help! Get in touch with our support team.</p>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
                    <h3 class="text-blue-800 mb-3">Primary Support Channel</h3>
                    <p class="text-blue-700">For the fastest response, please use our ticket system:</p>
                    <a href="/dashboard/tickets/create" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Create Support Ticket</a>
                </div>

                <h3>Support Hours</h3>
                <p>Our support team is available:</p>
                <ul>
                    <li><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM (UTC)</li>
                    <li><strong>Saturday - Sunday:</strong> 10:00 AM - 4:00 PM (UTC)</li>
                    <li><strong>Emergency Issues:</strong> 24/7 via ticket system</li>
                </ul>

                <h3>Response Times</h3>
                <ul>
                    <li><strong>General Inquiries:</strong> Within 4-6 hours</li>
                    <li><strong>Technical Issues:</strong> Within 2-4 hours</li>
                    <li><strong>Order Problems:</strong> Within 1-2 hours</li>
                    <li><strong>Urgent Issues:</strong> Within 30 minutes</li>
                </ul>

                <h3>Before Contacting Support</h3>
                <p>To help us assist you more quickly, please:</p>
                <ul>
                    <li>Check our <a href="/help" class="text-blue-600 hover:text-blue-800">Help Center</a> for common solutions</li>
                    <li>Have your order number ready (if applicable)</li>
                    <li>Include screenshots of any error messages</li>
                    <li>Describe the steps you\'ve already tried</li>
                </ul>

                <h3>What We Can Help With</h3>
                <ul>
                    <li>Account delivery issues</li>
                    <li>Payment and billing questions</li>
                    <li>Technical support</li>
                    <li>Product information</li>
                    <li>Account replacement requests</li>
                    <li>General platform questions</li>
                </ul>

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
                    <h3 class="text-gray-800 mb-3">Alternative Contact Methods</h3>
                    <p class="text-gray-600 mb-3">If you\'re unable to access your account to create a ticket:</p>
                    <ul class="text-gray-600">
                        <li><strong>Business Inquiries:</strong> Use the contact form on this page</li>
                        <li><strong>Account Recovery:</strong> Use the password reset function</li>
                        <li><strong>Technical Issues:</strong> Clear your browser cache and try again</li>
                    </ul>
                </div>

                <h3>Business Information</h3>
                <p><strong>Company:</strong> ' . config('app.name') . '<br>
                <strong>Service Type:</strong> Digital Account Marketplace<br>
                <strong>Founded:</strong> 2024<br>
                <strong>Headquarters:</strong> International</p>

                <div class="bg-green-50 border border-green-200 rounded-lg p-6 my-6">
                    <h3 class="text-green-800 mb-3">Quick Tips</h3>
                    <ul class="text-green-700">
                        <li>Log into your account for faster support</li>
                        <li>Include order numbers in your message</li>
                        <li>Be specific about the issue you\'re experiencing</li>
                        <li>Check your spam folder for our responses</li>
                    </ul>
                </div>
            </div>
        ';
    }
}
