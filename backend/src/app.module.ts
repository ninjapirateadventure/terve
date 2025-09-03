import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WordsModule } from './words/words.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { ConjugationModule } from './conjugation/conjugation.module';
import { DeclensionModule } from './declension/declension.module';
import { TestModule } from './tests/test.module';
import { User } from './users/user.entity';
import { Word } from './words/word.entity';
import { UserFlashcard } from './flashcards/user-flashcard.entity';
import { Verb } from './conjugation/verb.entity';
import { Noun } from './declension/noun.entity';
import { TestSessionEntity } from './tests/test.entity';
import { WordsService } from './words/words.service';
import { DeclensionService } from './declension/declension.service';

// Debug logging
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'terve_user',
  password: process.env.DB_PASSWORD || 'terve_password',
  database: process.env.DB_NAME || 'terve',
};

console.log('🔧 Database Configuration:');
console.log('  Host:', dbConfig.host);
console.log('  Port:', dbConfig.port);
console.log('  Username:', dbConfig.username);
console.log('  Database:', dbConfig.database);
console.log('  Password:', dbConfig.password ? '[SET]' : '[NOT SET]');
console.log('');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // Look in both backend and root directories
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [User, Word, UserFlashcard, Verb, Noun, TestSessionEntity],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      // Add extra connection options for debugging
      extra: {
        // Connection timeout
        connectionTimeoutMillis: 10000,
        // Idle timeout
        idleTimeoutMillis: 30000,
      },
      // Retry connection attempts
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    WordsModule,
    FlashcardsModule,
    ConjugationModule,
    DeclensionModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private wordsService: WordsService,
    private declensionService: DeclensionService
  ) {}

  async onModuleInit() {
    // Seed basic words and nouns when the app starts
    await this.wordsService.seedBasicWords();
    await this.declensionService.seedBasicNouns();
  }
}
