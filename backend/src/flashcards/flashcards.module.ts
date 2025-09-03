import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { UserFlashcard } from './user-flashcard.entity';
import { WordsModule } from '@/words/words.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFlashcard]),
    WordsModule
  ],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
