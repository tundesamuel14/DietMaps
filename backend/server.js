import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors"; // Import CORS middleware


const app = express();

app.use(cors());
app.use(express.json());



// Use your API key directly
const GEMINI_API_KEY = "AIzaSyB02haLReTYIP13UjQ8IG1874NAzm7RS_k"; // Replace with your actual API key

// Initialize the Gemini API client
const client = new GoogleGenerativeAI(GEMINI_API_KEY);

// Endpoint for AI processing
app.post("/ai-process", async (req, res) => {
  const { theme } = req.body; // Get the user-selected theme from the request body
  const prompt = `Suggest 8 culturally significant ${theme} places around the world with their specific locations.`;
  console.log("Generated prompt:", prompt);

  try {
    // Make the API request
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    console.log("Full response from Gemini API:", result.response.text());

    // Extract location names
    const rawText = result.response.text();
    // Extract location names and remove colons
    const locations = rawText
    .match(/\*\*(.*?)\*\*/g)
    ?.map((item) => item.replace(/\*\*/g, "").replace(/:$/, "")) || [];

    console.log("Extracted locations:", locations);
    res.json({ locations }); // Return the cleaned-up locations

    
  } catch (error) {
    console.error("Error with Gemini API:", error);
    res.status(500).send("AI processing failed");
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
