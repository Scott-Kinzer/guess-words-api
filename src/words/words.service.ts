import { Injectable } from '@nestjs/common';
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
}
