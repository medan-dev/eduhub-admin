import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const O_LEVEL_GRADES = ['Senior One (S.1)', 'Senior Two (S.2)', 'Senior Three (S.3)', 'Senior Four (S.4)'];
const A_LEVEL_GRADES = ['Senior Five (S.5)', 'Senior Six (S.6)'];

const SUBJECTS_DATA = [
  // Sciences
  { name: 'Mathematics', stream: 'Sciences', icon_name: 'ic_math', overview: 'Core mathematics covering algebra, geometry, and calculus.' },
  { name: 'Physics', stream: 'Sciences', icon_name: 'ic_physics', overview: 'Study of matter, energy, and the fundamental forces of nature.' },
  { name: 'Chemistry', stream: 'Sciences', icon_name: 'ic_chemistry', overview: 'Study of substances, their properties, and reactions.' },
  { name: 'Biology', stream: 'Sciences', icon_name: 'ic_biology', overview: 'Study of living organisms and their vital processes.' },
  { name: 'Agriculture', stream: 'Sciences', icon_name: 'ic_agriculture', overview: 'Principles and practices of crop and animal farming.' },
  { name: 'Computer Studies', stream: 'Sciences', icon_name: 'ic_computer', overview: 'Introduction to computers, software, and programming.' },
  { name: 'Technical Drawing', stream: 'Technical', icon_name: 'ic_drawing', overview: 'Creating detailed visual representations for engineering.' },
  { name: 'Sub-Mathematics', stream: 'Sciences', icon_name: 'ic_math', overview: 'Subsidiary mathematics for non-principal math students.' },
  { name: 'Sub-ICT', stream: 'Sciences', icon_name: 'ic_computer', overview: 'Subsidiary Information and Communication Technology.' },
  // Arts
  { name: 'English Language', stream: 'Arts', icon_name: 'ic_english', overview: 'Grammar, comprehension, and writing skills.' },
  { name: 'Literature in English', stream: 'Arts', icon_name: 'ic_literature', overview: 'Analysis of literary texts including plays, novels, and poetry.' },
  { name: 'History', stream: 'Arts', icon_name: 'ic_history', overview: 'Study of past events, particularly African and European history.' },
  { name: 'Geography', stream: 'Arts', icon_name: 'ic_geography', overview: 'Study of the physical features of the earth and its atmosphere.' },
  { name: 'Christian Religious Education', stream: 'Arts', icon_name: 'ic_religion', overview: 'Study of Christian teachings and morals.' },
  { name: 'Islamic Religious Education', stream: 'Arts', icon_name: 'ic_religion', overview: 'Study of Islamic teachings and morals.' },
  { name: 'Commerce', stream: 'Arts', icon_name: 'ic_commerce', overview: 'Study of trade, business, and commercial activities.' },
  { name: 'Entrepreneurship', stream: 'Arts', icon_name: 'ic_business', overview: 'Principles of starting and managing a business.' },
  { name: 'Economics', stream: 'Arts', icon_name: 'ic_economics', overview: 'Study of production, consumption, and wealth transfer.' },
  { name: 'Fine Art', stream: 'Arts', icon_name: 'ic_art', overview: 'Drawing, painting, and visual arts.' },
  { name: 'General Paper', stream: 'Arts', icon_name: 'ic_gp', overview: 'General knowledge, current affairs, and logical reasoning.' }
];

const YOUTUBE_VIDEOS = [
  { id: 'M7lc1UVf-VE', channel: 'EduHub Academy' },
  { id: 'kJQP7kiw5Fk', channel: 'Uganda E-Learning' },
  { id: 'jNQXAC9IVRw', channel: 'Teacher Mark' },
  { id: 'tPEE9ZwTmy0', channel: 'Science Today' },
  { id: 'V-_O7nl0Ii0', channel: 'History Buffs' }
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function clearExistingData() {
  console.log("Clearing existing data...");
  await supabase.from('videos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('papers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

async function seedSubjects() {
  console.log("Seeding Subjects...");
  const subjectsToInsert = SUBJECTS_DATA.map(s => ({
    name: s.name,
    stream: s.stream,
    overview: s.overview,
    icon_name: s.icon_name,
    syllabus: ['Term 1 Overview', 'Term 2 Details', 'Term 3 Revision']
  }));

  const { data, error } = await supabase.from('subjects').insert(subjectsToInsert).select();
  if (error) {
    console.error("Error seeding subjects:", error);
    process.exit(1);
  }
  console.log(`Successfully inserted ${data.length} subjects.`);
  return data; // returns the inserted subjects
}

async function seedPapers(subjects: any[]) {
  console.log("Seeding Papers...");
  const papersToInsert = [];

  for (const subject of subjects) {
    // Generate 15 papers per subject
    for (let i = 1; i <= 15; i++) {
      const year = getRandomInt(2010, 2023).toString();
      const paperNumber = getRandomInt(1, 4);
      const isMock = Math.random() > 0.7;
      
      papersToInsert.push({
        title: `${subject.name} Paper ${paperNumber} ${isMock ? 'Mock' : 'UNEB'} ${year}`,
        subject: subject.name,
        year: year,
        duration: `${getRandomInt(2, 3)} hours`,
        total_marks: 100,
        pass_mark: getRandomInt(40, 50),
        difficulty: (Math.random() * (5.0 - 2.0) + 2.0).toFixed(1),
        pdf_url: `https://example.com/papers/${subject.name.toLowerCase().replace(/ /g, '_')}_${year}.pdf`
      });
    }
  }

  // Insert in batches of 50 to avoid limits
  for (let i = 0; i < papersToInsert.length; i += 50) {
    const batch = papersToInsert.slice(i, i + 50);
    const { error } = await supabase.from('papers').insert(batch);
    if (error) console.error("Error inserting papers batch:", error);
  }
  console.log(`Successfully inserted ${papersToInsert.length} papers.`);
}

async function seedVideos(subjects: any[]) {
  console.log("Seeding Videos...");
  const videosToInsert = [];

  for (const subject of subjects) {
    // Generate 20 videos per subject
    for (let i = 1; i <= 20; i++) {
      const level = Math.random() > 0.4 ? 'O-Level' : 'A-Level';
      const grade = level === 'O-Level' ? getRandomElement(O_LEVEL_GRADES) : getRandomElement(A_LEVEL_GRADES);
      const ytVideo = getRandomElement(YOUTUBE_VIDEOS);
      
      videosToInsert.push({
        title: `Understanding ${subject.name} - Lesson ${i}`,
        channel: ytVideo.channel,
        duration: `${getRandomInt(10, 60)}min`,
        views: `${getRandomInt(1, 500)}k views`,
        published_date: `${getRandomElement(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])} ${getRandomInt(2020, 2024)}`,
        description: `Comprehensive lesson on ${subject.name} specifically tailored for ${grade} students following the Ugandan syllabus.`,
        youtube_id: ytVideo.id,
        subject: subject.name,
        level: level,
        grade: grade
      });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < videosToInsert.length; i += 50) {
    const batch = videosToInsert.slice(i, i + 50);
    const { error } = await supabase.from('videos').insert(batch);
    if (error) console.error("Error inserting videos batch:", error);
  }
  console.log(`Successfully inserted ${videosToInsert.length} videos.`);
}

async function seedDatabase() {
  await clearExistingData();
  const insertedSubjects = await seedSubjects();
  if (insertedSubjects) {
    await seedPapers(insertedSubjects);
    await seedVideos(insertedSubjects);
  }
  console.log("Database Seeding Completed Successfully!");
  process.exit(0);
}

seedDatabase();
