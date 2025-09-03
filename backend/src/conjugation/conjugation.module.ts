import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConjugationController } from './conjugation.controller';
import { ConjugationService } from './conjugation.service';
import { ConjugationEngine } from './conjugation.engine';
import { Verb } from './verb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Verb])],
  controllers: [ConjugationController],
  providers: [ConjugationService, ConjugationEngine],
  exports: [ConjugationService],
})
export class ConjugationModule implements OnModuleInit {
  constructor(private conjugationService: ConjugationService) {}

  async onModuleInit() {
    // Initialize verbs when module starts
    await this.conjugationService.onModuleInit();
  }
}
