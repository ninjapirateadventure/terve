import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordsService } from './words.service';
import { Word } from './word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Word])],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
