import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

const intersection = (arr1 = [], arr2 = []) =>
  arr1.filter(value => arr2.includes(value));

/**
 * Score a strategy for a student using marks, attendance, and learning style.
 */
function scoreStrategy(student, strategy) {
  let score = 0;

  // 1. Learning style match (highest weight: 4pts)
  if (strategy.targetLearningStyles?.includes(student.learningStyle)) {
    score += 4;
  }

  // 2. Subject weakness overlap (2pts per matching subject)
  const overlap = intersection(strategy.subjectTags, student.subjectWeaknesses || []);
  score += overlap.length * 2;

  // 3. Performance-to-difficulty calibration
  const perf = student.performanceScore ?? 50;
  if (perf < 40 && strategy.difficultyLevel === 'easy')   score += 3;
  if (perf >= 40 && perf <= 70 && strategy.difficultyLevel === 'medium') score += 3;
  if (perf > 70  && strategy.difficultyLevel === 'hard')  score += 3;

  // 4. Attendance penalty: low attendance → prefer simpler, self-paced strategies
  const attendPct = student.attendancePercent ?? 100;
  if (attendPct < 60 && strategy.difficultyLevel === 'easy')   score += 2;
  if (attendPct < 60 && strategy.difficultyLevel === 'hard')   score -= 2;

  // 5. Bonus: strategy tags match weakest subject specifically
  if (student.subjectMarks?.length) {
    const weakest = [...student.subjectMarks].sort((a, b) => a.marks - b.marks)[0];
    if (weakest && strategy.subjectTags?.includes(weakest.subject)) score += 2;
  }

  return score;
}

/**
 * Build a rule-based plain English explanation (used when OpenAI is absent).
 */
function buildExplanation(student, strategy) {
  const perf = student.performanceScore ?? 0;
  const attend = student.attendancePercent;
  const styleMatch = strategy.targetLearningStyles?.includes(student.learningStyle);
  const lines = [];

  if (styleMatch) lines.push(`Matches ${student.learningStyle} learning style.`);
  if (perf < 50)  lines.push(`Chosen because performance score is ${perf}% — a ${strategy.difficultyLevel} strategy provides appropriate challenge.`);
  else            lines.push(`Performance score (${perf}%) aligns well with a ${strategy.difficultyLevel}-level approach.`);
  if (attend !== null && attend < 70)
    lines.push(`Low attendance (${attend}%) considered — strategy supports independent learning.`);

  const weaknesses = student.subjectWeaknesses || [];
  const subjectHits = intersection(strategy.subjectTags || [], weaknesses);
  if (subjectHits.length) lines.push(`Directly targets weak subjects: ${subjectHits.join(', ')}.`);

  return lines.join(' ');
}

/**
 * Returns Top 5 strategies for a student.
 */
export const generateTopStrategies = async (student, allStrategies) => {
  // Score and rank
  const scoredStrategies = allStrategies
    .map(strategy => ({ strategy, score: scoreStrategy(student, strategy) }))
    .sort((a, b) => b.score - a.score);

  let top5 = scoredStrategies.slice(0, 5).map(item => ({
    ...item.strategy.toObject ? item.strategy.toObject() : item.strategy,
    explanation: buildExplanation(student, item.strategy)
  }));

  // Enhance explanations with OpenAI if key is present
  if (openai) {
    try {
      const promptContext = `
You are an educational advisor AI. Given this student profile:
- Name: ${student.name}
- Learning Style: ${student.learningStyle}
- Overall Performance: ${student.performanceScore}%
- Attendance: ${student.attendancePercent ?? 'unknown'}%
- Subject Marks: ${JSON.stringify(student.subjectMarks?.map(s => ({ subject: s.subject, marks: s.marks, max: s.maxMarks })) || [])}
- Weak Subjects: ${(student.subjectWeaknesses || []).join(', ') || 'None'}

These are the top 5 recommended teaching strategies:
${top5.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n')}

Write a 2-sentence explanation for WHY each strategy is recommended for THIS specific student, referencing their marks or attendance. Return a JSON array like:
[{ "title": "...", "explanation": "..." }]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptContext }],
        temperature: 0.6
      });

      const explanations = JSON.parse(response.choices[0].message.content);
      top5 = top5.map(strat => {
        const match = explanations.find(e => e.title === strat.title);
        return { ...strat, explanation: match?.explanation || strat.explanation };
      });
    } catch (err) {
      console.error('OpenAI enhancement failed:', err.message);
    }
  }

  return top5;
};

