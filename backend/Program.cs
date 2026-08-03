using BlogApi.Configuration;
using BlogApi.Data;
using BlogApi.DB;
using BlogApi.Factories;
using BlogApi.Interfaces.Auth;
using BlogApi.Interfaces.Core;
using BlogApi.Interfaces.Email;
using BlogApi.Interfaces.PostInteractions;
using BlogApi.Interfaces.Posts;
using BlogApi.Interfaces.Storage;
using BlogApi.Interfaces.Users;
using BlogApi.Middleware;
using BlogApi.Repositories;
using BlogApi.Services.Auth;
using BlogApi.Services.Core;
using BlogApi.Services.Email;
using BlogApi.Services.PostInteractions;
using BlogApi.Services.Sanitization;
using BlogApi.Services.Storage;
using BlogApi.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load .env file only in development
if (builder.Environment.IsDevelopment())
{
    LoadDotEnv(Path.Combine(Directory.GetCurrentDirectory(), ".env"));
}

// Configure Kestrel to listen on port 8080 for Render
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
});

// Add configuration from environment variables
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddSingleton<IAppConfiguration, AppConfiguration>();
builder.Services.AddSingleton<IDbConfiguration, DbConfiguration>();
builder.Services.AddSingleton<IImageStorageConfiguration, ImageStorageConfiguration>();

// Use Cloudinary for production, LocalImageStorage for development
if (builder.Environment.IsProduction())
{
    builder.Services.AddSingleton<IImageStorage, CloudinaryImageStorage>();
}
else
{
    builder.Services.AddSingleton<IImageStorage, LocalImageStorage>();
}
builder.Services.AddScoped<ISanitizationService, SanitizationService>();
builder.Services.AddScoped<IEmailSender>(sp =>
{
    var appConfig = sp.GetRequiredService<IAppConfiguration>();
    var config = sp.GetRequiredService<IConfiguration>();
    var environment = sp.GetRequiredService<IWebHostEnvironment>();
    return EmailProviderFactory.CreateEmailSender(appConfig, config, environment);
});
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();
builder.Services.AddScoped<IViewAllPostsService, ViewAllPostsService>();
builder.Services.AddScoped<ISavedPostsService, SavedPostsService>();
builder.Services.AddScoped<IYourPostsService, YourPostsService>();
builder.Services.AddScoped<ICreatePostService, CreatePostService>();
builder.Services.AddScoped<IViewPostService, ViewPostService>();
builder.Services.AddScoped<ICommentPostService, CommentPostService>();
builder.Services.AddScoped<ILikePostService, LikePostService>();
builder.Services.AddScoped<ISearchPostService, SearchPostService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<ISavedPostRepository, SavedPostRepository>();
builder.Services.AddScoped<IPostLikeRepository, PostLikeRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>();

        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            allowedOrigins = new[] { "http://localhost:5173", "https://localhost:5173" };
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition");
    });
});
builder.Services.AddDbContext<BlogDbContext>((serviceProvider, options) =>
{
    var dbConfig = serviceProvider.GetRequiredService<IDbConfiguration>();
    options.UseNpgsql(dbConfig.GetConnectionString());
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured.");

if (builder.Environment.IsProduction() && jwtKey.Contains("development-only", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException("Configure a production Jwt:Key before deploying.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Allow anonymous OPTIONS requests for CORS preflight
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Method == "OPTIONS")
                {
                    context.NoResult();
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles(); // Serve static files from wwwroot

// CORS must be BEFORE authentication and custom middlewares
app.UseCors("ReactApp");

app.UseAuthentication();

app.UseAuthorization();

// Custom middlewares should be AFTER CORS and authentication
app.UseMiddleware<LoggingMiddleware>();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();

// Add a simple health check endpoint
app.MapGet("/health", () => "OK");

// Add a root endpoint for basic testing
app.MapGet("/", () => "Blog API is running!");

app.Run();

static void LoadDotEnv(string path)
{
    if (!File.Exists(path))
    {
        return;
    }

    var lines = File.ReadAllLines(path);

    foreach (var rawLine in lines)
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        Environment.SetEnvironmentVariable(key, value);
    }
}
