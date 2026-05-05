export type ResultGenre = {
  id: string;
  name: string;
  description: string | null;
  artistReference: string | null;
  visualTheme: string | null;
};

export type AnswersResponse = {
  resultGenre: ResultGenre | null;
};

export type SubmitAnswersPayload = {
  answerOptionIds?: string[];
};

export type GenreScore = {
  genreId: string;
  score: number;
};
