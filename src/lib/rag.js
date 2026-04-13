/**
 * EduTrend AI Agent — RAG (Retrieval-Augmented Generation) Pipeline
 * In-memory vector store with Gemini text-embedding-004 for educational content grounding.
 */

import { GoogleGenAI } from "@google/genai";

// In-memory vector store
let vectorStore = [];
let embeddingModel = null;

function getEmbeddingModel(apiKey) {
  if (!embeddingModel) {
    embeddingModel = new GoogleGenAI({ apiKey });
  }
  return embeddingModel;
}

/**
 * Generate an embedding vector for a text string using Gemini.
 */
async function embed(apiKey, text) {
  try {
    const ai = getEmbeddingModel(apiKey);
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text.substring(0, 2048), // Limit to 2K chars for efficiency
    });
    return result.embedding.values;
  } catch (err) {
    console.error("Embedding error:", err.message);
    // Fallback: simple hash-based pseudo-embedding (32 dims)
    return simpleHash(text);
  }
}

/**
 * Fallback: deterministic pseudo-embedding when API fails.
 */
function simpleHash(text) {
  const dims = 32;
  const vec = new Array(dims).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % dims] += text.charCodeAt(i) / 1000;
  }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / mag);
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

/**
 * Add a document to the vector store.
 */
export async function addDocument(apiKey, text, metadata = {}) {
  const embedding = await embed(apiKey, text);
  const doc = {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: text.substring(0, 5000),
    embedding,
    metadata: {
      ...metadata,
      addedAt: new Date().toISOString(),
    },
  };
  vectorStore.push(doc);
  // Keep store manageable — max 200 docs
  if (vectorStore.length > 200) {
    vectorStore = vectorStore.slice(-200);
  }
  return doc.id;
}

/**
 * Search the vector store for the most relevant documents.
 */
export async function search(apiKey, query, topK = 3) {
  if (vectorStore.length === 0) return [];
  
  const queryEmbedding = await embed(apiKey, query);
  
  const scored = vectorStore.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, topK).map(({ text, metadata, score }) => ({
    text,
    metadata,
    relevanceScore: Math.round(score * 100) / 100,
  }));
}

/**
 * Get the current store size.
 */
export function getStoreSize() {
  return vectorStore.length;
}

/**
 * Seed the store with foundational educational content templates.
 */
export async function seedKnowledgeBase(apiKey) {
  if (vectorStore.length > 0) return; // Already seeded

  const seeds = [
    {
      text: "The Pomodoro Technique is a time management method where you study for 25 minutes then take a 5-minute break. After 4 cycles, take a 15-30 minute break. Studies show this improves focus by 40% and reduces mental fatigue.",
      metadata: { category: "study-techniques", topic: "pomodoro" },
    },
    {
      text: "Active recall is a learning strategy where you actively stimulate memory during the learning process. Instead of re-reading notes, you close the book and try to recall from memory. Research by Karpicke & Blunt (2011) showed active recall produces 50% more retention than passive review.",
      metadata: { category: "study-techniques", topic: "active-recall" },
    },
    {
      text: "Spaced repetition is an evidence-based learning technique where you review information at increasing intervals. The Ebbinghaus forgetting curve shows we forget 70% of new information within 24 hours without review. Spaced repetition combats this.",
      metadata: { category: "study-techniques", topic: "spaced-repetition" },
    },
    {
      text: "The Feynman Technique involves 4 steps: 1) Choose a concept 2) Teach it to a child 3) Identify gaps in your explanation 4) Review and simplify. Named after Nobel physicist Richard Feynman, this technique forces deep understanding.",
      metadata: { category: "study-techniques", topic: "feynman-technique" },
    },
    {
      text: "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. The equation is 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. It occurs in the chloroplasts of plant cells.",
      metadata: { category: "science", topic: "photosynthesis" },
    },
    {
      text: "Newton's Three Laws of Motion: 1) An object at rest stays at rest unless acted upon by a force. 2) Force equals mass times acceleration (F=ma). 3) Every action has an equal and opposite reaction. These are fundamental to classical mechanics.",
      metadata: { category: "science", topic: "newton-laws" },
    },
    {
      text: "The water cycle (hydrological cycle) has 4 main stages: Evaporation (water to vapor), Condensation (vapor to clouds), Precipitation (clouds to rain/snow), Collection (water gathers in rivers/oceans). 97% of Earth's water is in oceans.",
      metadata: { category: "science", topic: "water-cycle" },
    },
    {
      text: "Artificial Intelligence (AI) refers to computer systems designed to perform tasks that typically require human intelligence. Key branches include Machine Learning (learning from data), Natural Language Processing (understanding text), and Computer Vision (understanding images).",
      metadata: { category: "technology", topic: "ai-basics" },
    },
    {
      text: "The Indian National Education Policy (NEP) 2020 restructures education into a 5+3+3+4 system replacing the 10+2. It emphasizes mother tongue instruction, coding from Class 6, multidisciplinary learning, and flexibility in subject choice at higher secondary level.",
      metadata: { category: "education-policy", topic: "nep-2020" },
    },
    {
      text: "Climate change refers to long-term shifts in global temperatures and weather patterns. Since 1880, global temperature has risen by ~1.1°C. The main cause is burning fossil fuels (coal, oil, gas) which releases greenhouse gases like CO2 and methane.",
      metadata: { category: "science", topic: "climate-change" },
    },
    {
      text: "The human brain has approximately 86 billion neurons. Neuroplasticity means the brain can rewire itself throughout life. Key factors for brain health: Regular exercise increases BDNF by 30%, 7-9 hours of sleep consolidates memory, and meditation increases gray matter density.",
      metadata: { category: "science", topic: "brain-science" },
    },
    {
      text: "Effective YouTube video structure: Hook (0-15s) with a bold claim or question, Promise (15-30s) telling viewers what they'll learn, Value delivery (core body) with 3-5 key insights, Retention loop to maintain watch time, and CTA (final 15s) with subscribe prompt.",
      metadata: { category: "content-creation", topic: "youtube-structure" },
    },
    {
      text: "Instagram Reels algorithm prioritizes: 1) Watch time and completion rate (most important), 2) Saves and shares (high engagement signal), 3) Likes and comments, 4) Audio trending usage. Optimal Reel length is 15-30 seconds for maximum completion rate.",
      metadata: { category: "content-creation", topic: "instagram-algorithm" },
    },
    {
      text: "SEO for educational content: Long-tail keywords outperform broad terms. 'How to study effectively for exams' gets more targeted traffic than 'study tips'. Use primary keyword in title (first 60 chars), repeat naturally 3-5 times in description, and use tiered hashtag strategy.",
      metadata: { category: "content-creation", topic: "seo-education" },
    },
    {
      text: "The solar system has 8 planets: Mercury, Venus, Earth, Mars (terrestrial), Jupiter, Saturn (gas giants), Uranus, Neptune (ice giants). The Sun accounts for 99.86% of the solar system's mass. Light takes ~8 minutes to travel from Sun to Earth.",
      metadata: { category: "science", topic: "solar-system" },
    },
    {
      text: "Blockchain is a decentralized digital ledger technology. Each block contains transaction data, a timestamp, and a cryptographic hash of the previous block. This chain makes it nearly impossible to alter past records. Bitcoin was the first blockchain application (2009).",
      metadata: { category: "technology", topic: "blockchain" },
    },
    {
      text: "Growth mindset vs. fixed mindset (Carol Dweck, 2006): People with growth mindset believe abilities can be developed through effort. Those with fixed mindset believe abilities are innate. Students with growth mindset earn higher grades and show greater resilience.",
      metadata: { category: "psychology", topic: "growth-mindset" },
    },
    {
      text: "The Indian space program (ISRO) achievements: Chandrayaan-3 successfully landed near Moon's south pole (2023), Mangalyaan orbited Mars in first attempt (2014), and Aditya-L1 is India's first solar observatory mission. ISRO is known for cost-effective missions.",
      metadata: { category: "science", topic: "isro" },
    },
    {
      text: "Digital literacy for students includes: Understanding online privacy and data protection, recognizing misinformation and deepfakes, using AI tools responsibly (ChatGPT, Gemini), basic coding concepts, and cybersecurity awareness. These are essential 21st-century skills.",
      metadata: { category: "education", topic: "digital-literacy" },
    },
    {
      text: "Quantum computing uses qubits instead of classical bits. While a bit is 0 or 1, a qubit can be both simultaneously (superposition). Quantum entanglement allows qubits to be correlated. Google's Sycamore processor achieved quantum supremacy in 2019.",
      metadata: { category: "technology", topic: "quantum-computing" },
    },
  ];

  for (const seed of seeds) {
    await addDocument(apiKey, seed.text, seed.metadata);
  }
  
  console.log(`RAG Knowledge Base seeded with ${seeds.length} documents.`);
}
