# ACCSZone Clone - Digital Products Marketplace

A modern eCommerce platform built with Laravel and React for selling digital products like verified accounts, licenses, and digital services. Features include crypto payments, automated delivery, role-based access control, and comprehensive admin management.

## 🚀 Features

### Frontend (Public)
- **Homepage**: Featured products, categories, promotional banners
- **Product Catalog**: Category browsing, search functionality, product details
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **SEO Optimized**: Meta tags, structured data, semantic HTML

### User Dashboard
- **Account Management**: Profile settings, 2FA, KYC verification
- **Order History**: View orders, download credentials, track status
- **Wallet System**: Add funds via crypto, view transaction history
- **Support System**: Create tickets, message support team
- **Referral Program**: Earn commissions, track referrals

### Admin Panel
- **Product Management**: CRUD operations, bulk access code upload
- **Order Management**: Process orders, assign codes, handle refunds
- **User Management**: View users, manage accounts, add balance
- **Support Management**: Handle tickets, assign agents, track resolution
- **Analytics**: Sales reports, user statistics, revenue tracking
- **CMS Management**: Edit static pages, manage content

## 🛠 Tech Stack

### Backend
- **Laravel 10+**: PHP framework with Inertia.js
- **MySQL**: Primary database
- **Spatie Packages**: Permissions, media library, activity log
- **NowPayments API**: Crypto payment processing
- **Laravel Sanctum**: API authentication

### Frontend
- **React 18+**: Modern React with hooks
- **Inertia.js**: SPA-like experience without API complexity
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Vite**: Fast build tool and dev server

## 📦 Installation

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 16+
- MySQL 8.0+
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/Muhammad-Abdullah-Developer/accszone-clone.git
cd accszone-clone
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### Step 3: Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE accszone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Update .env with database credentials
DB_DATABASE=accszone
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed
```

### Step 5: Storage Setup
```bash
# Create symbolic link for storage
php artisan storage:link

# Set permissions (Linux/Mac)
chmod -R 775 storage bootstrap/cache
```

### Step 6: Build Assets
```bash
# Development build
npm run dev

# Production build
npm run build
```

### Step 7: Start Development Server
```bash
# Start Laravel server
php artisan serve

# Start Vite dev server (in another terminal)
npm run dev
```

Visit `http://localhost:8000` to see the application.

## ⚙️ Configuration

### Environment Variables

Update `.env` file with your configuration:

```env
# Application
APP_NAME="ACCSZone"
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accszone
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=noreply@accszone.com

# NowPayments (Crypto Payments)
NOWPAYMENTS_API_KEY=your-api-key
NOWPAYMENTS_SANDBOX=true
NOWPAYMENTS_IPN_SECRET=your-ipn-secret

# Application Settings
DEFAULT_CURRENCY=USD
MIN_DEPOSIT_AMOUNT=10.00
REFERRAL_COMMISSION_RATE=5.0
```

### Default Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@accszone.com`
- Password: `password`

**Customer Account:**
- Email: `john@example.com`
- Password: `password`

## 📁 Project Structure

```
accszone-clone/
├── app/
│   ├── Http/Controllers/          # Controllers
│   ├── Models/                    # Eloquent models
│   ├── Policies/                  # Authorization policies
│   └── Services/                  # Business logic services
├── database/
│   ├── factories/                 # Model factories
│   ├── migrations/                # Database migrations
│   └── seeders/                   # Database seeders
├── resources/
│   ├── js/
│   │   ├── Components/            # Reusable React components
│   │   ├── Layouts/               # Page layouts
│   │   └── Pages/                 # Inertia.js pages
│   └── css/                       # Stylesheets
├── routes/
│   ├── web.php                    # Web routes
│   └── api.php                    # API routes
└── public/                        # Public assets
```

## 🔧 Key Components

### Models
- **User**: Customer/admin accounts with roles
- **Product**: Digital products with categories
- **Order**: Purchase orders with payment tracking
- **AccessCode**: Digital credentials for products
- **Transaction**: Financial transaction records
- **SupportTicket**: Customer support system

### Controllers
- **HomepageController**: Public pages and search
- **ProductController**: Product catalog and details
- **OrderController**: Purchase flow and checkout
- **Dashboard Controllers**: User dashboard features
- **Admin Controllers**: Administrative functions

### Features
- **Role-based Access**: Admin, customer, support roles
- **Crypto Payments**: NowPayments integration
- **Automated Delivery**: Instant digital product delivery
- **Inventory Management**: Stock tracking and updates
- **Support System**: Ticketing with file attachments
- **Referral System**: Commission-based referrals

## 🎨 Customization

### Branding
Update colors in `tailwind.config.js`:
```javascript
colors: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
}
```

### Logo and Images
Replace logos in `public/images/` directory and update references in components.

### Payment Methods
Configure additional payment gateways in `config/services.php` and create corresponding service classes.

## 🚀 Deployment

### Production Setup
1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure proper database credentials
4. Set up SSL certificate
5. Configure email service
6. Set up cron jobs for scheduled tasks
7. Configure file storage (AWS S3 recommended)

### Optimization
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### Queue Workers
Set up queue workers for background processing:
```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

## 🔒 Security

- CSRF protection enabled
- SQL injection prevention via Eloquent ORM
- XSS protection through proper input sanitization
- Role-based authorization system
- Rate limiting on sensitive endpoints
- Secure password hashing
- Optional 2FA support

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage

# Frontend tests (if implemented)
npm run test
```

## 📊 Monitoring

- Laravel Telescope (development)
- Laravel Horizon (queue monitoring)
- Activity logging via Spatie package
- Error tracking (Sentry recommended)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@accszone.com
- Documentation: [Wiki](wiki-url)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Automated fraud detection
- [ ] Subscription products
- [ ] Marketplace for sellers
- [ ] API for third-party integrations

---

Built with ❤️ using Laravel and React
