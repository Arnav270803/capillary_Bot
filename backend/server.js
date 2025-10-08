const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const math = require('mathjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;// our port of backend is 5000

app.use(cors({ origin: '*' }));
app.use(express.json());

// this is the initialization of the empty scraped data object and defining path to json file 
let scrapedData = {};
const DATA_FILE = path.join(__dirname, 'scraped_docs.json');
const EMBED_FILE = path.join(__dirname, 'embedded_docs.json');
//Reads as UTF-8, trims whitespace, parses to JS object if non-empty, logs "vector mode.
try {
  if (fs.existsSync(EMBED_FILE)) {//Checks if embedded_docs.json exists
    const embedData = fs.readFileSync(EMBED_FILE, 'utf8');//If yes, reads raw string
    if (embedData.trim()) {
      scrapedData = JSON.parse(embedData);
      console.log('Loaded embedded data (vector mode)');
    } else {//If empty, logs fallback
      console.log('Embedded file empty, falling back to scraped');
    }
  }
  if (!Object.keys(scrapedData).length && fs.existsSync(DATA_FILE)) {//If still empty and scraped_docs.json exists, reads/parses that (raw text mode), logs "keyword mode.
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    if (data.trim()) {
      scrapedData = JSON.parse(data);
      console.log('Loaded scraped data (keyword mode)');
    } else {
      console.log('Scraped file empty - using fallback empty data');
      scrapedData = {};
    }
  }
  if (!Object.keys(scrapedData).length) {//Final check: If scrapedData has no keys
    console.warn('No data loaded. Run scraper first.');
  }
} catch (err) {
  console.error('Data load error:', err.message);
  scrapedData = {};
}
// embedding flags here 
const hasEmbeddings = !!Object.values(scrapedData)[0]?.embeddings;

//Cosine Similarity Helper Function
function cosineSimilarity(vecA, vecB) {// taking 2 array 
  const dot = math.dot(vecA, vecB);// dot : sum of products 
  const normA = math.norm(vecA); // square root of sum of squares which is array length 
  const normB = math.norm(vecB);
  return dot / (normA * normB);//returns cosine value
}

// Retrieve relevant chunks (keyword fallback; vector placeholder)
function retrieveChunks(query, topK = 5) {
  if (!Object.keys(scrapedData).length) return 'No data available.';
  const queryLower = query.toLowerCase();
  let scored = [];
  if (hasEmbeddings) {
    console.warn('Vector mode: Query embedding not implemented; using keyword fallback.');
  }
  // Keyword retrieval
  const queryWords = queryLower.split(/\s+/);
  for (const [url, page] of Object.entries(scrapedData)) {
    page.chunks.forEach((chunk, idx) => {
      const score = queryWords.reduce((acc, word) => acc + (chunk.toLowerCase().includes(word) ? 1 : 0), 0);
      if (score > 0) scored.push({ chunk, source: `${page.title} (${url}) #${idx}`, score });
    });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => `Section: ${item.source}\n${item.chunk}`)
    .join('\n\n---\n\n') || 'No relevant context found.';
}

// Health check route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Backend OK', dataLoaded: Object.keys(scrapedData).length > 0 });
});

// Test route (like your old testPrompt)
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Backend is alive' });
});





{/*---------------------------Main chat route block imported from the openrouter and i also updated it to - mistral-small-24b-instruct-2501:free because it works well with chatbots -------------------------------------------------------------- */}
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Retrieve context (RAG step)
    const context = retrieveChunks(message);
    console.log('Retrieved context length:', context.length); // Log like your old code

    // Prompt for Mistral (tweaked for precision and citations)
    const mistralPrompt = `You are a CapillaryTech expert assistant, responding like a professional docs bot. Base your answer EXCLUSIVELY on the provided context. Structure your response exactly like this example for clarity and actionability:

- **Start the first line with the keyword "Capillary"** (e.g., "In Capillary, you can access...") emphasized in bold if appropriate, to reference the company prominently.
- Follow with a brief intro sentence summarizing the answer.
- Use a numbered list (1., 2., etc.) for each method or option, with **bold** section titles (e.g., **Method 1: Member Care**).
- For each point: Provide a concise explanation, navigation paths in Member Care, or full API endpoints in code blocks.
- Include API details as GET/POST requests in \`\`\`http blocks with a short description.
- For implementation: Add a relevant code snippet in \`\`\`javascript or \`\`\`python with 1-sentence usage note.
- Elaborate with 2-4 key details per point, using bullets if needed.
- Cite sources inline as [Title (URL)] after key facts.
- End with any additional tips if relevant.

If no relevant info: "No relevant information found in the docs. Consider checking InTouch for trackers and insights."

**Context**:
${context}

**User Query**: ${message}

**Structured Response**:`;

    const mistralRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-small-24b-instruct-2501:free',  // Updated to Mistral Small 3 (free, low-latency)
        messages: [{ role: 'user', content: mistralPrompt }],
        max_tokens: 1500,
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.YOUR_SITE_URL,
          'X-Title': process.env.YOUR_SITE_NAME,
          'Content-Type': 'application/json',
        },
      }
    );

    const answer = mistralRes.data.choices[0].message.content.trim();
    console.log('Mistral response length:', answer.length); // Updated log for new model

    res.json({ success: true, answer });
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message); // Like your old error logging
    res.status(500).json({ success: false, message: 'Error generating response' });
  }
});

// // it is just starting server here 
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});