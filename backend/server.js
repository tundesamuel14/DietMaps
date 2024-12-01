import express from "express";
import axios from "axios"; // Added import for axios
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors"; // Import CORS middleware

const app = express();

app.use(cors());
app.use(express.json());

// Use your API key directly
const GEMINI_API_KEY = "AIzaSyB02haLReTYIP13UjQ8IG1874NAzm7RS_k"; // Replace with your actual API key
const GOOGLE_API_KEY = "AIzaSyAt_RbPxjf0PubQ6_8G97UgkoheQzUdGRA"; // Replace with your actual Google API key

// Initialize the Gemini API client
const client = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post("/ai-process", async (req, res) => {
  const { theme } = req.body; // Get the user-selected theme from the request body
  const prompt = `Suggest 8 culturally significant ${theme} places around the world with their specific locations.`;
  console.log("Generated prompt:", prompt);

  try {
    // Fetch locations from Gemini
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const locations = rawText
      .match(/\*\*(.*?)\*\*/g)
      ?.map((item) => item.replace(/\*\*/g, "").trim()) || [];

    console.log("Locations from Gemini:", locations);

    if (locations.length === 0) {
      console.error("No locations extracted from Gemini API.");
      return res.status(500).json({ error: "No locations extracted." });
    }

    // Fetch latitude and longitude from Google Places API
    const coordinatesPromises = locations.map(async (location) => {
      const sanitizedLocation = location.replace(/[^a-zA-Z0-9\s]/g, "").trim();
      console.log(`Sanitized location: ${sanitizedLocation}`);

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
          {
            params: {
              input: sanitizedLocation,
              inputtype: "textquery",
              fields: "geometry",
              key: GOOGLE_API_KEY,
            },
          }
        );

        console.log(`Response for location ${location}:`, response.data);

        const candidate = response.data.candidates[0];
        if (!candidate?.geometry?.location) {
          console.warn(`No geometry data for location: ${location}`);
        }

        return {
          name: location,
          lat: candidate?.geometry?.location?.lat || null,
          lng: candidate?.geometry?.location?.lng || null,
        };
      } catch (error) {
        console.error(`Error fetching data for ${location}:`, error.response?.data || error.message);
        return { name: location, lat: null, lng: null };
      }
    });

    const finalLocations = await Promise.all(coordinatesPromises);

    // Log the final results for debugging
    console.log("Final Locations with Coordinates:", finalLocations);

    // Send the response
    res.json({ locations: finalLocations });
  } catch (error) {
    console.error("Error processing AI prompt or Places API:", error);
    res.status(500).send("Error processing locations");
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
