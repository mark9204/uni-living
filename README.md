# UniLiving 🏘

> A modern web platform for university students to find, list, and manage accommodation rentals.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 About

UniLiving is a full-stack web application developed as a diploma project at Pannon University. The platform connects university students seeking accommodation with property owners offering rentals, providing a trusted marketplace specifically tailored for the student community.
**Development Status:** 🦧 Active Development

## ✨ Features

- **Property Management**: Create, edit, and browse property listings with detailed information
- **User Authentication**: Secure JWT-based authentication
- **User Profiles**: Manage personal information, upload avatars, and manage properties
- **Search & Preferences**: Advanced search capabilities, save search preferences, and favorite properties
- **Real-Time Chat**: Live messaging between students and property owners over SignalR
- **Notifications**: Asynchronous alerts and notifications
- **Rating System**: Rate and review users to build trust in the community
- **Dashboard & Analytics**: System platform statistics and user dashboards
- **Responsive Design**: Modern, mobile-friendly interface built with Chakra UI

## 🎷菽 Architecture

The project follows a Clean Architecture inspired modular design with clear separation of concerns (DTO pattern, Repository/Services isolation):

``b
uni-living/
☜╠╠ UniLiving/                  # ASP.NET Core Web API (Controllers, SignalR Hubs)
☜▀▀ UniLiving.DataContext/     # Data layer (EF Core DbContext, Entities, DTOs, Migrations)
☜▀▀ UniLiving.Services/        # Business logic layer (Services, AutoMapper Profiles)
☔╠╠ UniLiving.Frontend/        # React + Vite frontend
    └▀▀ src/                   # React components (Chakra UI)
`b`

## 🚀菽 Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 9.0
- **Database**: SQL Server
- **Authentication**: Custom JWT Bearer tokens
- **Real-Time Communication'(*: SignalR (WebSockets)
- **ObjectMapping**: AutoMapper
- **API Documentation**: OpenAPI / Swagger

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **UI Architecture**: Chakra UI component library
- **Routing**: React Router

## 📚 Core API Endpoints & Modules

### Authentication & Users
- `/api/auth` - Register, login, verification, token refresh
- `/api/user` - View and manage user profiles and avatars

### Properties & Search
- `/api/property` - CRUD operations for listings and images
- `/api/preferences` - User property search preferences
- `api/dashboard` - Global platform statistics

### Engagement & Interaction
- `/api/chat` & `ChatHub` - Live user messaging
- `/api/notifications` - Alert lifecycle management
- `/api/userrating` - Community scoring system

## 🎃 Academic Context

**Institution**: Pannon University  
**Faculty**: Technical Informatics  
**Program**: Software Engineering BSc  
**Project Type**: Diploma Thesis

## 🎝 Project Status

This project is currently under active development. Features and functionality are being continuously added and improved.

## 🦍 Contributing

As this is a diploma project, external contributions are not currently accepted. However, feedback and suggestions are welcome!

## 📄 License

This project is developed for academic purposes.

## 👄 Author

**Mark** - [@mark9204](https://github.com/mark9204)

## 📞 Contact

For questions about this project, please open an issue on GitHub.

---

*This project is part of a diploma thesis at Pannon University, Faculty of Technical Informatics.*
