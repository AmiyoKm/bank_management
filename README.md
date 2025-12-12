# Bank Management API

![CI](https://github.com/AmiyoKm/bank_management/actions/workflows/ci.yml/badge.svg)

This is a comprehensive Bank Management API that provides functionalities for managing users, accounts, transactions, loans, and fixed deposits.

## Tech Stack

-   **Backend:** Node.js, Express.js, TypeScript
-   **ORM:** Prisma
-   **Database:** PostgreSQL
-   **Cache:** Redis
-   **Authentication:** JWT (JSON Web Tokens)
-   **Validation:** Zod

## API Documentation

For detailed API documentation and testing, visit our Postman workspace:
[Bank Management API Documentation](https://mission-geoscientist-60480210-230832.postman.co/workspace/Amiyo's-Workspace~e91c4e80-447c-45d5-8893-81c8706e6814/collection/47007306-0b16edb7-943f-44a4-a8b5-047ab43f7cc8?action=share&source=copy-link&creator=47007306)

## How to Start

### With Docker (Recommended)

> ⚠️ **Important Prerequisite:**
> To use this setup, ensure you have **Docker** and **Docker Compose** installed on your machine.
>
> If you haven't installed them yet, please visit [Docker's official installation guide](https://docs.docker.com/get-docker/) before proceeding.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AmiyoKm/bank_management.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd bank_management
    ```
3.  **Run the application:**
    ```bash
    docker-compose up --build -d
    ```
    The application will be available at `http://localhost:8080`.
    The prisma database dashboard will be available at `http://localhost:51212`.

### Locally with Node.js and PostgreSQL

1.  **Prerequisites:**

    -   Node.js (v22 or higher)
    -   PostgreSQL
    -   Redis

2.  **Clone the repository:**

    ```bash
    git clone https://github.com/AmiyoKm/bank_management.git
    ```

3.  **Navigate to the project directory:**

    ```bash
    cd bank_management
    ```

4.  **Install dependencies:**

    ```bash
    npm install
    ```

5.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following, replacing the placeholder values with your PostgreSQL credentials:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    JWT_SECRET="your_jwt_secret"
    REDIS_URL="redis://localhost:6379"
    ```

    -   **USER**: Your PostgreSQL username
    -   **PASSWORD**: Your PostgreSQL password
    -   **HOST**: `localhost`
    -   **PORT**: `5432` (or your PostgreSQL port)
    -   **DATABASE**: The name of your database

6.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

7.  **Start Redis server:**

    Make sure Redis is running on your local machine. If you have Redis installed, start it with:

    ```bash
    redis-server
    ```

    Or if you prefer using Docker for Redis only:

    ```bash
    docker run -d -p 6379:6379 redis:alpine
    ```

8.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.

## API Routes

The API is structured into several resources. All routes are prefixed with `/v1`.

### Auth

| Method | Endpoint         | Description                                      | Permissions        |
| ------ | ---------------- | ------------------------------------------------ | ------------------ |
| POST   | `/auth/register` | Register a new user.                             | Public             |
| POST   | `/auth/login`    | Login and receive a JWT token.                   | Public             |
| GET    | `/auth/me`       | Get details of the currently authenticated user. | Authenticated User |

### Users

| Method | Endpoint     | Description          | Permissions |
| ------ | ------------ | -------------------- | ----------- |
| GET    | `/users`     | Get all users.       | Admin       |
| POST   | `/users`     | Create a new user.   | Admin       |
| GET    | `/users/:id` | Get a user by ID.    | Admin       |
| PATCH  | `/users/:id` | Update a user by ID. | Admin       |
| DELETE | `/users/:id` | Delete a user by ID. | Admin       |

### Accounts

| Method | Endpoint        | Description                              | Permissions         |
| ------ | --------------- | ---------------------------------------- | ------------------- |
| POST   | `/accounts`     | Create a new bank account.               | Authenticated User  |
| GET    | `/accounts`     | Get all bank accounts in the system.     | Admin, Staff        |
| GET    | `/accounts/me`  | Get all accounts for the logged-in user. | Authenticated User  |
| GET    | `/accounts/:id` | Get account details by ID.               | Owner, Admin, Staff |
| PATCH  | `/accounts/:id` | Update account details by ID.            | Admin, Staff        |
| DELETE | `/accounts/:id` | Delete an account by ID.                 | Admin               |

### Transactions

| Method | Endpoint                          | Description                                     | Permissions        |
| ------ | --------------------------------- | ----------------------------------------------- | ------------------ |
| GET    | `/transactions`                   | Get transactions (filtered by account or user). | Authenticated User |
| GET    | `/transactions/:id`               | Get a transaction by ID.                        | Authenticated User |
| POST   | `/transactions/deposit`           | Deposit money into an account.                  | Authenticated User |
| POST   | `/transactions/withdraw`          | Withdraw money from an account.                 | Authenticated User |
| POST   | `/transactions/transfer`          | Transfer money between the user's own accounts. | Authenticated User |
| POST   | `/transactions/transfer/external` | Transfer money to another user's account.       | Authenticated User |

### Loans

| Method | Endpoint              | Description                                | Permissions         |
| ------ | --------------------- | ------------------------------------------ | ------------------- |
| GET    | `/loans`              | Get all loans in the system.               | Admin, Staff        |
| GET    | `/loans/me`           | Get all loans for the logged-in user.      | Authenticated User  |
| POST   | `/loans/apply`        | Apply for a new loan.                      | Authenticated User  |
| GET    | `/loans/:id`          | Get loan details by ID.                    | Owner, Admin, Staff |
| PATCH  | `/loans/:id/status`   | Update loan status (e.g., approve/reject). | Admin, Staff        |
| POST   | `/loans/:id/repay`    | Repay a loan installment.                  | Owner               |
| GET    | `/loans/:id/schedule` | Get the loan repayment schedule.           | Owner, Admin, Staff |
| GET    | `/loans/:id/payments` | Get the loan's payment history.            | Owner, Admin, Staff |

### Fixed Deposits

| Method | Endpoint                          | Description                                    | Permissions         |
| ------ | --------------------------------- | ---------------------------------------------- | ------------------- |
| GET    | `/fixed-deposit`                  | Get all fixed deposits in the system.          | Admin, Staff        |
| POST   | `/fixed-deposit`                  | Create a new fixed deposit.                    | Authenticated User  |
| GET    | `/fixed-deposit/me`               | Get all fixed deposits for the logged-in user. | Authenticated User  |
| GET    | `/fixed-deposit/:id`              | Get fixed deposit details by ID.               | Owner, Admin, Staff |
| POST   | `/fixed-deposit/process-maturity` | Process maturity for all due fixed deposits.   | Admin, Staff        |

### Reports

| Method | Endpoint                         | Description                         | Permissions         |
| ------ | -------------------------------- | ----------------------------------- | ------------------- |
| GET    | `/reports/statements/:accountId` | Get an account statement.           | Owner, Admin, Staff |
| GET    | `/reports/admin/summary`         | Get a summary report for the admin. | Admin               |


## Production

The API is deployed and accessible at:
[https://bank-management-p9km.onrender.com/](https://bank-management-p9km.onrender.com/)

## Docker Image

The official Docker image is available at:
[https://hub.docker.com/r/amiyokm/bank_management](https://hub.docker.com/r/amiyokm/bank_management)
