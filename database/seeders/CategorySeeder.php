<?php
// File: database/seeders/CategorySeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Email Accounts',
                'slug' => 'email-accounts',
                'description' => 'Verified email accounts from various providers',
                'icon' => '📧',
                'children' => [
                    ['name' => 'Gmail', 'slug' => 'gmail', 'description' => 'Verified Gmail accounts'],
                    ['name' => 'Outlook', 'slug' => 'outlook', 'description' => 'Microsoft Outlook accounts'],
                    ['name' => 'Yahoo', 'slug' => 'yahoo', 'description' => 'Yahoo Mail accounts'],
                    ['name' => 'ProtonMail', 'slug' => 'protonmail', 'description' => 'Secure ProtonMail accounts'],
                ],
            ],
            [
                'name' => 'Social Media',
                'slug' => 'social-media',
                'description' => 'Social media accounts and services',
                'icon' => '📱',
                'children' => [
                    ['name' => 'Facebook', 'slug' => 'facebook', 'description' => 'Facebook accounts and pages'],
                    ['name' => 'Instagram', 'slug' => 'instagram', 'description' => 'Instagram accounts'],
                    ['name' => 'Twitter', 'slug' => 'twitter', 'description' => 'Twitter/X accounts'],
                    ['name' => 'LinkedIn', 'slug' => 'linkedin', 'description' => 'Professional LinkedIn accounts'],
                    ['name' => 'TikTok', 'slug' => 'tiktok', 'description' => 'TikTok creator accounts'],
                ],
            ],
            [
                'name' => 'Streaming Services',
                'slug' => 'streaming-services',
                'description' => 'Premium streaming service accounts',
                'icon' => '🎬',
                'children' => [
                    ['name' => 'Netflix', 'slug' => 'netflix', 'description' => 'Netflix premium accounts'],
                    ['name' => 'Disney+', 'slug' => 'disney-plus', 'description' => 'Disney Plus subscriptions'],
                    ['name' => 'Hulu', 'slug' => 'hulu', 'description' => 'Hulu streaming accounts'],
                    ['name' => 'Amazon Prime', 'slug' => 'amazon-prime', 'description' => 'Amazon Prime Video'],
                    ['name' => 'Spotify', 'slug' => 'spotify', 'description' => 'Spotify Premium accounts'],
                ],
            ],
            [
                'name' => 'Gaming',
                'slug' => 'gaming',
                'description' => 'Gaming accounts and digital games',
                'icon' => '🎮',
                'children' => [
                    ['name' => 'Steam', 'slug' => 'steam', 'description' => 'Steam gaming accounts'],
                    ['name' => 'Epic Games', 'slug' => 'epic-games', 'description' => 'Epic Games Store accounts'],
                    ['name' => 'PlayStation', 'slug' => 'playstation', 'description' => 'PlayStation Network accounts'],
                    ['name' => 'Xbox', 'slug' => 'xbox', 'description' => 'Xbox Live accounts'],
                    ['name' => 'Minecraft', 'slug' => 'minecraft', 'description' => 'Minecraft accounts'],
                ],
            ],
            [
                'name' => 'Cloud Storage',
                'slug' => 'cloud-storage',
                'description' => 'Cloud storage and file hosting services',
                'icon' => '☁️',
                'children' => [
                    ['name' => 'Google Drive', 'slug' => 'google-drive', 'description' => 'Google Drive storage'],
                    ['name' => 'Dropbox', 'slug' => 'dropbox', 'description' => 'Dropbox premium accounts'],
                    ['name' => 'OneDrive', 'slug' => 'onedrive', 'description' => 'Microsoft OneDrive'],
                    ['name' => 'iCloud', 'slug' => 'icloud', 'description' => 'Apple iCloud storage'],
                ],
            ],
            [
                'name' => 'VPN Services',
                'slug' => 'vpn-services',
                'description' => 'Premium VPN service accounts',
                'icon' => '🔒',
                'children' => [
                    ['name' => 'NordVPN', 'slug' => 'nordvpn', 'description' => 'NordVPN premium accounts'],
                    ['name' => 'ExpressVPN', 'slug' => 'expressvpn', 'description' => 'ExpressVPN subscriptions'],
                    ['name' => 'Surfshark', 'slug' => 'surfshark', 'description' => 'Surfshark VPN accounts'],
                    ['name' => 'CyberGhost', 'slug' => 'cyberghost', 'description' => 'CyberGhost VPN'],
                ],
            ],
            [
                'name' => 'Software Licenses',
                'slug' => 'software-licenses',
                'description' => 'Software licenses and activation keys',
                'icon' => '💻',
                'children' => [
                    ['name' => 'Microsoft Office', 'slug' => 'microsoft-office', 'description' => 'MS Office licenses'],
                    ['name' => 'Windows', 'slug' => 'windows', 'description' => 'Windows OS licenses'],
                    ['name' => 'Adobe Creative', 'slug' => 'adobe-creative', 'description' => 'Adobe Creative Suite'],
                    ['name' => 'Antivirus', 'slug' => 'antivirus', 'description' => 'Antivirus software licenses'],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = Category::create([
                'name' => $categoryData['name'],
                'slug' => $categoryData['slug'],
                'description' => $categoryData['description'],
                'icon' => $categoryData['icon'],
                'sort_order' => array_search($categoryData, $categories),
                'is_active' => true,
            ]);

            if (isset($categoryData['children'])) {
                foreach ($categoryData['children'] as $index => $childData) {
                    Category::create([
                        'name' => $childData['name'],
                        'slug' => $childData['slug'],
                        'description' => $childData['description'],
                        'parent_id' => $category->id,
                        'sort_order' => $index,
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
