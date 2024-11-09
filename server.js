require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors"); // Import CORS middleware
const { MongoClient } = require("mongodb");
const app = express();

const PORT = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_URI);

// Enable CORS for all routes
app.use(cors()); 
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB once when the server starts
async function connectToDatabase() {
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit if there's an error connecting
    }
}
connectToDatabase();

// New route to get the count of signatures
app.get("/count", async (req, res) => {
    try {
        const db = client.db("pledgeDB"); // Replace with your database name
        const collection = db.collection("signatures"); // Replace with your collection name
        const count = await collection.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error("Error fetching count:", error);
        res.status(500).json({ error: "Unable to fetch count" });
    }
});

// Existing route for submitting signatures
app.post("/submit", async (req, res) => {
    console.log("Received data:", req.body); // Log incoming data

    const { firstName, lastName, email } = req.body;

    try {
        const db = client.db("pledgeDB");
        const collection = db.collection("signatures");

        // Check if the email already exists
        const existingSignature = await collection.findOne({ email });
        if (existingSignature) {
            return res.status(400).json({ message: "Your signature has already been added!" });
        }

        // Insert new signature
        await collection.insertOne({ firstName, lastName, email, date: new Date() });

        // Return success message and new count
        const newCount = await collection.countDocuments();
        res.status(200).json({ message: "Thank you for signing the pledge!", count: newCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
