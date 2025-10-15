// --- Eduva Authentication Server (Node.js / Express) ---
// This file is the backend. It must be run separately (e.g., using 'node login.js')
// to securely handle the MongoDB connection and API requests from index.html.

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Required to allow index.html (client) to talk to this server

const app = express();
const PORT = 3000;

// --- 1. Middleware Setup ---
// Enable CORS to allow the frontend (index.html) to communicate with this server
app.use(cors({
    origin: 'YOUR_FRONTEND_URL_OR_WILDCARD' // In a real setup, change to the specific domain of your index.html
})); 
app.use(express.json()); // Allows parsing of JSON request bodies

// --- 2. Database Connection ---
// Connecting to your local MongoDB server
const MONGO_URI = 'mongodb://localhost:27017/EduvaDB'; // Added a database name 'EduvaDB'

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB successfully connected to:', MONGO_URI))
    .catch(err => {
        console.error('MongoDB connection error. Ensure your local MongoDB server is running.', err);
    });

// --- 3. Mongoose User Schema ---
// Defines the structure of documents in your 'users' collection
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // Stores the secure hash of the password
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
});
const User = mongoose.model('User', UserSchema);

// --- 4. Login Endpoint (POST /api/login) ---
app.post('/api/login', async (req, res) => {
    const { email, password, desiredRole } = req.body;
    
    // Basic input validation
    if (!email || !password || !desiredRole) {
        return res.status(400).json({ success: false, message: "Missing email, password, or role." });
    }

    try {
        // Find user by email in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            // User not found
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // Compare the provided password with the stored hash
        // NOTE: If you are testing with plaintext passwords in the DB, you must skip this line, 
        // but for security, bcrypt is mandatory for production.
        // const isMatch = await bcrypt.compare(password, user.passwordHash); // Use this for secure code

        // --- SIMULATION FOR BASIC TESTING (If you don't use bcrypt yet) ---
        // REPLACE THE LINE ABOVE with this line if you are storing plaintext 'password' in the DB for simple testing:
        const isMatch = (password === user.passwordHash || password === 'password'); // Allows 'password' for easy testing

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // Check for role match (Authorization)
        if (user.role !== desiredRole) {
            return res.status(403).json({ success: false, message: `Role mismatch. Log in as ${user.role}.` });
        }

        // Success: Return success and a token for future requests
        // In a real app, generate and send a JSON Web Token (JWT) here.
        res.status(200).json({ 
            success: true, 
            message: `Login successful as ${user.role}!`,
            token: 'SIMULATED_JWT_TOKEN_123', 
            userRole: user.role 
        });

    } catch (error) {
        console.error('Server Login Error:', error);
        res.status(500).json({ success: false, message: "Server error during authentication." });
    }
});

// --- 5. Start the Server ---
app.listen(PORT, () => {
    console.log(`Eduva Auth Server running on http://localhost:${PORT}`);
});

// To set up test data in your MongoDB:
// 1. Ensure a database named 'EduvaDB' exists.
// 2. Insert test documents into the 'users' collection:
/*
[
    { "email": "student@eduva.com", "passwordHash": "password", "role": "student" },
    { "email": "teacher@eduva.com", "passwordHash": "password", "role": "teacher" },
    { "email": "admin@eduva.com", "passwordHash": "password", "role": "admin" }
]
*/
