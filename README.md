# Smart-Attendance

A modern QR-based attendance tracking system for educational institutions that makes recording student attendance seamless, secure, and tamper-proof.

![Smart Attendance System](/frontend/public/logo6.png)

## 🌟 Features

### For Teachers
- **Course Management**: Create and manage courses with unique invitation codes
- **Session Creation**: Start attendance sessions with customizable duration and location parameters
- **Real-time QR Code Generation**: Dynamically generated and rotating QR codes to prevent sharing
- **Location Validation**: Ensure students are physically present using geolocation validation
- **Attendance Reports**: View and download detailed attendance reports for each session
- **Student Management**: Monitor student enrollment and attendance patterns

### For Students
- **Course Enrollment**: Join courses using invitation codes
- **QR Code Scanning**: Mark attendance by scanning session QR codes
- **Location Verification**: Automatic location verification during attendance
- **Attendance History**: Track personal attendance records across all enrolled courses
- **Dashboard**: View all enrolled courses and upcoming sessions

## 🛠️ Technology Stack

### Backend
- **Node.js & Express.js**: Server-side application framework
- **MongoDB**: NoSQL database for data storage
- **Socket.io**: Real-time bidirectional communication for QR code updates
- **JWT**: Authentication and secure routes
- **QR Code Generation**: Dynamic QR code generation and validation

### Frontend
- **React**: UI component library
- **React Router**: Client-side routing
- **Vite**: Build tool and development environment
- **HTML5 QR Code Scanner**: For scanning QR codes via device camera
- **Responsive Design**: Mobile-friendly interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Git

### Installation

#### Clone the Repository
```bash
git clone https://github.com/yourusername/Smart-Attendance.git
cd Smart-Attendance
```

#### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file with the following variables:
```
PORT=5050
MONGODB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### Running the Application

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📱 Usage Guide

### Teacher Workflow
1. Register/Login as a teacher
2. Create a new course with a unique code
3. Start a new attendance session
4. Display the QR code to students
5. End session and view attendance records

### Student Workflow
1. Register/Login as a student
2. Join a course using the invitation code
3. Scan QR code during active sessions
4. View attendance history in the dashboard

## 🔒 Security Features

- Location-based verification
- Dynamically changing QR codes
- JWT authentication
- Secure password storage
- Session expiration

## 📊 Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="/frontend/assets/Login.png" alt="Login Screen" width="200">
  <img src="/frontend/assets/Teacher Dashboard.png" alt="Teacher Dashboard" width="200">
  <img src="/frontend/assets/student dashboard.png" alt="Student Dashboard" width="200">
  <img src="/frontend/assets/New Session.jpeg" alt="Creating New Session" width="200">
  <img src="/frontend/assets/QR.jpeg" alt="QR Code Display" width="200">
  <img src="/frontend/assets/Qr Scanner.jpeg" alt="QR Scanner" width="200">
</div>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or support, please contact [your-email@example.com].

---

Built with ❤️ for modern education.