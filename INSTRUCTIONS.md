# Project Setup Instructions

## Prerequisites
- **Node.js**: [Download Here](https://nodejs.org/)
- **Firebase Account**: [Create Here](https://firebase.google.com/)

## Setup Steps

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Firebase Configuration**
    - Go to Firebase Console -> **Project Settings**.
    - Scroll down to "Your apps" -> Web App.
    - Copy the `firebaseConfig` object.
    - Paste it into `src/services/firebase.js`.
    
    **Important**: 
    - Enable **Authentication** -> Sign-in method -> Email/Password.
    - Enable **Firestore Database** -> Create Database -> Start in Test Mode (for development).

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Project Structure
- `src/components`: UI Components
- `src/context`: React Context (Auth)
- `src/services`: Firebase connections
- `src/pages`: (Currently components directly in App.jsx for simplicity)

## Tech Stack
- React (Vite)
- Tailwind CSS
- Firebase (Auth + Firestore)
