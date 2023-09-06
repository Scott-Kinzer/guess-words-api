import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
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
}
