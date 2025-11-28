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
    // {
    //   q: "交換禮物收到什麼最想直接翻白眼？",
    //   options: ["萬年馬克杯", "奇怪的生肖周邊", "即期護手霜", "包裝精美的空盒"]
    // },
    {
      q: "冬天吃火鍋，加什麼進去會直接毀了整鍋湯？",
      options: ["芋頭", "南瓜", "香菜", "三色豆"]
    },
    {
      q: "如果聖誕老公公失業了，他最適合轉行做什麼？",
      options: ["UberEats 外送員", "闖空門的小偷", "馴鹿養殖戶", "物流公司老闆"]
    },
    {
      q: "單身的人聖誕節都在幹嘛？",
      options: ["在家追劇叫外送", "去耶誕城被閃", "加班裝忙", "在IG發文討拍"]
    },
    // {
    //   q: "哪首聖誕歌聽到前奏就想報警？",
    //   options: ["All I Want For Christmas Is You", "Last Christmas", "Jingle Bells", "恭喜發財 (跑錯棚)"]
    // },
    {
      q: "如果公司辦變裝派對，你最想扮成什麼？",
      options: ["不用露臉的聖誕樹", "性感的聖誕女郎/猛男", "負責發禮物的聖誕老人", "被騎的馴鹿"]
    },
    {
      q: "去 KTV 唱歌，最討厭遇到哪種人？",
      options: ["一直切歌的切歌魔人", "五音不全還霸佔麥克風", "只顧吃牛肉麵不理人", "狂滑手機完全不嗨"]
    },
    {
      q: "半夜肚子餓，哪種宵夜最罪惡但也最爽？",
      options: ["剛炸好的鹹酥雞", "泡麵加蛋加起司", "麥當勞歡樂送", "永和豆漿配油條"]
    },
    {
      q: "如果可以擁有一種超能力，你最想要什麼？",
      options: ["財富自由的「鈔能力」", "吃不胖的體質", "瞬間移動到世界各地", "聽見別人心聲的讀心術"]
    },
    {
      q: "跟曖昧對象第一次約會，去哪裡最 NG？",
      options: ["吃到飽餐廳 (吃相曝光)", "帶回家見爸媽", "充滿煙味的網咖", "會大爆汗的爬山行程"]
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
