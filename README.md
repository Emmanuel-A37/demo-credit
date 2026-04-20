# Demo Credit API

Backend API for the Lendsqr Demo Credit assessment. The service supports user onboarding, wallet funding, wallet-to-wallet transfers, withdrawals, and transaction history with JWT-based authentication.

## Project Overview

This project implements a simplified wallet system where users can:

- Register and create a wallet automatically.
- Authenticate with email/password and receive a JWT token.
- Fund wallet balance.
- Transfer funds to another user by email.
- Withdraw from wallet.
- View wallet balance and transaction history.

The application uses MySQL with Knex migrations and applies database transactions plus row-level locking for wallet mutations.

## Features

- User registration and login.
- Adjutor Karma blacklist check during registration.
- Auto wallet creation on successful registration.
- Atomic wallet operations using `db.transaction(...)`.
- Row-level locking (`SELECT ... FOR UPDATE`) for funding, transfer, and withdrawal safety.
- Transaction ledger for all wallet mutations.
- Request validation with Joi.
- Centralized API response format.

## Tech Stack

- Node.js + TypeScript
- Express
- MySQL
- Knex
- JWT (`jsonwebtoken`)
- Joi
- Jest + ts-jest

## Architecture

- `controllers`: HTTP layer
- `services`: business logic
- `repositories`: data access
- `middlewares`: auth, validation, error handling
- `migrations`: schema management

## ER Diagram

![ER Diagram](https://dbdesigner.page.link/taMnVYdMEmU7BvYb7)

Core tables:

- `users`
- `wallets`
- `transactions`

## API Base URL

- Local: `http://localhost:3000`
- Versioned prefix: `/api/v1`

## Authentication

Protected wallet endpoints require:

`Authorization: Bearer <token>`

Token is returned by `POST /api/v1/auth/login`.

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=demo_credit

JWT_SECRET=replace_with_strong_secret
ADJUTOR_API_KEY=replace_with_adjutor_key
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create database(s)

```sql
CREATE DATABASE demo_credit;
CREATE DATABASE demo_credit_test;
```

### 3. Run migrations

```bash
npm run migrate:latest
```

### 4. Start development server

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

## Scripts

- `npm run dev` - Start dev server with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled build
- `npm run test` - Run unit tests
- `npm run migrate:latest` - Run latest migrations

## API Documentation

All responses follow a unified envelope:

```json
{
	"success": true,
	"message": "...",
	"data": {}
}
```

Error response:

```json
{
	"success": false,
	"message": "...",
	"data": null
}
```

### Auth Endpoints

#### Register

- `POST /api/v1/auth/register`

Request body:

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"phone": "08012345678",
	"bvn": "12345678901",
	"password": "password123"
}
```

Success response (201):

```json
{
	"success": true,
	"message": "Account created successfully.",
	"data": {
		"id": "uuid",
		"name": "John Doe",
		"email": "john@example.com",
		"phone": "08012345678",
		"bvn": "12345678901",
		"created_at": "...",
		"updated_at": "..."
	}
}
```

#### Login

- `POST /api/v1/auth/login`

Request body:

```json
{
	"email": "john@example.com",
	"password": "password123"
}
```

Success response:

```json
{
	"success": true,
	"message": "Login successful.",
	"data": {
		"token": "jwt_token",
		"safeUser": {
			"id": "uuid",
			"name": "John Doe",
			"email": "john@example.com",
			"phone": "08012345678",
			"bvn": "12345678901"
		}
	}
}
```

### Wallet Endpoints (Protected)

#### Get Balance

- `GET /api/v1/wallet/balance`

Success response:

```json
{
	"success": true,
	"message": "Balance retrieved successfully.",
	"data": {
		"balance": 1500
	}
}
```

#### Fund Wallet

- `POST /api/v1/wallet/fund`

Request body:

```json
{
	"amount": 1000
}
```

#### Transfer Funds

- `POST /api/v1/wallet/transfer`

Request body:

```json
{
	"recipient_email": "jane@example.com",
	"amount": 500
}
```

#### Withdraw Funds

- `POST /api/v1/wallet/withdraw`

Request body:

```json
{
	"amount": 200
}
```

#### Get Wallet Transactions

- `GET /api/v1/wallet/transactions`

Returns wallet transactions sorted by `created_at` descending.

## Validation Rules

- Register: valid email, phone length 11, BVN length 11, password min 8.
- Login: valid email, password min 8.
- Fund/Transfer/Withdraw amount: must be positive.
- Validation failures return `422`.

## Design Decisions

- **Transactional integrity:** Wallet mutations run inside DB transactions to prevent partial updates.
- **Concurrency safety:** Wallet records are fetched with row-level locks before balance updates.
- **Double-entry transfer record:** Transfer creates two transaction entries sharing one reference (sender debit, recipient credit).
- **Security baseline:** Passwords are hashed with bcrypt and protected routes require JWT.
- **Risk check on onboarding:** Registration checks Adjutor Karma and blocks blacklisted users.

## Testing

Run tests:

```bash
npm run test
```

Current test coverage is focused on unit tests for core services under `tests/unit`.



