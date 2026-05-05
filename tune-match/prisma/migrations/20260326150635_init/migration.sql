-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artistReference" TEXT,
    "visualTheme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerGenreScore" (
    "id" TEXT NOT NULL,
    "answerOptionId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerGenreScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "installationId" TEXT,
    "participantTag" TEXT,
    "photoUrl" TEXT,
    "qrCodeUrl" TEXT,
    "resultGenreId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerOptionId" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Question_orderIndex_key" ON "Question"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerOption_questionId_orderIndex_key" ON "AnswerOption"("questionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerGenreScore_answerOptionId_genreId_key" ON "AnswerGenreScore"("answerOptionId", "genreId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAnswer_sessionId_questionId_key" ON "SessionAnswer"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerGenreScore" ADD CONSTRAINT "AnswerGenreScore_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "AnswerOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerGenreScore" ADD CONSTRAINT "AnswerGenreScore_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_resultGenreId_fkey" FOREIGN KEY ("resultGenreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAnswer" ADD CONSTRAINT "SessionAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAnswer" ADD CONSTRAINT "SessionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAnswer" ADD CONSTRAINT "SessionAnswer_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "AnswerOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
