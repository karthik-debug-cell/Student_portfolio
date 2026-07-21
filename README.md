# 🤖 Karthik M – Portfolio Website

> **Aspiring Machine Learning & Data Science Engineer**  
> B.Tech Information Technology, 3rd Year | Ramco Institute of Technology

A modern, professional three-page personal portfolio website built with **HTML5**, **CSS3**, and **Vanilla JavaScript**, served by a **Node.js built-in HTTP module** server, with **MongoDB** for contact form storage.

---

## 🌐 Live Pages

| Page | Description |
|------|-------------|
| `/` or `/index.html` | Home – Hero, About, Skills, Experience, Featured Project |
| `/projects.html` | Projects, Certifications |
| `/contact.html` | Contact form, social links, info card |

---

## ✨ Features

- 🎨 **Dark theme** with glassmorphism & gradient accents
- ⌨️ **Typing animation** in the hero section
- 🎬 **Scroll reveal animations** (Intersection Observer API)
- 📌 **Sticky navigation** with active link tracking
- 📱 **Fully responsive** (mobile, tablet, desktop)
- 🔍 **Project filter** tabs (All / ML / Deep Learning / Data Science)
- ⬆️ **Back-to-top** button
- 🍔 **Hamburger menu** for mobile
- ♿ **Accessibility** – ARIA roles, semantic HTML, reduced-motion support
- 🔒 **Security headers** on all responses
- 📊 **Custom 404** page
- 📧 **Contact Form** with MongoDB integration
- 🎉 **Toast Notifications** for form feedback
- 💾 **Character counter** and live validation on contact form

---

## 🗂️ Folder Structure

```
Portfolio/
├── index.html          # Page 1 – Home
├── projects.html       # Page 2 – Projects & Certifications
├── contact.html        # Page 3 – Contact Me (NEW)
├── server.js           # Node.js HTTP server (no Express)
├── db.js               # MongoDB connection module
├── .env                # Environment variables (not committed)
├── .gitignore          # Ignores node_modules and .env
├── package.json        # Project metadata & dependencies
└── README.md           # This file
│
├── css/
│   ├── style.css       # Core styles, dark theme, glassmorphism
│   └── responsive.css  # Responsive breakpoints
│
├── js/
│   ├── script.js       # Typing animation, scroll reveal, filters
│   ├── emitter.js      # Client-side EventEmitter (NEW)
│   ├── animations.js   # Scroll reveal, parallax, navbar helpers (NEW)
│   └── toast.js        # Toast notification library (NEW)
│
├── images/
│   ├── profile.jpg     # Profile photo
│   └── projects/
│       └── fraud_detection.png
│
└── assets/
    └── resume.pdf      # Downloadable resume
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally

### 🔌 MongoDB Installation & Database Setup

1. **Install MongoDB**:
   - Download and install **MongoDB Community Server** from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
   - Optionally install **MongoDB Compass** for a graphical interface to inspect your data.

2. **Start MongoDB**:
   - **Windows**: MongoDB runs as a background service automatically. If not running, open Services → start `MongoDB`, or run in terminal:
     ```cmd
     mongod
     ```
   - **macOS** (Homebrew):
     ```bash
     brew services start mongodb-community
     ```
   - **Linux**:
     ```bash
     sudo systemctl start mongod
     ```

3. **Database Configuration**:
   - The server auto-connects to database **`portfolioDB`** and stores contacts in collection **`contacts`**.
   - Create a `.env` file in the project root:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017
     ```

### 📦 Install Dependencies

```bash
npm install mongodb dotenv
# or simply
npm install
```

### 🏃 Run Server

```bash
node server.js
# or
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

## 🧪 Testing the Contact Form

### Via the UI

1. Navigate to `http://localhost:3000/contact.html`.
2. Fill in Full Name, Email, Subject, and Message (min 10 chars).
3. Click **Send Message**.
4. A success toast and banner will appear; the form fields are cleared.

### Via curl (Command Line)

```bash
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "Karthik", "email": "karthik@gmail.com", "subject": "Internship Opportunity", "message": "I liked your portfolio."}'
```

### Via PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/contact" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"name":"Karthik","email":"karthik@gmail.com","subject":"Internship","message":"Hello from PowerShell!"}'
```

### Expected Responses

| Scenario | Status | Response |
|----------|--------|----------|
| Valid submission | 200 OK | `{ "success": true, "message": "Message sent successfully." }` |
| Missing/invalid fields | 400 Bad Request | `{ "success": false, "message": "Failed to send message." }` |
| Database error | 500 Server Error | `{ "success": false, "message": "Failed to send message." }` |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure & semantics |
| CSS3 | Styling, animations, glassmorphism |
| Vanilla JavaScript | Typing animation, scroll reveal, filters, form logic |
| Node.js (built-in `http`) | HTTP server – no Express.js |
| MongoDB (official driver) | Contact form message storage |
| dotenv | Environment variable management |

> **No frameworks** (no Express, no Mongoose, no React, no Bootstrap, no Tailwind CSS).

---

## 📌 Projects Showcased

1. **Credit Card Fraud Detection & Analysis** — End-to-end ML pipeline with 99.2% accuracy
2. **Tomato Disease Classification** — ResNet50 + Vision Transformer (ViT) using Transfer Learning
3. **Library Recommendation System** — Collaborative & Content-Based Filtering

---

## 🏅 Certifications

- Microsoft Applied Skills – Create an AI Agent
- NPTEL Programming in Java (Elite)
- NPTEL Joy of Computing Using Python

---

## 📬 Contact

| Platform | Link |
|----------|------|
| 📧 Email | karthikm455405@gmail.com |
| 🐙 GitHub | [@karthik-debug-cell](https://github.com/karthik-debug-cell) |
| 💼 LinkedIn | [m-karthik-826271393](https://www.linkedin.com/in/m-karthik-826271393) |
| 🌐 Contact Page | [contact.html](http://localhost:3000/contact.html) |

---

<p align="center">Crafted with ❤️ by <strong>Karthik M</strong> &nbsp;|&nbsp; &copy; 2025 All rights reserved.</p>
