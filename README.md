# Blog Application

A modern, full-stack blog application built with React, Node.js, and MongoDB. This application allows users to create, read, update, and delete blog posts, with features like authentication, comments, and likes.

## Features

- **User Authentication**
  - Sign up and login functionality
  - Protected routes for authenticated users
  - JWT-based authentication

- **Blog Management**
  - Create, read, update, and delete blog posts
  - Rich text content support
  - Image upload capability
  - Post categorization and tags

- **Social Features**
  - Like posts
  - Comment on posts
  - View post statistics
  - User profiles

- **Admin Dashboard**
  - Manage all blog posts
  - User management
  - Analytics and insights

- **Responsive Design**
  - Mobile-friendly interface
  - Modern UI with Tailwind CSS
  - Smooth animations and transitions

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- React Icons for icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Multer for file uploads

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BlogApplication
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Configure Backend Environment (Development)

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blogapp
JWT_SECRET=your_development_jwt_secret
NODE_ENV=development
```

### 4. Install Frontend Dependencies

```bash
cd FrontEnd
npm install
```

### 5. Configure Frontend Environment (Development)

Create a `.env` file in the FrontEnd directory with the following variables:

```env
VITE_API_URL=http://localhost:3000
```

### 6. Start Development Servers

#### Start the Backend Server

```bash
npm run dev
```

#### Start the Frontend Server

```bash
cd FrontEnd
npm run dev
```

The development application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Production Setup

### 1. Backend Configuration

Create a `.env` file in the root directory with production values:

```env
PORT=3000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
```

### 2. Frontend Configuration

Create a `.env.production` file in the FrontEnd directory:

```env
VITE_API_URL=https://your-production-api-url.com
```

### 3. Build and Deploy

#### Build Frontend

```bash
cd FrontEnd
npm run build
```

The build output will be in the `dist` directory.

#### Deploy Backend

```bash
npm install --production
npm start
```

### 4. Production Environment Variables

Make sure to set these environment variables in your production environment:

```bash
# Backend
export PORT=3000
export MONGODB_URI=your_production_mongodb_uri
export JWT_SECRET=your_production_jwt_secret
export NODE_ENV=production

# Frontend (if using a build tool that requires these)
export VITE_API_URL=https://your-production-api-url.com
```

### 5. Production Considerations

- Use a process manager like PM2 for Node.js applications
- Set up proper SSL certificates
- Configure proper CORS settings
- Set up proper logging and monitoring
- Use a CDN for static assets
- Implement proper security headers
- Set up automated backups for the database

## Project Structure

```
BlogApplication/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env
│   └── server.js
├── FrontEnd/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
└── README.md
```

## API Documentation

The backend API provides the following endpoints:

### Authentication
- POST /api/signup - Register a new user
- POST /api/login - Login user
- GET /api/logout - Logout user

### Posts
- GET /api/posts - Get all posts
- GET /api/posts/:id - Get a specific post
- POST /api/posts - Create a new post
- PUT /api/posts/:id - Update a post
- DELETE /api/posts/:id - Delete a post

### Comments
- POST /api/posts/:id/comments - Add a comment to a post
- GET /api/posts/:id/comments - Get comments for a post

### Likes
- POST /api/posts/:id/like - Like/unlike a post

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
