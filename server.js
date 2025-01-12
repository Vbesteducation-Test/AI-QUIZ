const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios");

const app = express();
const port = 3000;  // Change to a different port
const cors = require("cors");
app.use(cors());

// Firebase Admin SDK setup
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://ai-quiz-dd6ef.firebaseio.com"
});

const db = admin.firestore();
const openaiApiKey = "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"; // Replace with your OpenAI API key



// OpenAI or Gemini API Configuration
async function fetchOpenAIQuestion() {
  const prompt = "Generate a multiple-choice question on JavaScript programming.";
  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo", // Updated model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    }, {
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
      }
    });

    // Log the full response for debugging
    console.log("OpenAI Response:", response.data);

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Handle rate limit exceeded error
      console.error("Rate limit exceeded. Please try again later.");
      throw new Error("Rate limit exceeded. Please try again later.");
    } else {
      console.error("Error fetching question:", error.response?.data || error.message);
      throw new Error("Failed to fetch question from OpenAI API.");
    }
  }
}


app.get("/get-question", async (req, res) => {
  try {
    const question = await fetchOpenAIQuestion();
    res.json({ question });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch question from OpenAI API." });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
