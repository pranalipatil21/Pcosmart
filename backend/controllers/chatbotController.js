const { GoogleGenerativeAI } = require("@google/generative-ai");

const getChatbotAiResponse = async (req, res) => {
  try {
    const { message, history } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.CHATBOT_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: {
        parts: [{ 
          text: `You are Cora, a PCOS Assistant. 
          RULES:
          1. Keep answers VERY SHORT (maximum 3 sentences).
          2. Use bullet points for lists.
          3. Do not fluff your language. Get straight to the point.
          4. Always end with: "Consult a doctor for specific advice."` 
        }]
      }
    });

    const chat = model.startChat({
      history: Array.isArray(history) && history.length > 0 ? history : [],
      generationConfig: {
        maxOutputTokens: 150, 
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error("CHATBOT ERROR:", error.message);
    res.status(500).json({ error: "Service busy, please try again." });
  }
};

module.exports = { getChatbotAiResponse };