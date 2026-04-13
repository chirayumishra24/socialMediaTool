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
    // === MYTHOLOGICAL & SCRIPTURAL SEEDS ===
    {
      text: "Bhagavad Gita Chapter 2, Verse 47: 'Karmanye vadhikaraste ma phaleshu kadachana' — You have the right to perform your duty, but you are not entitled to the fruits of your actions. This teaches detachment from outcomes while maintaining excellence in effort. Modern psychology calls this 'process orientation' — focusing on the journey, not the destination.",
      metadata: { category: "mythology", topic: "bhagavad-gita-karma" },
    },
    {
      text: "Chanakya Niti on Education: 'Vidya dadati vinayam' — Knowledge gives humility. Chanakya's Arthashastra (4th century BCE) described a complete education system covering economics, warfare, governance, and ethics. He believed education without character is dangerous. His spy network and statecraft principles are still studied in modern management.",
      metadata: { category: "mythology", topic: "chanakya-niti" },
    },
    {
      text: "Vedic Mathematics: Ancient Indian mathematicians contributed zero (Aryabhata), the decimal system, algebra (Bhaskaracharya), trigonometry, and the concept of infinity. The Sulba Sutras (800 BCE) contained geometric principles predating Pythagoras. Brahmagupta's formula and Ramanujan's infinite series are foundational to modern mathematics.",
      metadata: { category: "mythology", topic: "vedic-mathematics" },
    },
    {
      text: "Ramayana's Leadership Lessons: Ram's leadership style — leading by example, keeping promises at personal cost, treating all citizens equally. Hanuman teaches devotion and servant leadership. Vibhishana teaches the courage to leave a wrong path. Ravana's 10 heads symbolize 10 types of ego that destroy even the most brilliant minds.",
      metadata: { category: "mythology", topic: "ramayana-leadership" },
    },
    {
      text: "Mahabharata's Strategy & Ethics: Krishna's strategic brilliance in the Kurukshetra war — choosing the right time, adapting to circumstances, and understanding dharma vs adharma. The Mahabharata teaches that silence is consent, that neutrality in injustice is wrong, and that knowledge without action is futile. Vidura Niti contains 500+ management principles.",
      metadata: { category: "mythology", topic: "mahabharata-strategy" },
    },
    {
      text: "Yoga Sutras of Patanjali: 'Yogas chitta vritti nirodhah' — Yoga is the cessation of mental fluctuations. The 8 limbs of yoga (Ashtanga) provide a complete framework for mental wellness: Yama (ethics), Niyama (self-discipline), Asana (postures), Pranayama (breathing), Pratyahara (withdrawal), Dharana (focus), Dhyana (meditation), Samadhi (absorption).",
      metadata: { category: "mythology", topic: "yoga-sutras" },
    },
    {
      text: "Arthashastra Economics: Kautilya's Arthashastra (300 BCE) described taxation, trade regulation, labor laws, infrastructure, and espionage — 1800 years before Adam Smith. It covers GDP calculation principles, market regulation, and even consumer protection. Modern economists recognize it as the world's first comprehensive economics textbook.",
      metadata: { category: "mythology", topic: "arthashastra-economics" },
    },
    {
      text: "Upanishads on Knowledge: 'Tamaso ma jyotirgamaya' — Lead me from darkness to light. The Upanishads distinguish between Para Vidya (spiritual knowledge) and Apara Vidya (material knowledge). The Mundaka Upanishad teaches that true education transforms the learner, not just informs them. 'Satyameva Jayate' (Truth alone triumphs) is India's national motto from the Mundaka Upanishad.",
      metadata: { category: "mythology", topic: "upanishads-knowledge" },
    },
    {
      text: "Panchatantra Storytelling: Written by Vishnu Sharma around 300 BCE to teach statecraft to princes through animal fables. The 5 tantras cover: Mitra Bheda (losing friends), Mitra Labha (gaining friends), Kakolukiyam (war & peace), Labdhapranasam (loss of gains), Aparikshitakarakam (hasty actions). These stories are the foundation of modern storytelling techniques used in content creation.",
      metadata: { category: "mythology", topic: "panchatantra-storytelling" },
    },
    {
      text: "Ayurveda Wellness Principles: The 5000-year-old science identifies 3 doshas (Vata, Pitta, Kapha), recommends eating according to body type, emphasizes circadian rhythm alignment (Dinacharya), and seasonal routines (Ritucharya). Modern science is validating Ayurvedic concepts: turmeric's anti-inflammatory properties, intermittent fasting benefits, and meditation's effect on cortisol.",
      metadata: { category: "mythology", topic: "ayurveda-wellness" },
    },
    {
      text: "Ancient Indian Universities: Nalanda (5th century CE) had 10,000+ students from across Asia studying mathematics, astronomy, medicine, and philosophy. Takshashila (700 BCE) taught 68 subjects including archery, law, and medicine. These were world's first residential universities, predating Oxford by 1500+ years. Their destruction represents one of history's greatest knowledge losses.",
      metadata: { category: "mythology", topic: "ancient-universities" },
    },
    {
      text: "Thirukkural by Thiruvalluvar: 1330 couplets covering virtue, wealth, and love. 'Learn well what should be learnt, then live accordingly' — emphasizing applied knowledge. 'The learned are said to have eyes, but the unlearned have only two sores on their face' — on the transformative power of education. Translated into 40+ languages, considered universal wisdom.",
      metadata: { category: "mythology", topic: "thirukkural-wisdom" },
    },
  ];

  for (const seed of seeds) {
    await addDocument(apiKey, seed.text, seed.metadata);
  }
  
  console.log(`RAG Knowledge Base seeded with ${seeds.length} documents.`);
}
