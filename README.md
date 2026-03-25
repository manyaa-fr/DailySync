# DailySync

> **🚧 UNDER CONSTRUCTION 🚧**
>
> This project is currently in active development. Features and documentation are subject to change.
>
> **Live Links Coming Soon!**

## 📖 Overview

**DailySync** is a developer productivity dashboard designed to help you track your coding journey. It seamlessly integrates with GitHub to visualize your git commits, track coding time, and generate insightful daily AI summaries.

## ✨ Features

- **GitHub Integration**: Automatically syncs your commit history and activity.
- **Visual Analytics**: Interactive charts and graphs powered by Recharts to track your progress.
- **Developer Metrics**: Monitor key stats like weekly commits, coding minutes, and day streaks.
- **Authentication**: Secure user authentication with Email/Password and GitHub OAuth.
- **Modern UI**: A sleek, responsive interface built with React, Tailwind CSS, and Framer Motion.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Motor](https://motor.readthedocs.io/) for async support)
- **Authentication**: JWT (JSON Web Tokens) & OAuth2
- **Server**: [Uvicorn](https://www.uvicorn.org/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **MongoDB** (Local instance or Atlas Cluster)

### 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/DailySync.git
    cd DailySync
    ```

2.  **Setup Backend**
    ```bash
    cd server
    # Create a virtual environment (optional but recommended)
    python -m venv venv
    # Activate virtual environment
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    ```

### ⚙️ Configuration

You need to configure environment variables for both the client and server.

#### Backend (`server/src/.env`)
Create a `.env` file in `server/src/` with the following variables:

```env
# Server Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
FRONTEND_BASE_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string
DB_NAME=dailysync

# Security
JWT_SECRET_KEY=your_super_secret_jwt_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/github/callback
```

#### Frontend (`client/.env`)
Create a `.env` file in `client/` with the following variables:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 🏃‍♂️ Running the Application

1.  **Start the Backend Server**
    ```bash
    # In the server/src directory
    python -m uvicorn app:app --reload --port 8000
    ```
    The API will be available at `http://localhost:8000`.

2.  **Start the Frontend Development Server**
    ```bash
    # In the client directory
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
 