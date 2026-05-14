
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  console.log('Testing OpenAI connection...');
  console.log('Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 7));
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: "hi" }],
    });
    console.log('✅ Success! Response:', response.choices[0].message.content);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    if (err.message.includes('model_not_found')) {
      console.log('💡 Suggestion: The model name "gpt-5.4-mini" might be incorrect or not yet available on your tier.');
    }
  }
}

test();
