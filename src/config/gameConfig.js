// Game Configuration
// You can adjust questions, options, and scores here.

export const LEVEL1_CONFIG = {
  TITLE: "Majority Rules",
  RULES: "Choose the option you think the MAJORITY will pick. If you pick the most popular answer, you get points!",
  
  // Points awarded for choosing the majority option
  POINTS_PER_WIN: 10,

  // Questions list
  // You can add as many questions as you want.
  QUESTIONS: [
    {
      q: "What is the most essential Christmas food?",
      options: ["Roast Chicken", "Gingerbread", "Hot Pot", "Pizza"]
    },
    {
      q: "Which Christmas song is the most annoying?",
      options: ["All I Want for Christmas", "Last Christmas", "Jingle Bells", "Baby Shark (Xmas ver)"]
    },
    {
      q: "Best gift to receive?",
      options: ["Cash", "Gadgets", "Handmade Card", "Travel Ticket"]
    }
  ]
};

// Placeholder for future levels
export const LEVEL2_CONFIG = {
  TITLE: "Who Knows Me?",
  RULES: "A secret will appear on screen. Guess which player it belongs to! If you know your friends well, you'll win big.",
  POINTS_PER_WIN: 20,
};

export const LEVEL3_CONFIG = {
  TITLE: "Ultimate Password",
  RULES: "The Bomb is ticking! Take turns guessing the number. If you guess the password... BOOM! You lose points, others survive and gain points.",
  ROUNDS: [
    { range: 100, penalty: -20, reward: 10 },  // Round 1
    { range: 100, penalty: -40, reward: 20 },  // Round 2
    { range: 100, penalty: -80, reward: 40 }   // Round 3
  ]
};
