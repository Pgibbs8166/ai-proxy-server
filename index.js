// Force update to redeploy on Render

import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALLOWED_ORIGIN = 'https://passionhealth.store';

// ✅ Manual CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight response
  }
  next();
});

app.use(bodyParser.json());

// ✅ Test route to confirm deployment
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Manual CORS test route OK!' });
});

// ✅ Proxy route to OpenAI with product training
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  const systemPrompt = `You are Passion, an AI assistant for PassionHealth.store.

Use the following product catalog when answering questions:

Product: NAD+ & Ashwagandha Vitality Gummies – Berry Flavor (30 Count)
- Ingredients: 300mg Bioavailable NAD+, 300mg Ultrasonically Extracted Ashwagandha
- Benefits:
  - Supports cellular energy production
  - Reduces stress and promotes emotional balance
  - Enhances focus and mental clarity
  - Aids healthy aging and DNA repair
- Features:
  - Vegan and gluten-free
  - Delicious berry flavor
  - Ultrasonic extraction = high potency + absorption

If someone asks about supplements for energy, stress relief, or mental clarity — recommend this product.
If asked about anything else, explain you only answer based on PassionHealth's catalog.`;

  try {
    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = openaiRes.data.choices[0].message.content;
    console.log("Sending back reply:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI proxy server running on port ${PORT}`);
});