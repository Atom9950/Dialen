# 💬 Dialen

<div align="center">

<img src="https://github.com/user-attachments/assets/b750b00c-6964-4c5f-b45c-a0643e5adaa7" alt="Dialen Logo" width="300"/>

A modern, real-time messaging application built with React Native, Express, MongoDB, and Socket.IO

[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📱 About

**Dialen** is a full-stack real-time messaging application that enables seamless communication with support for individual and group chats. Built with modern technologies, it offers a secure, fast, and intuitive messaging experience with rich media sharing capabilities.

---

## ✨ Features

### 🔐 **Secure Authentication**
- JWT-based authentication system
- Secure token-based session management
- Protected routes and API endpoints

### 💬 **Real-Time Messaging**
- Instant message delivery using Socket.IO
- Individual and group chat support
- Select user button to initiate chats with logged-in users
- Online/offline status indicators
- Typing indicators

### 🖼️ **Media Sharing**
- Image sharing in conversations
- Cloudinary integration for optimized image storage
- Fast media loading and caching

### 👤 **User Profile Management**
- Custom avatar upload
- Edit and update profile information
- Delete avatar functionality

### 🗑️ **Chat Management**
- Delete individual messages
- Clear entire chat histories
- Message timestamps

### 🚪 **Session Control**
- Secure logout functionality
- Session persistence
- Automatic token refresh

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **React Navigation** - Seamless navigation
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Cloud-based image management

---

## 📂 Project Structure

```
Dialen/
├── frontend/          # React Native mobile application
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── backend/           # Express.js server
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   ├── config/
    │   └── socket/
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- React Native development environment
- Cloudinary account

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Atom9950/Dialen.git
cd Dialen
```

#### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:
```bash
npm run dev
```

#### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
```

Update the API endpoint in your configuration file with your backend URL.

For iOS:
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

For Android:
```bash
npx react-native run-android
```

---

## 📸 Screenshots

<div align="center">

| Login Screen | Chat List |
|:---:|:---:|
| ![SignUp](https://github.com/user-attachments/assets/38cdc164-0c85-41c3-b791-f867f23af92d) | ![Chat List](https://github.com/user-attachments/assets/9b44915d-9481-4d5e-881f-801e2579afed) |

| Select User | Profile |
|:---:|:---:|
| ![Conversation](https://github.com/user-attachments/assets/cf696bc2-facb-44a0-84e0-d98701a47a60) | ![Profile](https://github.com/user-attachments/assets/3ba57513-dceb-49c3-968f-4f6aa311629f) |

</div>

> **Note:** Replace the placeholder images above with actual screenshots of your application.

---

## 🔑 Key Features Implementation

### Real-Time Communication
```javascript
// Socket.IO connection
socket.on('message', (data) => {
  // Handle incoming messages
});

socket.emit('sendMessage', messageData);
```

### JWT Authentication
```javascript
// Token verification middleware
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Cloudinary Integration
```javascript
// Image upload to Cloudinary
const result = await cloudinary.uploader.upload(imageFile);
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Atom9950**

- GitHub: [@Atom9950](https://github.com/Atom9950)
- Repository: [Dialen](https://github.com/Atom9950/Dialen)

---

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Socket.IO for real-time capabilities
- Cloudinary for media management solutions
- MongoDB for flexible data storage

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made by Atom9950

</div>
