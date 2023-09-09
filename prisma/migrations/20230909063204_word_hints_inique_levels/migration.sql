/*
  Warnings:

  - A unique constraint covering the columns `[wordId,levelHint]` on the table `WordHints` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "unique_level_hint_per_word" ON "WordHints"("levelHint", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "WordHints_wordId_levelHint_key" ON "WordHints"("wordId", "levelHint");
