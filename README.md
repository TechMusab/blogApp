# Folio - A Modern Blog Application

Folio started as a simple project to learn modern web development, but it evolved into something much more - a full-stack blog application with a clean, responsive interface and a robust backend. This project has been a journey through React, ASP.NET Core, PostgreSQL, and various deployment challenges.

## 🚀 What Folio Is

Folio is a blog platform where users can discover, create, and discuss content. It's built with a modern tech stack and focuses on user experience, performance, and clean code. Think of it as a Medium-style blog platform but with a personal touch.

## ✨ Features

### For Readers
- **Browse & Discover**: Scroll through posts with category filtering and search functionality
- **Read & Engage**: Full article reading experience with like and comment features
- **Save for Later**: Bookmark posts to read later in your saved posts section
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **User Discovery**: Find and connect with other writers through the people discovery system
- **Friend System**: Send, accept, reject, and cancel friend requests to build your network
- **Social Engagement**: View posts from friends and manage your connections

### For Writers
- **Create Posts**: Rich text editor for writing blog posts with cover images
- **Manage Content**: View and manage all your published posts
- **User Profiles**: Customizable profiles with avatar uploads
- **Comment System**: Engage with readers through comments on your posts
- **Post Visibility**: Control who can see your posts (public, friends-only, private)
- **Friend Requests**: Manage incoming and outgoing friend requests
- **Network Building**: Grow your audience by connecting with other writers

### Behind the Scenes
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: OTP-based email verification for new users
- **Image Storage**: Cloudinary integration for production, local storage for development
- **PostgreSQL Database**: Robust relational database with Entity Framework Core
- **Docker Support**: Containerized deployment for easy scaling

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript for type safety
- **Vite** for lightning-fast development and builds
- **Redux Toolkit** for state management (it's been great for handling auth state and post data)
- **React Router** for client-side routing
- **Sass** for styling (I prefer it over plain CSS)
- **Prettier & ESLint** for code consistency

### Backend
- **ASP.NET Core 8.0** - The .NET ecosystem has been surprisingly pleasant to work with
- **Entity Framework Core** with PostgreSQL - After migrating from SQL Server, PostgreSQL has been much better for deployment
- **JWT Bearer Authentication** - Clean token-based auth implementation
- **Cloudinary** for image hosting in production
- **Resend** for email services (migrated from Brevo which had some issues)
- **Swagger/OpenAPI** for API documentation
- **Feature-Based Controllers** - Each controller handles a single responsibility for better maintainability
- **Service Layer Architecture** - Dedicated services for each feature following SOLID principles

### DevOps & Deployment
- **Docker** for containerization
- **Render** for hosting (both frontend and backend)
- **Neon PostgreSQL** for managed database hosting
- **Git** for version control 

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- .NET 8.0 SDK
- PostgreSQL (or use Neon for cloud database)
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
dotnet restore
dotnet build
```

You'll need to set up your environment variables. Create a `.env` file in the backend directory:

```env
ConnectionStrings__DefaultConnection=Host=localhost;Database=blogdb;Username=postgres;Password=your-password
Jwt__Key=your-super-secret-jwt-key-min-32-characters-long
Email__Provider=Resend
Resend__ApiKey=your-resend-api-key
Resend__FromEmail=your-email@example.com
Resend__FromName=Folio Blog
Cloudinary__CloudName=your-cloud-name
Cloudinary__ApiKey=your-cloudinary-api-key
Cloudinary__ApiSecret=your-cloudinary-api-secret
```

Run the backend:
```bash
dotnet run
```

The API will run on `http://localhost:8080`

## 🌐 API Endpoints

### Friend System
- `POST /api/friends/request` - Send a friend request
- `POST /api/friends/request/accept/{id}` - Accept a friend request
- `POST /api/friends/request/reject/{id}` - Reject a friend request
- `POST /api/friends/request/cancel/{id}` - Cancel a friend request
- `GET /api/friends` - Get list of friends
- `DELETE /api/friends/remove/{friendId}` - Remove a friend
- `GET /api/friends/requests/incoming` - Get incoming friend requests
- `GET /api/friends/requests/outgoing` - Get outgoing friend requests

### Posts
- `GET /api/posts` - Get all posts with filtering and pagination
- `GET /api/posts/{id}` - Get a specific post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/{id}` - Update a post
- `DELETE /api/posts/{id}` - Delete a post
- `GET /api/posts/search` - Search posts
- `GET /api/posts/your` - Get current user's posts

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-registration` - Verify registration with OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login

## 🏗️ Architecture

### Feature-Based Controller Design
The backend follows a feature-based controller architecture where each controller handles a single responsibility:

**Friends Module (8 Controllers):**
- `SendFriendRequestController` - Handles sending friend requests
- `AcceptFriendRequestController` - Handles accepting friend requests
- `RejectFriendRequestController` - Handles rejecting friend requests
- `CancelFriendRequestController` - Handles canceling friend requests
- `GetFriendsController` - Handles retrieving friends list
- `RemoveFriendController` - Handles removing friends
- `GetIncomingRequestsController` - Handles retrieving incoming requests
- `GetOutgoingRequestsController` - Handles retrieving outgoing requests

**Benefits:**
- Single Responsibility Principle - each controller has one job
- Better testability - easier to unit test individual controllers
- Improved maintainability - changes to one feature don't affect others
- Clear API structure - logical endpoint grouping

### Service Layer
Each controller has a corresponding service that implements business logic:
- Dedicated interfaces for each service
- Dependency injection for loose coupling
- Repository pattern for data access
- Clean separation of concerns

## 🗄️ Database Setup

I initially used SQL Server, but migrating to PostgreSQL made deployment much easier, especially with Neon's managed service. Here's how to set up the database:

1. Create a PostgreSQL database (locally or on Neon)
2. Update the connection string in your `.env` file
3. Run migrations:
```bash
cd backend
dotnet ef database update
```

The migration files are in the `backend/Migrations` directory.

## 🐳 Docker Deployment

The backend includes a Dockerfile for containerized deployment:

```bash
cd backend
docker build -t folio-backend .
docker run -p 8080:8080 folio-backend
```

For production deployment on Render, the Docker configuration handles the build and deployment automatically.

## 📝 Development Journey

This project has taught me a lot:

- **React 19 Migration**: Upgrading from React 18 had some challenges with the new hooks and concurrent features, but the performance improvements are worth it.
- **State Management**: Redux Toolkit made complex state management much more manageable than Context API for this size of application.
- **ASP.NET Core**: Coming from a JavaScript background, .NET felt different at first, but the dependency injection and middleware pipeline are actually quite elegant.
- **Database Migrations**: Entity Framework Core migrations are powerful, but I learned the hard way to be careful with schema changes in production.
- **Email Services**: Started with Brevo, but had reliability issues. Resend has been much more stable for transactional emails.
- **Deployment**: Moving from local development to cloud deployment taught me about environment variables, CORS, and the importance of proper configuration management.
- **Architecture Refactoring**: Recently refactored the monolithic FriendsController into 8 feature-based controllers with dedicated services, following the Single Responsibility Principle. This has made the codebase much more maintainable and testable.
- **Friend System Implementation**: Built a complete friend request system with send, accept, reject, cancel, and remove functionality, along with user discovery and filtering capabilities.

## 🔧 Common Issues & Solutions

### CORS Errors
If you're getting CORS errors, make sure your frontend URL is in the `AllowedOrigins` in `appsettings.Development.json` or set via environment variables.

### Database Connection Issues
Double-check your connection string format. PostgreSQL uses a different format than SQL Server:
```
Host=localhost;Database=blogdb;Username=postgres;Password=your-password
```

### JWT Token Issues
Make sure your JWT key is at least 32 characters long and the same across your frontend and backend configuration.

### Image Upload Issues
In development, images are stored locally in `wwwroot/uploads`. Make sure this directory exists and has proper write permissions.


## 📄 License

This project is open source and available for learning purposes.

## 🤝 Contributing

Feel free to fork this project and make it your own. If you find any bugs or have suggestions, I'd love to hear about them!

---

Built with ❤️ over many cups of coffee and late-night debugging sessions. This project represents my journey in modern web development, and I hope it helps others on their path too.
