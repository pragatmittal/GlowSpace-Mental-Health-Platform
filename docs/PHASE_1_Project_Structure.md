# PHASE 1: PROJECT STRUCTURE

## 1.1 Frontend Structure (React)

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Navbar/
│   │   ├── Modal/
│   │   ├── Button/
│   │   ├── Card/
│   │   └── EmotionDetector/
│   ├── pages/           # Route-based pages
│   │   ├── Home/
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Assessment/
│   │   ├── Chat/
│   │   └── Counseling/
│   ├── contexts/        # Global state providers
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── SocketContext.js
│   ├── hooks/           # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useEmotionDetection.js
│   ├── utils/           # Helper functions
│   │   ├── api.js       # API client
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── assets/          # Static assets
│   │   ├── images/
│   │   └── styles/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 1.2 Backend Structure (Node.js/Express)

```
backend/
├── controllers/         # Logic for each route
│   ├── authController.js
│   ├── chatController.js
│   ├── emotionController.js
│   ├── assessmentController.js
│   ├── counselingController.js
│   └── dashboardController.js
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Message.js
│   ├── EmotionData.js
│   ├── Assessment.js
│   ├── Appointment.js
│   └── MoodEntry.js
├── routes/             # API route definitions
│   ├── auth.js
│   ├── chat.js
│   ├── emotions.js
│   ├── assessments.js
│   ├── counseling.js
│   └── dashboard.js
├── middlewares/        # Middleware functions
│   ├── auth.js         # JWT verification
│   ├── errorHandler.js
│   ├── upload.js       # Multer config
│   └── validators.js
├── utils/              # Helper functions
│   ├── emailSender.js
│   ├── scoringFunctions.js
│   ├── aiAnalysis.js
│   └── database.js
├── uploads/            # File uploads directory
├── config/             # Configuration files
│   ├── database.js
│   ├── jwt.js
│   └── environment.js
├── server.js           # Main server file
├── package.json
└── .env.example
```

## 1.3 Documentation Structure

```
docs/
├── PHASE_0_Strategy_Requirements.md
├── PHASE_1_Project_Structure.md
├── API_Documentation.md
├── DATABASE_Schema.md
├── DEPLOYMENT_Guide.md
└── TESTING_Strategy.md
```

## 1.4 Root Level Files

```
GlowSpace-Mental Health Platform/
├── frontend/
├── backend/
├── docs/
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
```

## 1.5 Key Technologies per Layer

### Frontend
- React 18 with hooks
- Context API for state management
- React Router for routing
- Axios for API calls
- Socket.IO client for real-time features
- TensorFlow.js for emotion detection
- Tailwind CSS for styling
- GSAP for animations

### Backend
- Node.js with Express framework
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT for authentication
- Multer for file uploads
- Nodemailer for email services
- bcryptjs for password hashing
- express-validator for input validation

### AI/ML Layer
- TensorFlow.js for facial emotion recognition
- OpenAI GPT API for text analysis
- Natural Language Processing libraries

### Database
- MongoDB collections:
  - users
  - emotions
  - moods
  - assessments
  - appointments
  - messages
  - challenges
