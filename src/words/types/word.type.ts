import { WordType } from '@prisma/client';

export type WordsClientResult = {
  word_id: string;
  type: WordType;
  level: number;
  is_guessed: boolean;
};
