# Logistics Company API

A .NET 8.0 Web API for managing logistics company operations including cargo tracking, employee management, and client services.

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) (version 12 or higher)

## Dependencies

### Logistics (Web API)
| Package | Version | Description |
|---------|---------|-------------|
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.0 | JWT authentication |
| Microsoft.AspNetCore.OpenApi | 8.0.22 | OpenAPI/Swagger support |
| Microsoft.EntityFrameworkCore.Design | 8.0.0 | EF Core design tools |
| Swashbuckle.AspNetCore | 6.6.2 | Swagger UI |

### DataLayer (Class Library)
| Package | Version | Description |
|---------|---------|-------------|
| Microsoft.EntityFrameworkCore | 8.0.0 | ORM framework |
| Microsoft.EntityFrameworkCore.Design | 8.0.0 | EF Core design tools |
| Microsoft.EntityFrameworkCore.Tools | 8.0.0 | EF Core CLI tools |
| Npgsql.EntityFrameworkCore.PostgreSQL | 8.0.0 | PostgreSQL provider |

## Database Setup

1. Start PostgreSQL server on `localhost:5432`

2. Create the database:
   ```sql
   CREATE DATABASE "LogisticsDB";
   ```

3. Update the connection string in `Logistics/appsettings.json` if your PostgreSQL credentials differ:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=LogisticsDB;Username=postgres;Password=postgres"
     }
   }
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update --project DataLayer --startup-project Logistics
   ```

   Or import the provided SQL dump:
   ```bash
   psql -U postgres -d LogisticsDB -f logistics_db.sql
   ```

## Running the Project

1. Restore dependencies:
   ```bash
   dotnet restore
   ```

2. Build the solution:
   ```bash
   dotnet build
   ```

3. Run the API:
   ```bash
   dotnet run --project Logistics
   ```

The API will be available at:
- HTTP: http://localhost:5128
- HTTPS: https://localhost:7214

## API Documentation

Swagger UI is available at `/swagger` when running in Development mode:
- http://localhost:5128/swagger

## Project Structure

```
Nbu_LogisticsCompanyProject/
├── Logistics/              # Web API project
│   ├── Controllers/        # API endpoints
│   ├── Services/           # Business logic
│   └── appsettings.json    # Configuration
├── DataLayer/              # Data access layer
│   ├── Context/            # DbContext
│   ├── Models/             # Entity models
│   ├── DTOs/               # Data transfer objects
│   ├── Enums/              # Enumerations
│   └── Repositories/       # Data repositories
└── Logistics.sln           # Solution file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Protected Endpoints (require JWT token)
- `/api/users` - User management
- `/api/companies` - Company management
- `/api/offices` - Office management
- `/api/clients` - Client management
- `/api/companyemployees` - Employee management
- `/api/cargos` - Cargo tracking and management

## Authentication

The API uses JWT Bearer authentication. After logging in, include the token in requests:

```
Authorization: Bearer <your_token>
```

Token validity: 3 hours
