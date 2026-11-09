# TransactIQ — Transaction Management System

A lightweight transaction management system for viewing and recording financial transactions.

The application uses **Node.js and Express** for the backend, **Vanilla JavaScript and Tailwind CSS** for the frontend, and a local **CSV file** for persistent data storage.

## Table of Contents

1. [System Overview](#system-overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Using the Application](#using-the-application)
9. [API Documentation](#api-documentation)
10. [Testing](#testing)
11. [Design Decisions and Limitations](#design-decisions-and-limitations)
12. [AI Usage Note](#ai-usage-note)

---

## System Overview

| Layer | Technology |
|---|---|
| Backend | Node.js v18+, Express |
| Frontend | HTML5, Tailwind CSS, Vanilla JavaScript |
| Data Storage | Local CSV file |
| CSV Parser | csv-parser |
| Development Tool | Nodemon |
| Testing | Node.js built-in test runner |
| Default Port | 3000 |

The application uses a single Express server to serve both the REST API and the frontend.

Transaction data is stored in:

```text
data/transactions.csv
```

On startup, the application automatically creates the data directory and CSV file if they do not already exist.

---

## Features

### Transaction Management

- View all transactions stored in the CSV file.
- Add new transactions through a modal form.
- Automatically assign a random transaction status:
  - Pending
  - Settled
  - Failed
- Display transactions in a responsive table.
- Generate a unique Transaction ID for each transaction.

### Search and Filtering

- Search transactions by:
  - Transaction ID
  - Account holder name
  - Account number
- Filter transactions by status.

### Validation

Both the frontend and backend validate transaction data.

Validation includes:

- Valid transaction dates using the `YYYY-MM-DD` format.
- Real calendar date validation.
- Account number format: `1234-5678-9012`.
- Account holder names between 2 and 100 characters.
- Positive amounts with up to two decimal places.
- Maximum transaction amount of 10,000,000.
- Transaction dates cannot be in the future.
- Transaction dates cannot be older than five years.

### Additional Error Handling

- Duplicate transaction detection.
- Structured field-level validation errors.
- Request body size protection.
- Invalid JSON error handling.
- CSV injection protection.
- Serialized write operations to reduce race conditions during concurrent requests.

---

## Prerequisites

Before running the application, install the following software.

### 1. Node.js

The application requires **Node.js version 18 or later**.

Node.js includes npm, which is used to install the project's dependencies.

Download Node.js from:

https://nodejs.org/

Choose the **LTS (Long-Term Support)** version unless you have a specific reason to use another version.

### Verify Node.js Installation

Open a terminal or command prompt and run:

```bash
node --version
npm --version
```

You should see version numbers displayed.

The Node.js version should be:

```text
v18.x.x or later
```

### Opening a Terminal

**Windows**

Press `Win + R`, type:

```text
cmd
```

Then press Enter.

You can also use the integrated terminal in Visual Studio Code by selecting:

```text
Terminal → New Terminal
```

**macOS**

Open the Terminal application.

**Linux**

Open your preferred terminal application.

---

## Project Structure

The project should have the following structure:

```text
Transaction Management System/
│
├── data/
│   └── transactions.csv
│
├── node_modules/
│
├── public/
│   └── index.html
│
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── server.js
└── test.js
```

### File Descriptions

| File or Folder | Description |
|---|---|
| `data/transactions.csv` | Stores all transaction records |
| `public/index.html` | Frontend application |
| `server.js` | Express server and API implementation |
| `test.js` | Automated validation tests |
| `package.json` | Project dependencies and npm scripts |
| `README.md` | Project documentation |
| `.gitignore` | Specifies files excluded from Git tracking |

The `node_modules` folder is created automatically after running:

```bash
npm install
```

---

## Installation

Follow these steps to set up the application.

### Step 1 — Download or Clone the Project

If you received the project as a ZIP file:

1. Download the ZIP file.
2. Extract it to a location on your computer.
3. Open the extracted project folder.

If the project is stored in a Git repository, clone it using:

```bash
git clone https://github.com/EarlMendillo/first-circle-assesment-transaction-management-system.git
```

Then navigate into the project folder:

```bash
cd first-circle-assesment-transaction-management-system
```

### Step 2 — Open the Project Folder

If you are using Visual Studio Code:

1. Open Visual Studio Code.
2. Select **File → Open Folder**.
3. Select the `Transaction Management System` folder.
4. Open the integrated terminal using:

```text
Terminal → New Terminal
```

Make sure the terminal is currently inside the project folder.

### Step 3 — Install Dependencies

Run:

```bash
npm install
```

This installs the required dependencies:

- Express
- CORS
- csv-parser
- Nodemon for development mode

After installation, npm creates the `node_modules` folder.

---

## Configuration

The application does not require any environment variables for normal use.

By default, the server runs on port:

```text
3000
```

You can change the port by setting the `PORT` environment variable.

For example, on Windows Command Prompt:

```bash
set PORT=4000
npm start
```

On macOS or Linux:

```bash
PORT=4000 npm start
```

If no `PORT` variable is provided, the application uses port `3000`.

---

## Running the Application

### Start the Server

From the project folder, run:

```bash
npm start
```

You should see output similar to:

```text
Transaction API running at http://localhost:3000
GET  /transactions — list all
POST /transactions — add new
```

### Open the Application

Open a web browser and visit:

```text
http://localhost:3000
```

The application will load the transaction management interface.

### Stop the Server

To stop the server, return to the terminal where it is running and press:

```text
Ctrl + C
```

---

## Development Mode

If you are making changes to `server.js`, you can use development mode.

Run:

```bash
npm run dev
```

This uses Nodemon to automatically restart the server when server-side files are changed.

---

## Using the Application

### Viewing Transactions

When the application loads, it retrieves transactions from the API and displays them in a table.

The table includes:

- Transaction ID
- Transaction Date
- Account Number
- Account Holder Name
- Amount
- Status

Transaction IDs can be copied to the clipboard by clicking the ID or using the **Copy ID** button.

### Transaction Status Colors

The application uses color-coded status badges:

| Status | Color |
|---|---|
| Pending | Yellow |
| Settled | Green |
| Failed | Red |

### Searching Transactions

Use the search box to search for transactions by:

- Transaction ID
- Account holder name
- Account number

The table updates as you type.

### Filtering by Status

Use the status dropdown to display:

- All Statuses
- Settled
- Pending
- Failed

### Adding a Transaction

To add a transaction:

1. Click **Add Transaction**.
2. Enter the transaction date.
3. Enter the transaction amount.
4. Enter a 12-digit account number using the format:

```text
1234-5678-9012
```

5. Enter the account holder's name.
6. Click **Save Transaction**.

The server will:

1. Validate the submitted information.
2. Check for a duplicate transaction.
3. Generate a unique Transaction ID.
4. Randomly assign a status of Pending, Settled, or Failed.
5. Save the transaction to the CSV file.

The new transaction will appear in the table immediately after it is successfully saved.

### Duplicate Transactions

A transaction is considered a potential duplicate when an existing transaction has the same:

- Transaction date
- Account number
- Amount

The API returns a `409 Conflict` response when a duplicate is detected.

The frontend displays a confirmation prompt allowing the user to either cancel or add the transaction anyway.

---

# API Documentation

The REST API is served from the same Express application as the frontend.

Base URL:

```text
http://localhost:3000
```

---

## GET /transactions

Retrieves all transactions stored in the CSV file.

### Request

```http
GET /transactions
```

### Example

```text
http://localhost:3000/transactions
```

No request body or parameters are required.

### Success Response

**Status: `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": "TXN-A1B2C3D4",
      "date": "2025-03-01",
      "accountNumber": "7289-3445-1121",
      "accountHolder": "Maria Johnson",
      "amount": 150,
      "status": "Settled"
    }
  ]
}
```

### Error Response

**Status: `500 Internal Server Error`**

```json
{
  "success": false,
  "message": "Failed to read transactions."
}
```

---

## POST /transactions

Adds a new transaction to the CSV file.

The server automatically:

- Generates a Transaction ID.
- Randomly assigns a status.

### Request

```http
POST /transactions
Content-Type: application/json
```

### Request Body

```json
{
  "date": "2025-04-15",
  "accountNumber": "1111-2222-3333",
  "accountHolder": "Jane Doe",
  "amount": 299.99
}
```

### Request Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `date` | string | Yes | Transaction date in `YYYY-MM-DD` format |
| `accountNumber` | string | Yes | Account number in `1234-5678-9012` format |
| `accountHolder` | string | Yes | Account holder's name |
| `amount` | number or string | Yes | Positive amount with up to two decimal places |
| `allowDuplicate` | boolean | No | Allows a detected duplicate transaction to be saved |

### Success Response

**Status: `201 Created`**

```json
{
  "success": true,
  "data": {
    "id": "TXN-A1B2C3D4",
    "date": "2025-04-15",
    "accountNumber": "1111-2222-3333",
    "accountHolder": "Jane Doe",
    "amount": 299.99,
    "status": "Settled"
  }
}
```

The status shown in the example is only an example. The actual status is randomly selected by the server.

---

## Validation Error

If submitted data is invalid, the API returns:

**Status: `400 Bad Request`**

Example:

```json
{
  "success": false,
  "message": "Account number must be 12 digits in the format 1234-5678-9012.",
  "errors": {
    "accountNumber": "Account number must be 12 digits in the format 1234-5678-9012."
  }
}
```

The `errors` object allows the frontend to display validation messages beside the appropriate form fields.

---

## Duplicate Transaction Error

If a duplicate transaction is detected:

**Status: `409 Conflict`**

```json
{
  "success": false,
  "code": "DUPLICATE",
  "message": "A transaction with the same date, account number and amount already exists."
}
```

To intentionally save the transaction despite the duplicate warning, submit the request with:

```json
{
  "date": "2025-04-15",
  "accountNumber": "1111-2222-3333",
  "accountHolder": "Jane Doe",
  "amount": 299.99,
  "allowDuplicate": true
}
```

---

## Request Body Too Large

If the request body exceeds the configured size limit:

**Status: `413 Payload Too Large`**

```json
{
  "success": false,
  "message": "Request body is too large."
}
```

---

## Invalid JSON

If the request body contains invalid JSON:

**Status: `400 Bad Request`**

```json
{
  "success": false,
  "message": "Request body must be valid JSON."
}
```

---

# Testing

The project includes both automated and manual testing options.

## Automated Testing

The application uses Node.js's built-in test runner, so no additional testing framework is required.

Run:

```bash
npm test
```

The automated tests verify:

- Valid calendar dates.
- Invalid calendar dates.
- Date format validation.
- Account number format validation.
- Positive amount validation.
- Valid transaction data processing.

A successful test run should show all tests passing.

> **Note:** The `test.js` file and the `"test": "node --test"` script must be present in the project for this command to work.

---

## Manual Testing Through the Browser

1. Start the server:

```bash
npm start
```

2. Open:

```text
http://localhost:3000
```

3. Confirm that the transaction table loads successfully.
4. Click **Add Transaction**.
5. Enter valid transaction information.
6. Click **Save Transaction**.
7. Confirm that the new transaction appears in the table.
8. Verify that a random status is assigned.
9. Test the search box.
10. Test the status filter.
11. Click a Transaction ID and verify that it can be copied.

### Validation Testing

Try submitting invalid information, such as:

- An invalid account number.
- A negative amount.
- An amount with more than two decimal places.
- An invalid date.
- A future date.
- An empty account holder name.

The application should display validation errors.

### Duplicate Testing

Add a transaction, then attempt to add another transaction with the same:

- Date
- Account number
- Amount

The application should display a duplicate confirmation prompt.

---

## Testing the API with curl

You can also test the API directly from the command line.

### List All Transactions

```bash
curl http://localhost:3000/transactions
```

### Add a Transaction

On macOS or Linux:

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-04-20",
    "accountNumber": "9999-8888-7777",
    "accountHolder": "Test User",
    "amount": 42.00
  }'
```

---

## Testing the API with Postman or Another API Tool

You can also test the API using an application such as Postman.

### Test GET

1. Create a new request.
2. Select the `GET` method.
3. Enter:

```text
http://localhost:3000/transactions
```

4. Click **Send**.

### Test POST

1. Create a new request.
2. Select the `POST` method.
3. Enter:

```text
http://localhost:3000/transactions
```

4. Set the request body type to JSON.
5. Enter:

```json
{
  "date": "2025-04-20",
  "accountNumber": "9999-8888-7777",
  "accountHolder": "Test User",
  "amount": 42.00
}
```

6. Click **Send**.

A successful request should return a `201 Created` response.

---

# Data Storage

Transactions are stored in:

```text
data/transactions.csv
```

The CSV file contains the following columns:

```text
Transaction ID
Transaction Date
Account Number
Account Holder Name
Amount
Status
```

The server automatically creates the data directory and CSV headers if they do not exist.

It also supports migrating an older CSV format that does not contain the `Transaction ID` column by generating IDs for existing records.

### Data Persistence

After adding a transaction, the new record is appended to the CSV file.

To verify persistence:

1. Add a transaction through the application.
2. Open `data/transactions.csv`.
3. Confirm that the new transaction appears in the file.
4. Stop and restart the server.
5. Refresh the application and confirm that the transaction is still displayed.

---

# Design Decisions and Limitations

| Decision | Reason | Limitation |
|---|---|---|
| CSV file storage | Simple and easy to review for a small assessment project | Not ideal for large datasets or complex queries |
| Express backend | Lightweight and widely used for REST APIs | Requires a separate database solution for larger production systems |
| In-process write queue | Helps serialize concurrent writes within one server process | Does not provide distributed locking across multiple server instances |
| Random status assignment | Matches the assessment requirement | Does not represent a real transaction processing workflow |
| Client-side search and filtering | Simple and responsive for small datasets | Large datasets would benefit from server-side filtering and pagination |
| Floating-point amounts | Easy to work with for this assessment | Production financial systems commonly use integer cents or a decimal library |

This project is designed as a lightweight transaction management system for demonstration and assessment purposes.

---

# AI Usage Note

AI tools were used as a development aid during this project.

They assisted with:

- Reviewing the project structure.
- Generating and refining portions of the backend and frontend code.
- Identifying validation and error-handling edge cases.
- Improving documentation.
- Reviewing code consistency and potential improvements.

All generated or suggested code was reviewed and adjusted before inclusion in the project. The final implementation was tested by the developer to ensure that it aligned with the project requirements.