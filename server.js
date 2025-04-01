require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors"); // Import CORS middleware
const { MongoClient } = require("mongodb");
const app = express();

const PORT = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_URI);

// Global in-memory cache for the pledge count
let cachedCount = 0;

app.use(cors());
app.use(express.json());

// Connect to MongoDB once when the server starts and initialize the cached count
async function connectToDatabase() {
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected to MongoDB!");
        await initializeCount();
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit if there's an error connecting
    }
}

async function initializeCount() {
    try {
        const db = client.db("pledgeDB"); // Replace with your database name if different
        const collection = db.collection("signatures"); // Replace with your collection name if different
        cachedCount = await collection.countDocuments();
        console.log(`Initialized count: ${cachedCount}`);
    } catch (error) {
        console.error("Error initializing count:", error);
    }
}

connectToDatabase();

// Keep-alive endpoint for free-tier hosting (e.g., for UptimeRobot)
app.get("/ping", (req, res) => {
    res.send("pong");
});

// Updated /count endpoint that returns the cached value immediately
app.get("/count", (req, res) => {
    res.json({ count: cachedCount });
});

// Updated /submit endpoint that uses the in-memory cache
app.post("/submit", async (req, res) => {
    console.log("Received data:", req.body);
    const { firstName, lastName, email } = req.body;

    try {
        const db = client.db("pledgeDB");
        const collection = db.collection("signatures");

        // Check if the email already exists
        const existingSignature = await collection.findOne({ email });
        if (existingSignature) {
            return res.status(400).json({ message: "Your signature has already been added!" });
        }

        // Insert the new signature
        await collection.insertOne({ firstName, lastName, email, date: new Date() });

        // Increment the cached count
        cachedCount++;

        // Return the updated count
        res.status(200).json({ message: "Thank you for signing the pledge!", count: cachedCount });
    } catch (error) {
        console.error("Error submitting signature:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

