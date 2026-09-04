# E-Commerce Platform - Server

This is the backend server for a full-stack E-Commerce Platform built with Node.js, Express.js, MongoDB, and Stripe.

The server provides RESTful APIs for product management, user management, order management, product reviews, Stripe payments, and inventory management.

## Features

* Product Management
* Add Products
* View All Products
* View Product Details
* Update Products
* Delete Products
* User Management
* Customer and Admin Role Management
* Order Creation
* Customer Order History
* Order Status Management
* Product Stock Management
* Automatic Stock Decrease After Successful Order
* Stripe Test Payment Integration
* Product Reviews and Ratings
* Admin Order Management
* MongoDB Atlas Integration
* RESTful API
* CORS Support
* Environment Variable Configuration

## Technologies Used

* Node.js
* Express.js
* MongoDB
* MongoDB Atlas
* Stripe
* CORS
* dotenv
* JavaScript

## Database Collections

The project uses the following MongoDB collections:

* `products`
* `users`
* `orders`
* `reviews`

## API Endpoints

### Products

GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id

### Users
GET    /users?email=user@email.com
POST   /users
GET    /all-users

### Orders
POST   /orders
GET    /orders?email=user@email.com
PUT    /orders/:id
GET    /admin/orders

### Reviews
GET    /reviews/:productId
POST   /reviews


### Stripe Payment
POST   /create-payment-intent

## Project Structure

e-commerce-server/
├── index.js
├── .gitignore
├── package.json
└── README.md

## Environment Variables

Create a `.env` file in the server project and add the following variables:

DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=3000

Never upload the real `.env` file or secret keys to GitHub.

## Installation

### Clone the Repository

git clone YOUR_SERVER_GITHUB_REPOSITORY_URL

### Go to the Project Directory

cd e-commerce-server

### Install Dependencies

npm install

### Run the Server


nodemon  index.js

For development with Nodemon:

nodemon index.js

The server will run locally at:

http://localhost:3000

## Stripe Test Payment

This project uses Stripe in test mode.

### Test Card

* Card Number: `4242 4242 4242 4242`
* Expiry Date: Any future date
* CVC: Any 3 digits
* ZIP: Any valid ZIP code

Do not use real card information while testing.

## Inventory Management

When an order is successfully created, the purchased product quantity is automatically deducted from the available stock.

The server also checks product availability before creating an order.

## Order Management

Customers can:

* Place orders
* View their order history
* Track order status

Admins can:

* View all customer orders
* View ordered products
* View order totals
* Update order status

Available order statuses:

* Pending
* Processing
* Shipped
* Delivered
* Cancelled

## Product Reviews

Customers can submit reviews and ratings for products.

Each review contains:

* Product ID
* Customer email
* Rating
* Review comment
* Review creation date

## Deployment

The backend server is deployed using Vercel.

### Live Server

YOUR_VERCEL_SERVER_URL

## Client Repository

YOUR_CLIENT_GITHUB_REPOSITORY_URL

## Client Live Website

YOUR_NETLIFY_LIVE_URL

## Author

**Bibi Fatema Saima**

MERN Stack Developer
