@/backend/  @/frontend @/backend/config/ @/backend/controllers/ @/backend/middlewares/ @/backend/models/ @/backend/routes/ @/backend/utils/ 

# GlowSpace - Mental Health Platform

A comprehensive MERN stack mental wellness platform that supports emotional wellbeing through AI-powered emotion detection, mood tracking, real-time chat support, and personalized counseling services.

## 🌟 Features

- **Emotion Detection**: Real-time facial emotion recognition using TensorFlow.js
- **Mood Tracking**: Interactive mood calendar with analytics
- **Real-time Chat**: Socket.IO powered chat support system
- **Counseling Services**: Appointment booking and scheduling
- **Mental Health Assessments**: AI-powered analysis of trauma, medication history, and voice assessments
- **Personalized Dashboard**: GPT-powered recommendations and insights
- **Gamified Healing**: Interactive healing games and positive streak challenges
- **Multi-auth Support**: Email/password and Google OAuth authentication

## 🏗️ Architecture

### Frontend (React)
- React 18 with Context API
- TensorFlow.js for emotion detection
- Socket.IO client for real-time features
- Tailwind CSS + GSAP for animations
- React Router for navigation

### Backend (Node.js/Express)
- RESTful API with Express
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT authentication
- Multer for file uploads
- Integration with OpenAI GPT API

### Database (MongoDB)
- User management
- Emotion and mood data
- Chat messages
- Appointments and assessments
- Gamification data

## 📁 Project Structure

```
GlowSpace-Mental Health Platform/
├── frontend/                    # React application
│   ├── public/                 # Static files
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable components
│   │   │   ├── Dashboard/      # Dashboard components
│   │   │   ├── Chat/          # Chat components
│   │   │   ├── EmotionDetector/# Emotion detection
│   │   │   ├── Navbar/        # Navigation
│   │   │   └── Footer/        # Footer
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── tests/             # Test files
│   │   └── App.js             # Main app component
│   └── package.json           # Frontend dependencies
├── backend/                    # Node.js/Express API
│   ├── controllers/           # Route controllers
│   ├── middlewares/           # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── uploads/              # File uploads
│   ├── config/               # Configuration files
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
├── docs/                      # Project documentation
├── README.md                  # This file
└── .gitignore                # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd GlowSpace-Mental Health Platform
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file and fill in your values:
# - MongoDB URI
# - JWT secrets
# - Google OAuth credentials
# - Email configuration
# - OpenAI API key (optional)
```

5. Start MongoDB (if running locally)
```bash
# Using MongoDB Community Server
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. Start the development servers
```bash
# Terminal 1: Backend server (from backend directory)
cd backend
npm run dev

# Terminal 2: Frontend server (from frontend directory)
cd frontend
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## 📚 Documentation

- [Phase 0: Strategy & Requirements](docs/PHASE_0_Strategy_Requirements.md)
- [Phase 1: Project Structure](docs/PHASE_1_Project_Structure.md)
- [API Documentation](docs/API_Documentation.md) (Coming Soon)
- [Database Schema](docs/DATABASE_Schema.md) (Coming Soon)
- [Deployment Guide](docs/DEPLOYMENT_Guide.md) (Coming Soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Socket.IO Documentation](https://socket.io/docs/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [OpenAI API](https://openai.com/api/)

---

**GlowSpace** - Illuminating the path to mental wellness 🌟
