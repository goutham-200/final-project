import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Student from './models/Student.js';
import Strategy from './models/Strategy.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itsre");
    console.log("Connected to seed.");

    const existingUsers = await User.countDocuments();
    const existingStrategies = await Strategy.countDocuments();

    // ── Only wipe + re-seed if DB is completely empty ──
    // This preserves all data created through the UI.
    // To force a full reset, run: node seed.js --reset
    const forceReset = process.argv.includes('--reset');

    if (existingUsers > 0 && !forceReset) {
      console.log(`DB already has ${existingUsers} users and ${existingStrategies} strategies. Skipping seed.`);
      console.log("Run 'node seed.js --reset' to force a full wipe and re-seed.");
      process.exit(0);
    }

    if (forceReset) {
      console.log("Force reset: wiping all data...");
    }

    // Clear DB
    await User.deleteMany();
    await Student.deleteMany();
    await Strategy.deleteMany();

    // Create Demo Teacher
    const demoTeacher = await User.create({
      name: "Demo Teacher",
      email: "teacher@demo.com",
      password: "password", // Will be hashed via pre-save hook
      role: "Teacher"
    });

    const demoAdmin = await User.create({
      name: "Super Admin",
      email: "admin@demo.com",
      password: "password",
      role: "Super Admin"
    });

    const demoStudentAccount = await User.create({
      name: "Alice Johnson",
      email: "student@demo.com",
      password: "password",
      role: "Student"
    });

    // Create dummy students
    const student1 = await Student.create({
      name: "Alice Johnson",
      teacherId: demoTeacher._id,
      userId: demoStudentAccount._id,   // ← linked to student@demo.com
      grade: "10th",
      rollNumber: "101",
      subjectMarks: [
        { subject: 'Mathematics',      marks: 62, maxMarks: 100, examType: 'Mid Term' },
        { subject: 'Science',          marks: 45, maxMarks: 100, examType: 'Mid Term' },
        { subject: 'English',          marks: 78, maxMarks: 100, examType: 'Mid Term' },
        { subject: 'History',          marks: 38, maxMarks: 100, examType: 'Mid Term' },
        { subject: 'Computer Science', marks: 88, maxMarks: 100, examType: 'Mid Term' },
      ],
      totalClasses: 120,
      attendedClasses: 98,
      learningStyle: "Visual",
      notes: "Alice shows great potential in Computer Science. Needs additional support in History and Science."
    });

    const student2 = await Student.create({
      name: "Bob Smith",
      teacherId: demoTeacher._id,
      grade: "10th",
      subjectWeaknesses: ["History"],
      learningStyle: "Kinesthetic",
      performanceScore: 65,
      notes: "Needs engaging activities."
    });

    // Create default strategy
    const strategies = [
      // ── Visual Learner Strategies ──────────────────────────────
      {
        title: "Mind Mapping",
        description: "Students create visual diagrams linking concepts and ideas. Especially effective for understanding complex relationships in Science, History, and Biology.",
        targetLearningStyles: ["Visual", "Reading-Writing"],
        subjectTags: ["Science", "History", "Biology", "Geography"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Concept Mapping",
        description: "Visual diagrams that show relationships between concepts. Proven to improve retention for visual learners and effective for Physics and Chemistry.",
        targetLearningStyles: ["Visual", "Reading-Writing"],
        subjectTags: ["Physics", "Chemistry", "Computer Science", "Science"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Graphic Organizers & Flowcharts",
        description: "Structured visual tools that organize information step-by-step. Ideal for Mathematics problem-solving sequences and Computer Science algorithms.",
        targetLearningStyles: ["Visual"],
        subjectTags: ["Mathematics", "Computer Science", "Physics"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Video-Based Learning",
        description: "Short educational videos (5–10 min) followed by comprehension questions. Highly effective for low-attendance students who missed classroom sessions.",
        targetLearningStyles: ["Visual", "Auditory"],
        subjectTags: ["All Subjects", "Science", "Mathematics", "History"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      // ── Auditory Learner Strategies ────────────────────────────
      {
        title: "Think-Pair-Share",
        description: "Students think individually, discuss with a partner, then share with the class. Boosts comprehension through verbal articulation — great for all subjects.",
        targetLearningStyles: ["Auditory", "Kinesthetic"],
        subjectTags: ["All Subjects", "History", "English", "Science"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Socratic Questioning",
        description: "Teacher-guided questioning that pushes students to reason through answers. Highly effective for English comprehension, History analysis, and Science concepts.",
        targetLearningStyles: ["Auditory"],
        subjectTags: ["English", "History", "Science", "Geography"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Peer Teaching (Teach-Back Method)",
        description: "High-scoring students explain concepts to struggling peers. Reinforces the teacher's understanding while supporting the weaker student — works in all subjects.",
        targetLearningStyles: ["Auditory", "Kinesthetic"],
        subjectTags: ["Mathematics", "Science", "English", "Computer Science"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Recorded Audio Explanations",
        description: "Teacher records short audio walkthroughs for complex topics. Students replay at their own pace — ideal for low-attendance students catching up.",
        targetLearningStyles: ["Auditory"],
        subjectTags: ["Mathematics", "Physics", "Chemistry", "All Subjects"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      // ── Kinesthetic Learner Strategies ─────────────────────────
      {
        title: "Hands-On Lab Experiments",
        description: "Physical experiments and demonstrations that let students feel and observe concepts directly. Essential for Science, Chemistry, and Physics learners.",
        targetLearningStyles: ["Kinesthetic"],
        subjectTags: ["Science", "Chemistry", "Physics", "Biology"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Project-Based Learning (PBL)",
        description: "Students work on real-world projects over several days. Builds deep subject mastery, especially for Computer Science, Geography, and English.",
        targetLearningStyles: ["Kinesthetic", "Visual"],
        subjectTags: ["Computer Science", "Geography", "English", "Science"],
        difficultyLevel: "hard",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Role-Play & Simulations",
        description: "Students act out historical events or scientific processes. Dramatically improves engagement and recall for History, English, and Biology.",
        targetLearningStyles: ["Kinesthetic", "Auditory"],
        subjectTags: ["History", "English", "Biology", "Geography"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Manipulatives & Physical Models",
        description: "Using physical objects (blocks, charts, models) to understand abstract concepts. Particularly effective for low-scoring Mathematics and Physics students.",
        targetLearningStyles: ["Kinesthetic"],
        subjectTags: ["Mathematics", "Physics", "Chemistry"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      // ── Reading-Writing Strategies ─────────────────────────────
      {
        title: "Cornell Note-Taking System",
        description: "Structured note-taking with cues, notes, and summary columns. Helps students organize dense content — ideal for History, English, and Biology.",
        targetLearningStyles: ["Reading-Writing"],
        subjectTags: ["History", "English", "Biology", "Geography"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Summarization & Reflection Journals",
        description: "After each lesson, students write a 5-line summary of what they learned. Builds metacognitive skills and improves recall across all subjects.",
        targetLearningStyles: ["Reading-Writing"],
        subjectTags: ["All Subjects", "English", "History"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Structured Essay Writing Practice",
        description: "Guided essay templates with prompts for argument, evidence, and analysis. Targeted at English and History students scoring below 60%.",
        targetLearningStyles: ["Reading-Writing"],
        subjectTags: ["English", "History"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
      // ── Low Attendance / Catch-Up Strategies ──────────────────
      {
        title: "Flipped Classroom",
        description: "Students watch teacher-recorded video lessons at home, then use class time for practice and Q&A. Ideal for students with irregular attendance.",
        targetLearningStyles: ["Visual", "Auditory", "Reading-Writing"],
        subjectTags: ["All Subjects", "Mathematics", "Science"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Spaced Repetition Flashcards",
        description: "Digital or physical flashcards reviewed at increasing intervals using spaced repetition. Maximises retention for students who need to catch up quickly.",
        targetLearningStyles: ["Visual", "Reading-Writing"],
        subjectTags: ["All Subjects", "Biology", "Chemistry", "History"],
        difficultyLevel: "easy",
        createdBy: demoTeacher._id, isApproved: true
      },
      // ── High-Performers / Advanced Strategies ─────────────────
      {
        title: "Problem-Based Learning (PBL)",
        description: "Students are given complex, open-ended problems to solve without a prescribed method. Designed for high-performing students in Mathematics, Physics, and Computer Science.",
        targetLearningStyles: ["Visual", "Kinesthetic", "Reading-Writing"],
        subjectTags: ["Mathematics", "Physics", "Computer Science"],
        difficultyLevel: "hard",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Inquiry-Based Research Projects",
        description: "Students independently research a topic and present findings. Challenges strong performers in Science, Geography, and History.",
        targetLearningStyles: ["Reading-Writing", "Auditory"],
        subjectTags: ["Science", "Geography", "History", "Biology"],
        difficultyLevel: "hard",
        createdBy: demoTeacher._id, isApproved: true
      },
      {
        title: "Scaffolded Practice Worksheets",
        description: "Structured worksheets that guide students from simple to complex problems step-by-step. Ideal for students scoring 40–65% in Mathematics or Physics.",
        targetLearningStyles: ["Reading-Writing", "Visual"],
        subjectTags: ["Mathematics", "Physics", "Chemistry"],
        difficultyLevel: "medium",
        createdBy: demoTeacher._id, isApproved: true
      },
    ];

    await Strategy.insertMany(strategies);
    console.log(`${strategies.length} strategies seeded!`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
