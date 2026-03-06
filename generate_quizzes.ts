import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Define O-Level subjects we want to seed quizzes for
const subjectsToQuiz = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography'
];

async function generateQuizzes() {
  console.log('🌟 Starting AI Quiz Generation pipeline...');
  
  if (!geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY not found in .env.local! Falling back to static high-quality fallback quizzes.');
    await insertStaticFallbackQuizzes();
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (const subject of subjectsToQuiz) {
      console.log(`\n🤖 Generating world-class quiz for ${subject}...`);
      
      const prompt = `
        You are an expert examiner for the Uganda National Examinations Board (UNEB) O-Level syllabus.
        Generate a high-quality, challenging 5-question multiple choice quiz for the subject "${subject}".
        Return ONLY a valid JSON object with the following structure exactly (no markdown formatting, no backticks, just raw JSON):
        
        {
          "title": "O-Level ${subject} Master Quiz",
          "subject": "${subject}",
          "questions": [
            {
              "question": "The actual question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct": 0
            }
          ]
        }
        
        Note: The "correct" field must be the 0-based integer index of the correct option (0, 1, 2, or 3).
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean potential markdown blocks
      if (text.startsWith('```json')) text = text.substring(7);
      if (text.endsWith('```')) text = text.substring(0, text.length - 3);
      
      const quizData = JSON.parse(text);

      const { data, error } = await supabase.from('quizzes').insert(quizData).select();
      
      if (error) {
        console.error(`❌ Failed to insert ${subject} quiz:`, error.message);
      } else {
        console.log(`✅ successfully seeded AI Quiz: ${quizData.title}`);
      }
    }

    console.log('\n🎉 AI Quiz Generation Pipeline Complete!');

  } catch (error) {
    console.error('Crash during generation:', error);
  }
}

// Fallback if no API key is provided
async function insertStaticFallbackQuizzes() {
  console.log('Inserting detailed static fallback quizzes...');
  const fallbacks = [
    {
      title: "O-Level Physics Master Quiz",
      subject: "Physics",
      questions: [
        {
          question: "Which of the following describes acceleration?",
          options: ["Rate of change of distance", "Rate of change of velocity", "Rate of change of displacement", "Rate of change of momentum"],
          correct: 1
        },
        {
          question: "What is the SI unit of force?",
          options: ["Joule", "Watt", "Newton", "Pascal"],
          correct: 2
        }
      ]
    },
    {
      title: "O-Level Mathematics Challenge",
      subject: "Mathematics",
      questions: [
        {
          question: "Solve for x: 3x + 5 = 20",
          options: ["x = 5", "x = 15", "x = 4", "x = 6"],
          correct: 0
        },
        {
          question: "What is the derivative of x^2?",
          options: ["x", "2x", "x^2", "1"],
          correct: 1
        }
      ]
    }
  ];

  for(const quiz of fallbacks) {
     const { error } = await supabase.from('quizzes').insert(quiz);
     if (error) console.error("Error inserting fallback:", error.message);
     else console.log(`Inserted fallback quiz for ${quiz.subject}`);
  }
}

generateQuizzes();
