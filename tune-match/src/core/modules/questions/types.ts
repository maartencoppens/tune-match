export type AnswerOption = {
  id: string;
  label: string;
  orderIndex: number;
};

export type Question = {
  id: string;
  text: string;
  orderIndex: number;
  answerOptions: AnswerOption[];
};

export type QuestionsResponse = {
  total: number;
  questions: Question[];
};
