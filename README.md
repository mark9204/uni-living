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
- **Real-time Chat**: In-app messaging between tenants and property owners using SignalR
- **Notifications**: Comprehensive updates on activities and messages
- **Favorites & Preferences**: Save properties and configure personalized search filters
- **Admin Dashboard**: System analytics and audit logs for administrators
- **Rating System**: Rate and review users to build trust in the community
- **Image Uploads**: Support for property photos and user avatars
- **Responsive Design**: Modern, mobile-friendly interface with Chakra UI

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
- **ORM**: Entity Framework Core 9 with SQL Server
- **Authentication**: JWT Bearer tokens with ASP.NET Identity
- **Real-time**: SignalR for live messaging
- **API**: RESTful API architecture

### Frontend
- **Library**: React 18+
- **UI Framework**: Chakra UI & Framer Motion
- **Build Tool**: Vite
- **Routing**: React Router
- **Real-time**: @microsoft/signalr

### Database
- **DBMS**: SQL Server
- **Migrations**: EF Core Migrations

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
- `GET /api/preferences` - Manage search preferences and favorites

### Communication & Activity
- `GET /api/chat` - Real-time messaging and chat rooms (via SignalR hub)
- `GET /api/notifications` - User event notifications

### Ratings
- `POST /api/userrating` - Rate a user (authenticated)
- `GET /api/userrating/{userId}` - Get user ratings

### Dashboard & Analytics
- `GET /api/dashboard/...` - System statistics and audit logs for admin users

## 🎓 Academic Context

**Institution**: Pannon University  
**Faculty**: Technical Informatics  
**Program**: Software Engineering BSc  
**Project Type**: Diploma Thesis

## 📝 Project Status

This project is currently under active development. Features and functionality are being continuously added and improved.

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
