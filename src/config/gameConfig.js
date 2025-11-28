// Game Configuration
// You can adjust questions, options, and scores here.

export const LEVEL1_CONFIG = {
  TITLE: "Majority Rules",
  RULES: "選出你覺得「大多數人」會選的答案。只要跟隨主流，就能得分！",
  
  // Points awarded for choosing the majority option
  POINTS_PER_WIN: 10,

  // Questions list
  // You can add as many questions as you want.
  QUESTIONS: [
    {
      q: "聖誕節必備的食物是什麼？",
      options: ["烤雞", "薑餅人", "熱騰騰的火鍋", "披薩"]
    },
    {
      q: "哪首聖誕歌聽到最想翻白眼？",
      options: ["All I Want for Christmas", "Last Christmas", "Jingle Bells", "Baby Shark (聖誕版)"]
    },
    {
      q: "收到什麼禮物最開心？",
      options: ["現金", "3C 產品", "手作卡片", "機票"]
    }
  ]
};

// Placeholder for future levels
export const LEVEL2_CONFIG = {
  TITLE: "Who Knows Me?",
  RULES: "螢幕上會出現一個秘密，猜猜這是誰的？越了解朋友，分數越高！",
  POINTS_PER_WIN: 20,
};

export const LEVEL3_CONFIG = {
  TITLE: "Ultimate Password",
  RULES: "炸彈倒數中！輪流猜數字，猜中密碼的人... BOOM！扣分，倖存者得分。",
  ROUNDS: [
    { range: 100, penalty: -20, reward: 10 },  // Round 1
    { range: 100, penalty: -40, reward: 20 },  // Round 2
    { range: 100, penalty: -80, reward: 40 }   // Round 3
  ]
};
