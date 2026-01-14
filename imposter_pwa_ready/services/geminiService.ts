import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Category, RoundData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-3-flash-preview";

const roundDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    secretWord: {
      type: Type.STRING,
      description: "The secret word for the players to describe.",
    },
    category: {
      type: Type.STRING,
      description: "The category the word belongs to.",
    },
    hint: {
      type: Type.STRING,
      description: "A subtle, 1-2 word hint about the secret word.",
    },
  },
  required: ["secretWord", "category", "hint"],
};

export const generateGameRound = async (
  enabledCategories: Category[],
  usedWords: Record<string, string[]>,
  difficulty: number = 1
): Promise<RoundData> => {
  
  if (enabledCategories.length === 0) {
    throw new Error("No categories selected.");
  }

  // Select a category in code to ensure random distribution
  const selectedCategory = enabledCategories[Math.floor(Math.random() * enabledCategories.length)];
  
  // Get history specifically for this category and limit to last 50
  const categoryHistory = usedWords[selectedCategory] || [];
  const recentWords = categoryHistory.slice(-50);

  // Specific instruction for Historical Events to include requested style
  const historicalNote = selectedCategory === Category.HistoricalEvents 
    ? "You may occasionally choose edgy or internet-culture relevant events (e.g., Fyre Festival, Area 51 Raid, specific historical assassinations, or major viral moments) in addition to standard history." 
    : "";

  const peopleNote = selectedCategory === Category.People
    ? "Choose very common celebrities or famous people. Examples include: Nixon, P Diddy, Drake, Bad Bunny, Timothée Chalamet, Max Verstappen, Tom Cruise, Elon Musk, Donald Trump, etc."
    : "";

  // Adjust prompt based on difficulty slider (1-10)
  // 1 = Easy (Vague but connected)
  // 10 = Hard (Extremely abstract)
  let hintInstruction = "";
  if (difficulty <= 3) {
    hintInstruction = "Create a hint that is vague but definitely connected. It should be easier to understand than a purely abstract concept, but still not an immediate giveaway.";
  } else if (difficulty >= 8) {
    hintInstruction = "Create a hint that is EXTREMELY vague, abstract, and difficult.";
  } else {
    hintInstruction = `Create a hint with a difficulty of ${difficulty}/10 (where 1 is helpful/easy and 10 is extremely abstract). It should be moderately vague.`;
  }

  // Inject random stylistic direction to ensure variety ("lots of words")
  const styles = [
    "a very popular and iconic example",
    "a classic or traditional example",
    "a modern or trending example",
    "a specific but recognizable example",
    "a broad concept or type within the category",
    "an example that is distinct from typical choices"
  ];
  const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

  const systemInstruction = `
    You are a game master for the party game 'Imposter' (similar to Spyfall).
    Your goal is to generate a secret word, its category, and a hint based on the selected category.
    
    Target Category: ${selectedCategory}
    Target Style: ${selectedStyle}
    
    Rules:
    1. Generate a secret word/concept specifically for the category: "${selectedCategory}".
    2. ${hintInstruction}
    3. The hint MUST be exactly 1 or 2 words long. Do not use more than 2 words.
    4. ${historicalNote} ${peopleNote}
    5. CRITICAL: Ensure the secret word is NOT in this list of previously used words for this category: ${JSON.stringify(recentWords)}.
    6. Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Generate a new game round.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: roundDataSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as RoundData;
      // Double check category matches selected (Gemini is usually good, but just to be safe in UI)
      data.category = selectedCategory; 
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of API error to keep app usable
    return {
      secretWord: "Error Generating Word",
      category: "System",
      hint: "Try Again",
    };
  }
};