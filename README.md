# Airdrops.geo - Cryptocurrency Airdrops Platform

A full-stack web application for posting and displaying cryptocurrency airdrops, inspired by airdrops.io. The application allows administrators to post airdrops and users to view them.

## Tech Stack

- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Project Structure

```
airdrops-geo/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   └── ...
├── server/                 # Backend Node.js/Express application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── ...
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd airdrops-geo
```

### 2. Set up the backend

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file with the following content
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/airdrops-geo

# Start the server
npm run dev
```

### 3. Set up the frontend

```bash
# Navigate to the client directory
cd ../client

# Install dependencies
npm install

# Start the development server
npm run dev
```

## API Endpoints

- **GET /api/airdrops**: Retrieve a list of all airdrops
- **GET /api/airdrops/:id**: Retrieve details of a single airdrop by its ID
- **POST /api/airdrops**: Add a new airdrop
- **PUT /api/airdrops/:id**: Update an existing airdrop
- **DELETE /api/airdrops/:id**: Delete an airdrop

## Features

- **Homepage**: Display a list of all airdrops with filtering options
- **Details Page**: Show full details of a single airdrop
- **Admin Page**: 
  - List all airdrops with edit/delete options
  - Form to add new airdrops
  - Form to edit existing airdrops

## License

MIT
