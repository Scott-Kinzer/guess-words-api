import { BadRequestException, Injectable } from '@nestjs/common';
import { WordType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { WordsClientResult } from './types/word.type';

@Injectable()
export class WordsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findWordsByType(
    wordsType: WordType,
    userId: string,
  ): Promise<WordsClientResult[]> {
    const result = (await this.prismaService.$queryRaw`
    SELECT
        w.id AS word_id,
        w.type,
        w.level,
        CASE
            WHEN ug."userId" IS NOT NULL THEN true
            ELSE false
        END AS is_guessed
    FROM
        "Words" w
    LEFT JOIN
        "UserGuessedWords" ug
    ON
        w."id" = ug."wordId"
    AND
        ug."userId" = ${userId}::UUID
    WHERE
        w."type" = ${wordsType}::"WordType";
`) as WordsClientResult[];
    return result;
  }

  async findWordById(wordId: string, userId: string) {
    const userGuessWord = await this.prismaService.userGuessedWords.findFirst({
      where: { wordId, userId },
    });

    const wordData = await this.prismaService.words.findUnique({
      where: { id: wordId },
    });

    if (!wordData) throw new BadRequestException('Word not exists');

    const maxLevelHint = await this.prismaService.wordHints.aggregate({
      _max: { levelHint: true },
      where: { wordId },
    });

    const maxLevelHintValue = maxLevelHint._max.levelHint;
    const wordLength = wordData?.word?.length ?? 0;

    if (!userGuessWord) delete wordData.word;

    const hint = await this.findWordHint(wordId, 1);

    return {
      ...wordData,
      wordLength,
      hint,
      maxLevelHint: maxLevelHintValue,
    };
  }

  async findWordHint(wordId: string, levelHint: number) {
    const wordHint = await this.prismaService.wordHints.findFirst({
      where: { wordId, levelHint },
    });

    if (!wordHint) throw new BadRequestException('Hint not exists');

    return wordHint;
  }
}
