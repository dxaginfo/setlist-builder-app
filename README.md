# Setlist Builder + Sync

A web application for musicians to build and sync setlists with editing, tracking, and export features.

## 🎵 Project Overview

Setlist Builder + Sync is a comprehensive tool that allows bands, solo artists, and music directors to organize song selections, track performance details, and collaborate with team members. The application addresses the challenges musicians face when planning, sharing, and executing setlists for performances.

### Key Features

- **Song Library Management**: Store and organize songs with metadata like key, tempo, and lyrics
- **Setlist Creation**: Drag-and-drop interface with automatic duration calculation
- **Real-time Collaboration**: Work with band members on setlists simultaneously
- **Performance Tracking**: Record venue details and track song performance history
- **Export Options**: Share and export setlists in multiple formats
- **Mobile Performance Mode**: Access setlists on stage with auto-scroll and dark mode

## 🚀 Tech Stack

### Frontend
- React.js with TypeScript
- Redux for state management
- Material-UI for components
- react-beautiful-dnd for drag-and-drop
- PWA support for offline mode

### Backend
- Node.js with Express
- RESTful API
- JWT authentication
- Socket.io for real-time features

### Database
- PostgreSQL
- Redis for caching
- S3 for media storage

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Redis

### Development Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dxaginfo/setlist-builder-app.git
   cd setlist-builder-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your local configuration

4. **Setup the database**
   ```bash
   cd ../backend
   npm run db:migrate
   npm run db:seed # (optional) to add sample data
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   cd ../backend
   npm run dev

   # In a separate terminal, start frontend server
   cd ../frontend
   npm start
   ```

6. **Access the application**
   - Backend API will be available at: http://localhost:5000
   - Frontend will be available at: http://localhost:3000

## 📦 Project Structure

```
setlist-builder-app/
├── backend/               # Node.js Express API
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── frontend/              # React application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   ├── store/         # Redux store
│   │   ├── styles/        # CSS/SCSS files
│   │   └── utils/         # Helper functions
│   └── tests/             # Unit/integration tests
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

## 📄 API Documentation

API documentation is available via Swagger UI when running the development server:
- http://localhost:5000/api-docs

## 🔄 Deployment

### Docker Deployment

1. **Build Docker images**
   ```bash
   docker-compose build
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

Detailed instructions for deploying to AWS, Heroku, or other platforms can be found in the [deployment guide](./docs/deployment.md).

## 📊 Feature Roadmap

- **v1.0.0** - Core setlist management and collaboration
- **v1.1.0** - Performance mode with auto-scroll
- **v1.2.0** - Integration with music streaming services
- **v2.0.0** - Mobile native applications

## 👥 Contributing

Contributions are welcome! Please check out our [contributing guidelines](./CONTRIBUTING.md).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📱 Contact

For questions or feedback, please [open an issue](https://github.com/dxaginfo/setlist-builder-app/issues) or contact the project maintainers.