import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Specific CORS configuration for your domain
const allowedOrigin = 'https://passionhealth.store';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.use(bodyParser.json());

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'CORS is working!' });
});

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  try {
    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = openaiRes.data.choices[0].message.content;
    console.log("Sending back reply:", reply);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI proxy server running on port ${PORT}`);
});
