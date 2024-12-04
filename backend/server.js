import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "GEMINI_API_KEY"; // Replace with your actual API key
const GOOGLE_API_KEY = "GOOGLE_API_KEY"; // Replace with your actual Google API key

// Predefined location for the demo
const predefinedLocation = {
  name: "New York",
  lat: 40.7128,
  lng: -74.0060,
};

// Initialize the Gemini API client
const client = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post("/api/ai-process-restaurants", async (req, res) => {
  const { dietaryRestriction } = req.body; // Only dietaryRestriction is used in this demo
  const targetLocation = predefinedLocation.name; // Fixed to New York for this demo

  console.log(`Target location: ${targetLocation}`);

  const prompt = `List 8 restaurants in ${targetLocation} only, that cater to ${dietaryRestriction} diets. List the names only.`;

  try {
    // Step 1: Fetch restaurant names using Gemini API
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const rawRestaurants = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((restaurant) => restaurant.replace(/^\d+\.\s*/, "")); // Remove numbering

    console.log("Extracted restaurants from Gemini:", rawRestaurants);

    // Step 2: Fetch latitude, longitude, and additional details using Google Places API
    const restaurantDetails = await Promise.all(
      rawRestaurants.map(async (restaurant) => {
        try {
          // Find the place ID with location bias
          const findPlaceResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
            {
              params: {
                input: restaurant,
                inputtype: "textquery",
                fields: "place_id",
                key: GOOGLE_API_KEY,
                locationbias: `point:${predefinedLocation.lat},${predefinedLocation.lng}`, // Add location bias
              },
            }
          );

          const placeId = findPlaceResponse.data.candidates[0]?.place_id;
          if (!placeId) {
            console.warn(`No place ID found for restaurant: ${restaurant}`);
            return { name: restaurant, lat: null, lng: null };
          }

          // Fetch details using the place ID
          const placeDetailsResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json`,
            {
              params: {
                place_id: placeId,
                fields:
                  "name,rating,formatted_address,website,url,opening_hours,photos,reviews,geometry",
                key: GOOGLE_API_KEY,
              },
            }
          );

          const details = placeDetailsResponse.data.result;
          return {
            name: details.name || restaurant,
            lat: details.geometry?.location.lat || null,
            lng: details.geometry?.location.lng || null,
            address: details.formatted_address || "Address not available",
            website: details.website || "Website not available",
            openingHours: details.opening_hours?.weekday_text || [],
            photos: details.photos?.map((photo) => photo.photo_reference) || [],
          };
        } catch (error) {
          console.error(`Error fetching details for ${restaurant}:`, error.message);
          return { name: restaurant, lat: null, lng: null };
        }
      })
    );

    console.log("Final restaurants with details:", restaurantDetails);
    res.json({ restaurants: restaurantDetails });
  } catch (error) {
    console.error("Error processing restaurant data:", error.message);
    res.status(500).send("Error processing restaurant data.");
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
