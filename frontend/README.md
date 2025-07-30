# E-commerce Application

A comprehensive full-stack e-commerce application built with Django REST Framework and React TypeScript.

## Features

### Backend (Django REST Framework)
- **Authentication**: JWT-based authentication with role-based permissions
- **User Management**: Customer and Admin user roles
- **Product Management**: CRUD operations with image uploads
- **Shopping Cart**: Add, update, remove items with persistent storage
- **Order Management**: Complete order processing with status tracking
- **Payment Integration**: Stripe integration with mock payment fallback
- **PDF Receipts**: Automatic PDF generation for order receipts
- **Background Tasks**: Celery integration for email notifications
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Unit Tests**: Test coverage for critical functionality

### Frontend (React TypeScript)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **State Management**: Redux Toolkit for predictable state management
- **Authentication**: Secure login/registration with JWT tokens
- **Product Catalog**: Browse products with search and filtering
- **Shopping Cart**: Real-time cart updates with quantity management
- **Checkout Flow**: Multi-step checkout with payment integration
- **Order History**: View past orders with PDF receipt downloads
- **Admin Dashboard**: Product and order management interface
- **Responsive Design**: Mobile-first approach with modern animations

## Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- Redis (for Celery)
- Celery (background tasks)
- Stripe (payments)
- ReportLab (PDF generation)
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- React Hook Form
- React Toastify

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis

### Manual Setup

#### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-app
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database setup**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Create sample data** (optional)
   ```bash
   python manage.py loaddata fixtures/sample_data.json
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

8. **Start Celery worker** (new terminal)
   ```bash
   celery -A ecommerce worker --loglevel=info
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Setup

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Run migrations** (in a new terminal)
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/swagger/

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user profile
- `PUT /api/auth/profile/` - Update user profile

### Product Endpoints
- `GET /api/products/` - List products (with pagination, search, filter)
- `POST /api/products/` - Create product (admin/owner only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product (admin/owner only)
- `DELETE /api/products/{id}/` - Delete product (admin/owner only)
- `GET /api/products/categories/` - List categories
- `GET /api/products/featured/` - Get featured products

### Cart Endpoints
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/add/` - Add item to cart
- `PUT /api/cart/update/{item_id}/` - Update cart item quantity
- `DELETE /api/cart/remove/{item_id}/` - Remove item from cart
- `DELETE /api/cart/clear/` - Clear entire cart

### Order Endpoints
- `GET /api/orders/` - List user's orders
- `POST /api/orders/create/` - Create new order
- `GET /api/orders/{id}/` - Get order details
- `POST /api/orders/{id}/cancel/` - Cancel order
- `GET /api/orders/{id}/receipt-pdf/` - Download PDF receipt

### Admin Endpoints
- `GET /api/orders/admin/all/` - Get all orders (admin only)
- `PUT /api/orders/admin/{id}/status/` - Update order status (admin only)

## Demo Credentials

### Admin User
- Email: admin@example.com
- Password: admin123

### Customer User
- Email: customer@example.com
- Password: customer123

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Production Environment Variables
```bash
# Backend (.env)
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
REDIS_URL=redis://host:port/0
STRIPE_SECRET_KEY=sk_live_your_stripe_key
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password

# Frontend (.env.production)
REACT_APP_API_URL=https://api.yourdomain.com
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yourdomain.com or create an issue in the repository.