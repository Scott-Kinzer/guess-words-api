-- CreateEnum
CREATE TYPE "WordType" AS ENUM ('sports', 'animals', 'science', 'food');

-- CreateTable
CREATE TABLE "Words" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "word" TEXT NOT NULL,
    "type" "WordType" NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordHints" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wordId" UUID NOT NULL,
    "hint" TEXT NOT NULL,
    "levelHint" INTEGER NOT NULL,

    CONSTRAINT "WordHints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGuessedWords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "wordId" UUID NOT NULL,

    CONSTRAINT "UserGuessedWords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Words_id_key" ON "Words"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Words_word_key" ON "Words"("word");

-- CreateIndex
CREATE UNIQUE INDEX "WordHints_id_key" ON "WordHints"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserGuessedWords_id_key" ON "UserGuessedWords"("id");

-- AddForeignKey
ALTER TABLE "WordHints" ADD CONSTRAINT "WordHints_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGuessedWords" ADD CONSTRAINT "UserGuessedWords_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGuessedWords" ADD CONSTRAINT "UserGuessedWords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
