import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { TestQuestionGenerator } from './test-generator.service';
import { TestSessionEntity } from './test.entity';
import { ConjugationModule } from '../conjugation/conjugation.module';
import { DeclensionModule } from '../declension/declension.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestSessionEntity]),
    ConjugationModule,
    DeclensionModule,
  ],
  controllers: [TestController],
  providers: [TestService, TestQuestionGenerator],
  exports: [TestService, TestQuestionGenerator],
})
export class TestModule {}
