
# Pour demarrer le projet 

# 1) cloner
git clone https://github.com/ton-user/tunisian-chic.git
cd tunisian-chic

# 2) créer le .env à partir de .env.example et mettre ses valeurs
cp .env.example .env
# puis éditer .env

# 3) démarrer Postgres (voir Option D docker-compose plus bas) OU utiliser un Postgres existant

# 4) installer & migrer
npm install
npm run db:push       # crée le schéma
npm run db:seed       # insère les données de départ (optionnel)
npm run dev

#-----------------------------------------------------------------

# Tunisian Chic E-commerce Platform

Tunisian Chic is a modern e-commerce platform designed to showcase and sell premium Tunisian clothing and accessories. The platform is built with a focus on scalability, security, and user experience.

## Project Structure

The project follows a modular architecture with clear separation of concerns:

```
client/         # Frontend implementation
  ├── src/      # Source files
  │   ├── components/ # Reusable UI components
  │   ├── hooks/      # Custom React hooks
  │   └── pages/      # Page components
drizzle/        # Database migrations and schema management
server/         # Backend implementation
shared/         # Shared types and schema definitions
```

## Technologies Used

- Frontend:
  - React with TypeScript
  - Tailwind CSS for styling
  - Vite as the build tool

- Backend:
  - Node.js with TypeScript
  - Express.js for routing
  - Drizzle ORM for database operations


- Database:
  - PostgreSQL

## Features

- User authentication and authorization
- Product catalog with categories and tags
- Shopping cart functionality
- Secure payment processing
- Order management system
- File storage and image handling
- Responsive design

## Setup and Installation

### Prerequisites

- Node.js (v14.x or higher)
- PostgreSQL


### Steps

1. Clone the repository

```bash
git clone https://github.com/yourusername/tunisian-chic.git
cd tunisian-chic
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory (you can start from `.env.example`) with the following variables:

```env
DATABASE_URL=postgres://username:password@localhost:5432/tunisianchic
STRIPE_SECRET_KEY=your_stripe_secret_key
SESSION_SECRET=changeme
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PUBLIC_BASE_URL=http://localhost:5000
GOOGLE_CALLBACK_PATH=/api/callback
# SMTP configuration for contact form
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
CONTACT_RECIPIENT=contact@example.com
```

For deployments on Vercel, configure the `DATABASE_URL` environment variable in your project settings.

4. Run migrations

```bash
npx drizzle-kit push
```

5. Start the development server

```bash
npm run dev
```

## Production

To build and run the application in production:

```bash
npm run build
npm start
```

The Express server automatically listens on the port provided via `PORT` and serves the Vite build output from `dist/public`. A basic health check is exposed at `/api/health`.

### Deploying on Render


The included `render.yaml` provisions a free PostgreSQL database and configures the service to run `npm install && npm run build` during the build phase and `npm start` at runtime. Static assets are served from the prebuilt `dist/public` directory. If `DATABASE_URL` is not set, the server will still boot but only serve the static frontend; API routes remain disabled.


## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Authenticate user
- GET or POST `/api/logout` - Logout user
- GET `/api/auth/session` - Get current session

### Products

- GET `/api/products` - List all products
- GET `/api/products/:id` - Get product details
- POST `/api/products` - Create new product (admin only)
- PUT `/api/products/:id` - Update product (admin only)
- DELETE `/api/products/:id` - Delete product (admin only)

### Orders

- GET `/api/orders` - List user orders
- POST `/api/orders` - Create new order
- GET `/api/orders/:id` - Get order details
- PUT `/api/orders/:id` - Update order status (admin only)

### Categories

- GET `/api/categories` - List all categories
- POST `/api/categories` - Create new category (admin only)
- PUT `/api/categories/:id` - Update category (admin only)
- DELETE `/api/categories/:id` - Delete category (admin only)

## Database Schema

The database schema is defined in the `server/shared/schema.ts` file using Drizzle ORM. It includes tables for:

- Users
- Products
- Orders
- Categories
- Images
- Payment records

## Authentication

The platform uses JWT for authentication and role-based access control. User roles include:

- Customer
- Admin


## Contributing

Contributions are welcome! Please follow the contributing guidelines:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request


Thank you for using Tunisian Chic!
