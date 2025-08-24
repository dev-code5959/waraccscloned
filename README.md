# ACCSZone Clone - Digital Products Marketplace

A modern eCommerce platform tailored for the secure sale of digital goods, featuring crypto payments, automated delivery, and comprehensive admin controls.

## 🚀 Tech Stack

- **Backend**: Laravel 12.x (PHP 8.2+)
- **Frontend**: React 19.x with Inertia.js
- **Database**: MySQL/SQLite
- **Styling**: TailwindCSS 4.x
- **Payment**: NowPayments API (Crypto)
- **Build Tool**: Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Node.js** >= 18.x
- **Composer** >= 2.x
- **MySQL** >= 8.0 (or SQLite for development)
- **Git**

### Required PHP Extensions
```bash
php-mbstring
php-xml
php-openssl
php-pdo
php-tokenizer
php-json
php-curl
php-zip
php-gd
php-fileinfo
```

## 🛠 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd accszone-clone
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Environment Configuration
```bash
# Copy the environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Configure Environment Variables

cp .env.example .env

### 6. Database Setup

#### For MySQL:
```bash
# Create database
mysql -u root -p
CREATE DATABASE accszone_clone;
EXIT;

# Run migrations and seeders
php artisan migrate:fresh --seed
```

#### For SQLite (Development):
```bash
# Create SQLite database file
touch database/database.sqlite

# Run migrations and seeders
php artisan migrate:fresh --seed
```

### 7. Storage & Permissions
```bash
# Create symbolic link for storage
php artisan storage:link

# Set proper permissions (Linux/Mac)
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 🎯 Key Dependencies & Packages

### Laravel Packages
- **spatie/laravel-permission**: Role-based access control
- **spatie/laravel-medialibrary**: File/image upload management
- **spatie/laravel-activitylog**: Backend activity logging
- **inertiajs/inertia-laravel**: Server-side routing bridge
- **tightenco/ziggy**: Laravel routes in JavaScript

### React Packages
- **@inertiajs/react**: Frontend Inertia.js adapter
- **@headlessui/react**: Accessible UI components
- **lucide-react**: Modern icon library
- **react-hot-toast**: Toast notifications
- **clsx**: Conditional className utility

### Development Tools
- **laravel/pail**: Real-time log monitoring
- **concurrently**: Run multiple commands simultaneously

## 🏃‍♂️ Running the Application

### Development Mode (Recommended)

Use the built-in development script that runs all services concurrently:

```bash
composer run dev
```

This command will start:
- Laravel development server (http://localhost:8000)
- Queue worker for background jobs
- Real-time log monitoring
- Vite development server for hot reloading

### Manual Mode

If you prefer to run services individually:

```bash
# Terminal 1: Laravel Server
php artisan serve

# Terminal 2: Queue Worker
php artisan queue:work

# Terminal 3: Vite Development Server
npm run dev

# Terminal 4: Log Monitoring (Optional)
php artisan pail
```

### Production Build

```bash
# Build frontend assets
npm run build

# Configure web server (Apache/Nginx)
# Point document root to /public directory
```

## 📊 Default Accounts & Test Data

After running the seeders, you'll have access to:

### Admin Account
- **Email**: admin@accszone.com
- **Password**: password
- **Role**: Administrator

### Customer Account
- **Email**: customer@accszone.com
- **Password**: password
- **Role**: Customer

### Test Data Includes:
- Sample product categories (Gmail, Facebook, LinkedIn accounts)
- Products with access codes
- Sample orders and transactions
- Support tickets
- User roles and permissions

## 🔧 Configuration Files

### Key Configuration Files:
- `config/nowpayments.php` - NowPayments API settings
- `config/permission.php` - Role/permission settings
- `tailwind.config.js` - TailwindCSS configuration
- `vite.config.js` - Vite build configuration

## 📁 Project Structure

```
accszone-clone/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Admin panel controllers
│   │   ├── Auth/           # Authentication controllers
│   │   └── Dashboard/      # User dashboard controllers
│   ├── Models/             # Eloquent models
│   ├── Services/           # Business logic services
│   └── Notifications/      # Email notifications
├── database/
│   ├── migrations/         # Database migrations
│   ├── seeders/           # Data seeders
│   └── factories/         # Model factories
├── resources/
│   ├── js/
│   │   ├── Pages/         # React page components
│   │   └── Layouts/       # React layout components
│   └── views/             # Blade templates
├── routes/
│   ├── web.php           # Web routes
│   └── auth.php          # Auth routes
└── public/               # Public assets
```

## 🎨 Color Palette & Design

The application uses a carefully selected color palette:
- **Primary**: #1E1E2D (Dark Navy)
- **Secondary**: #2F80ED (Blue Accent)
- **Success**: #27AE60 (Green)
- **Warning**: #F2994A (Amber)
- **Danger**: #EB5757 (Red)
- **Neutral**: #BDBDBD (Light Gray)

## 🧪 Testing

```bash
# Run PHP tests
composer test

# Run with coverage
php artisan test --coverage
```

## 🔒 Security Features

- Role-based access control (Admin/Customer)
- Two-factor authentication support
- Secure payment processing via NowPayments
- Activity logging for all admin actions
- CSRF protection on all forms
- Input validation and sanitization

## 🚀 Deployment

### Production Checklist:
1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Configure proper database credentials
3. Set up SSL certificates
4. Configure web server (Apache/Nginx)
5. Set up cron job for Laravel scheduler:
   ```bash
   * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
   ```
6. Set up supervisor for queue workers
7. Configure NowPayments production API keys

### Web Server Configuration

#### Nginx Example:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/your/project/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 📞 Support & Troubleshooting

### Common Issues:

1. **Permission Errors**: Ensure proper file permissions on `storage/` and `bootstrap/cache/`
2. **Database Connection**: Verify database credentials and ensure database exists
3. **NPM Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. **Queue Jobs Not Processing**: Ensure queue worker is running: `php artisan queue:work`

### Useful Commands:
```bash
# Clear all caches
php artisan optimize:clear

# Restart queue workers
php artisan queue:restart

# Check application status
php artisan about

# View logs
php artisan pail

# Database refresh with seeders
php artisan migrate:fresh --seed
```

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Note**: This is a demo/educational project. Ensure proper security measures and compliance checks before using in production for real digital product sales.
