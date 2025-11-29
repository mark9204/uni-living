# UniLiving 🏠

> A modern web platform for university students to find, list, and manage accommodation rentals.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 About

UniLiving is a full-stack web application developed as a diploma project at Pannon University. The platform connects university students seeking accommodation with property owners offering rentals, providing a trusted marketplace specifically tailored for the student community.

**Development Status:** 🚧 Active Development

## ✨ Features

- **Property Management**: Create, edit, and browse property listings with detailed information
- **User Authentication**: Secure JWT-based authentication system
- **User Profiles**: Manage personal information and view rental history
- **Rating System**: Rate and review users to build trust in the community
- **Image Uploads**: Support for property photos and user avatars
- **Responsive Design**: Modern, mobile-friendly interface

## 🏗️ Architecture

The project follows a clean, modular architecture with clear separation of concerns:

```
uni-living/
├── UniLiving/                  # ASP.NET Core Web API
│   └── Controllers/           # API endpoints
├── UniLiving.DataContext/     # Data layer
│   ├── Context/              # EF Core DbContext
│   ├── Entities/             # Database models
│   ├── DTOs/                 # Data transfer objects
│   └── Migrations/           # Database migrations
├── UniLiving.Services/        # Business logic layer
└── UniLiving.Frontend/        # React + Vite frontend
    └── src/                  # React components and pages
```

## 🛠️ Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core with MySQL
- **Authentication**: JWT Bearer tokens with ASP.NET Identity
- **API**: RESTful API architecture

### Frontend
- **Library**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: CSS3 with modern design principles

### Database
- **DBMS**: MySQL
- **Migrations**: EF Core Migrations

## 🚀 Getting Started

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mark9204/uni-living.git
   cd uni-living
   ```

2. Navigate to the API project:
   ```bash
   cd UniLiving
   ```

3. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=uniliving;User=root;Password=yourpassword;"
     }
   }
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update --project ../UniLiving.DataContext
   ```

5. Run the API:
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd UniLiving.Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `.env`:
   ```
   VITE_API_URL=https://localhost:5001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Properties
- `GET /api/property` - Get all properties
- `GET /api/property/{id}` - Get property by ID
- `POST /api/property` - Create new property (authenticated)
- `PUT /api/property/{id}` - Update property (authenticated)
- `DELETE /api/property/{id}` - Delete property (authenticated)

### Users
- `GET /api/user/{id}` - Get user profile
- `PUT /api/user/{id}` - Update user profile (authenticated)

### Ratings
- `POST /api/userrating` - Rate a user (authenticated)
- `GET /api/userrating/{userId}` - Get user ratings

## 🎓 Academic Context

**Institution**: Pannon University  
**Faculty**: Technical Informatics  
**Program**: Software Engineering BSc  
**Project Type**: Diploma Thesis

## 🔧 Development

### Running Migrations

Create a new migration:
```bash
cd UniLiving.DataContext
dotnet ef migrations add MigrationName --startup-project ../UniLiving
```

Apply migrations:
```bash
dotnet ef database update --startup-project ../UniLiving
```

### Building for Production

**Backend**:
```bash
cd UniLiving
dotnet publish -c Release -o ./publish
```

**Frontend**:
```bash
cd UniLiving.Frontend
npm run build
```

## 📝 Project Status

This project is currently under active development. Features and functionality are being continuously added and improved.

### Planned Features
- [ ] Advanced search and filtering
- [ ] Messaging system between users
- [ ] Payment integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Property booking system

## 🤝 Contributing

As this is a diploma project, external contributions are not currently accepted. However, feedback and suggestions are welcome!

## 📄 License

This project is developed for academic purposes.

## 👤 Author

**Mark** - [@mark9204](https://github.com/mark9204)

## 📞 Contact

For questions about this project, please open an issue on GitHub.

---

*This project is part of a diploma thesis at Pannon University, Faculty of Technical Informatics.*