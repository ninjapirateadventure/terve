import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WordsModule } from './words/words.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { User } from './users/user.entity';
import { Word } from './words/word.entity';
import { UserFlashcard } from './flashcards/user-flashcard.entity';
import { WordsService } from './words/words.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'database',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'terve_user',
      password: process.env.DB_PASSWORD || 'terve_password',
      database: process.env.DB_NAME || 'terve',
      entities: [User, Word, UserFlashcard],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    WordsModule,
    FlashcardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private wordsService: WordsService) {}

  async onModuleInit() {
    // Seed basic words when the app starts
    await this.wordsService.seedBasicWords();
  }
}
