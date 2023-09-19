import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { WordType } from '@prisma/client';
import { AuthGuard } from 'src/auth/guards/token.auth.guard';
import { WordsService } from './words.service';
import { guessWordShchema } from './validation/words.validation';
import { JoiValidationPipe } from 'src/auth/pipes/joiValidationPipe';
import { GuessWordDto } from './types/word.type';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('list/types')
  @UseGuards(AuthGuard)
  async getWordsTypes(): Promise<{ type: string }[]> {
    return this.wordsService.findWordsTypes();
  }

  @Get('list/:type')
  @UseGuards(AuthGuard)
  async getWordsByType(
    @Req() req,
    @Param('type', new ParseEnumPipe(WordType)) type: WordType,
  ) {
    return this.wordsService.findWordsByType(type, req.user.id);
  }

  @Post(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(guessWordShchema))
  async guessWord(
    @Req() req,
    @Body() wordData: GuessWordDto,
    @Param('id', new ParseUUIDPipe()) wordId: string,
  ) {
    return this.wordsService.guessWord(wordId, wordData.word, req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getWordById(
    @Req() req,
    @Param('id', new ParseUUIDPipe()) wordId: string,
  ) {
    return this.wordsService.findWordById(wordId, req.user.id);
  }

  @Get('hint/:id/:levelHint')
  @UseGuards(AuthGuard)
  async getWordHintById(
    @Param('id', new ParseUUIDPipe()) wordId: string,
    @Param('levelHint', new ParseIntPipe()) levelHint: number,
  ) {
    return this.wordsService.findWordHint(wordId, levelHint);
  }
}
