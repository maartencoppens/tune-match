"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useInstallationState } from "@/core/hooks/useInstallationState";
import type {
  AnswersResponse,
  ResultGenre,
} from "@/core/modules/answers/types";
import type {
  Question,
  QuestionsResponse,
} from "@/core/modules/questions/types";
import { ZONES, type Zone } from "@/core/modules/zones/types";

const RESULT_GENRE_STORAGE_KEY = "tunematch_result_genre";

type QuizStateContextValue = {
  questions: Question[];
  selectedByQuestion: Record<string, string>;
  resultGenre: ResultGenre | null;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  installationState: ReturnType<
    typeof useInstallationState
  >["installationState"];
  dwellProgress: number;
  activeZoneFromDwell: ReturnType<
    typeof useInstallationState
  >["activeZoneFromDwell"];
  confirmedZone: ReturnType<typeof useInstallationState>["confirmedZone"];
  currentIndex: number;
  currentQuestion: Question | undefined;
  progressPercent: number;
  submitAllAnswers: (nextSelections: Record<string, string>) => Promise<void>;
  handleAnswerClick: (answerOptionId: string) => void;
  restartQuiz: () => void;
  resetConfirmedZone: () => void;
};

const QuizStateContext = createContext<QuizStateContextValue | null>(null);

export default function QuizStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedByQuestion, setSelectedByQuestion] = useState<
    Record<string, string>
  >({});
  const [resultGenre, setResultGenre] = useState<ResultGenre | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const previousScreenRef = useRef<string | undefined>(undefined);

  const {
    installationState,
    dwellProgress,
    activeZoneFromDwell,
    confirmedZone,
    resetConfirmedZone,
  } = useInstallationState();

  const currentIndex = installationState?.currentQuestion ?? 0;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedResultGenre = window.sessionStorage.getItem(
      RESULT_GENRE_STORAGE_KEY,
    );

    if (pathname === "/photo") {
      if (!storedResultGenre || resultGenre) {
        return;
      }

      try {
        const parsed = JSON.parse(storedResultGenre) as ResultGenre;

        if (parsed?.id && parsed?.name) {
          setResultGenre(parsed);
        }
      } catch {
        window.sessionStorage.removeItem(RESULT_GENRE_STORAGE_KEY);
      }

      return;
    }

    if (!resultGenre) {
      window.sessionStorage.removeItem(RESULT_GENRE_STORAGE_KEY);
    }
  }, [pathname, resultGenre]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!resultGenre) {
      window.sessionStorage.removeItem(RESULT_GENRE_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(
      RESULT_GENRE_STORAGE_KEY,
      JSON.stringify(resultGenre),
    );
  }, [resultGenre]);

  useEffect(() => {
    if (!installationState || typeof window === "undefined") {
      return;
    }

    const previousScreen = previousScreenRef.current;
    const currentScreen = installationState.screen;
    const enteringIntroFromLaterPhase =
      currentScreen === "intro" &&
      (previousScreen === "result" ||
        previousScreen === "photo" ||
        previousScreen === "question" ||
        previousScreen === "answer_reveal");
    const enteringFirstQuestion =
      currentScreen === "question" && installationState.currentQuestion === 0;

    const hasStaleResultState =
      !!resultGenre ||
      !!errorMessage ||
      Object.keys(selectedByQuestion).length > 0 ||
      !!window.sessionStorage.getItem(RESULT_GENRE_STORAGE_KEY);

    if (
      !(enteringIntroFromLaterPhase || enteringFirstQuestion) ||
      !hasStaleResultState
    ) {
      previousScreenRef.current = currentScreen;
      return;
    }

    setResultGenre(null);
    setSelectedByQuestion({});
    setErrorMessage(null);
    window.sessionStorage.removeItem(RESULT_GENRE_STORAGE_KEY);
    previousScreenRef.current = currentScreen;
  }, [installationState, resultGenre, errorMessage, selectedByQuestion]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/questions");
        const data = (await response.json()) as QuestionsResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load questions");
        }

        setQuestions(data.questions ?? []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load questions";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuestions();
  }, []);

  const submitAllAnswers = useCallback(
    async (nextSelections: Record<string, string>) => {
      try {
        setIsSubmitting(true);
        setErrorMessage(null);

        const answerOptionIds = questions.map(
          (question) => nextSelections[question.id],
        );

        const response = await fetch("/api/answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answerOptionIds }),
        });

        const data = (await response.json()) as AnswersResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to submit answers");
        }

        setResultGenre(data.resultGenre);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to submit answers",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [questions],
  );

  const handleAnswerClick = useCallback(
    (answerOptionId: string) => {
      if (!currentQuestion || isSubmitting) {
        return;
      }

      setSelectedByQuestion((currentSelections) => ({
        ...currentSelections,
        [currentQuestion.id]: answerOptionId,
      }));
    },
    [currentQuestion, isSubmitting],
  );

  useEffect(() => {
    const allAnswersSelected =
      Object.keys(selectedByQuestion).length === questions.length;
    const shouldSubmit =
      allAnswersSelected &&
      questions.length > 0 &&
      !resultGenre &&
      !isSubmitting;

    if (shouldSubmit) {
      void submitAllAnswers(selectedByQuestion);
    }
  }, [
    selectedByQuestion,
    questions.length,
    resultGenre,
    isSubmitting,
    submitAllAnswers,
  ]);

  useEffect(() => {
    if (!confirmedZone || !currentQuestion) {
      return;
    }

    if (selectedByQuestion[currentQuestion.id]) {
      console.log(
        "[QuizStateProvider] confirmedZone ignored: answer already selected for this question",
        {
          currentQuestionId: currentQuestion.id,
          confirmedZone,
        },
      );
      return;
    }

    const zoneIndex = ZONES.indexOf(confirmedZone as Zone);
    const option = currentQuestion.answerOptions[zoneIndex];

    if (!option) {
      console.warn("[QuizStateProvider] confirmedZone has no matching option", {
        confirmedZone,
        zoneIndex,
        optionCount: currentQuestion.answerOptions.length,
      });
      return;
    }

    console.log("[QuizStateProvider] confirmedZone: selecting answer", {
      currentQuestionId: currentQuestion.id,
      confirmedZone,
      optionId: option.id,
    });

    handleAnswerClick(option.id);
    resetConfirmedZone();
  }, [
    confirmedZone,
    currentQuestion,
    handleAnswerClick,
    selectedByQuestion,
    resetConfirmedZone,
  ]);

  const restartQuiz = () => {
    setSelectedByQuestion({});
    setResultGenre(null);
    setErrorMessage(null);

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(RESULT_GENRE_STORAGE_KEY);
    }
  };

  const progressPercent =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <QuizStateContext.Provider
      value={{
        questions,
        selectedByQuestion,
        resultGenre,
        isLoading,
        isSubmitting,
        errorMessage,
        installationState,
        dwellProgress,
        activeZoneFromDwell,
        confirmedZone,
        currentIndex,
        currentQuestion,
        progressPercent,
        submitAllAnswers,
        handleAnswerClick,
        restartQuiz,
        resetConfirmedZone,
      }}
    >
      {children}
    </QuizStateContext.Provider>
  );
}

export function useQuizState() {
  const context = useContext(QuizStateContext);

  if (!context) {
    throw new Error("useQuizState must be used within QuizStateProvider");
  }

  return context;
}
