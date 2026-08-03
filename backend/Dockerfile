# Use the official .NET 8.0 SDK as the base image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY BlogApi.csproj .
RUN dotnet restore "BlogApi.csproj"

# Copy the rest of the application
COPY . .

# Build the application
WORKDIR "/src"
RUN dotnet build "BlogApi.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "BlogApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 8.0 runtime as the base image for running
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 8080 (Render uses this port)
EXPOSE 8080

# Set the environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
ENTRYPOINT ["dotnet", "BlogApi.dll"]
