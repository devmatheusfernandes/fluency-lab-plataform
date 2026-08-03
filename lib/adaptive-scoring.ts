const ELO_MIN = 100;
const ELO_MAX = 1100;

/**
 * Maps a CEFR level to the midpoint ELO score for question initialization.
 * This ensures questions start calibrated at the right difficulty,
 * not at an artificially inflated value of 1000.
 */
export function cefrToInitialDifficulty(cefrLevel: string): number {
  const map: Record<string, number> = {
    "A1": 187,  // mid of 100-274
    "A2": 350,  // mid of 275-424
    "B1": 500,  // mid of 425-574
    "B2": 650,  // mid of 575-724
    "C1": 800,  // mid of 725-874
    "C2": 950,  // mid of 875-1100
  };
  return map[cefrLevel] ?? 500; // Default to B1 if unknown
}

// Conservative K-Factors — prevent explosive ELO inflation in a 25-question test.
// Previous values (64/48/32) were too aggressive, allowing a student to jump
// from 600 to 1000+ if all questions were initialized at difficulty 1000.
const getStudentKFactor = (questionsAnswered: number) => {
  if (questionsAnswered < 5) return 32;  // Exploration phase
  if (questionsAnswered < 15) return 24; // Approach phase
  return 16;                             // Fine-tuning phase
};

const getQuestionKFactor = (timesAnswered: number) => {
  if (timesAnswered < 20) return 16; // New question: calibrate quickly
  if (timesAnswered < 100) return 8;
  return 4;  // Stabilized question
};

export function calculateElo(
  studentScore: number,
  questionDifficulty: number,
  isCorrect: boolean,
  studentQuestionsAnswered: number,
  questionTimesAnswered: number
) {
  const expectedStudentWin =
    1 / (1 + Math.pow(10, (questionDifficulty - studentScore) / 400));
  const expectedQuestionWin = 1 - expectedStudentWin;

  const actualStudentResult = isCorrect ? 1 : 0;
  const actualQuestionResult = isCorrect ? 0 : 1;

  const kStudent = getStudentKFactor(studentQuestionsAnswered);
  const kQuestion = getQuestionKFactor(questionTimesAnswered);

  const newStudentScore =
    studentScore + kStudent * (actualStudentResult - expectedStudentWin);
  const newQuestionDifficulty =
    questionDifficulty + kQuestion * (actualQuestionResult - expectedQuestionWin);

  return {
    newStudentScore: Math.min(
      ELO_MAX,
      Math.max(ELO_MIN, Math.round(newStudentScore))
    ),
    newQuestionDifficulty: Math.round(newQuestionDifficulty),
  };
}

/**
 * Helper to map an Elo score to a CEFR level based on our defined ranges.
 */
export function mapEloToCEFR(elo: number): string {
  if (elo < 275) return "A1"; // Base 200 (100 - 274)
  if (elo < 425) return "A2"; // Base 350 (275 - 424)
  if (elo < 575) return "B1"; // Base 500 (425 - 574)
  if (elo < 725) return "B2"; // Base 650 (575 - 724)
  if (elo < 875) return "C1"; // Base 800 (725 - 874)
  return "C2";                // Base 950 (875 - 1100)
}
