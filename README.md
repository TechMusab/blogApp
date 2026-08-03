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

### For Writers
- **Create Posts**: Rich text editor for writing blog posts with cover images
- **Manage Content**: View and manage all your published posts
- **User Profiles**: Customizable profiles with avatar uploads
- **Comment System**: Engage with readers through comments on your posts

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

### DevOps & Deployment
- **Docker** for containerization
- **Render** for hosting (both frontend and backend)
- **Neon PostgreSQL** for managed database hosting
- **Git** for version control (with some learning curve on force pushes 😅)

## 📁 Project Structure

```
blogApp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/          # Page components (Dashboard, Login, CreatePost, etc.)
│   │   ├── shared/         # Reusable components (Avatar, Buttons, etc.)
│   │   ├── layouts/        # Layout components
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # ASP.NET Core API
│   ├── controllers/        # API endpoints
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── models/            # Database models
│   ├── DTOs/              # Data transfer objects
│   ├── Middleware/        # Custom middleware (logging, error handling)
│   ├── Configuration/     # Configuration classes
│   └── Program.cs         # Application entry point
└── README.md
```

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

## 🔐 Authentication Flow

The authentication system uses JWT tokens with email verification:

1. **Registration**: User signs up with email and password
2. **OTP Verification**: System sends a 6-digit OTP via email
3. **Account Activation**: User verifies OTP to activate account
4. **Login**: User receives JWT token upon successful login
5. **Protected Routes**: Frontend includes JWT token in Authorization header

In development, the OTP is returned in the response for easier testing (never do this in production!).

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

## 🚧 Future Improvements

There's always more to add:

- [ ] Refresh token implementation for better security
- [ ] Rich text editor with more formatting options
- [ ] User follow/follower system
- [ ] Post categories and tags management
- [ ] Dark mode (partially implemented)
- [ ] Email notifications for comments and likes
- [ ] Post analytics and view counts
- [ ] SEO optimization
- [ ] Performance optimization with caching

## 📄 License

This project is open source and available for learning purposes.

## 🤝 Contributing

Feel free to fork this project and make it your own. If you find any bugs or have suggestions, I'd love to hear about them!

---

Built with ❤️ over many cups of coffee and late-night debugging sessions. This project represents my journey in modern web development, and I hope it helps others on their path too.
