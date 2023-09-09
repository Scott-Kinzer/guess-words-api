import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WordType } from '@prisma/client';
import { AuthGuard } from 'src/auth/guards/token.auth.guard';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('list/:type')
  @UseGuards(AuthGuard)
  async getWordsByType(
    @Req() req,
    @Param('type', new ParseEnumPipe(WordType)) type: WordType,
  ) {
    return this.wordsService.findWordsByType(type, req.user.id);
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
