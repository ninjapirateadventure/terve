import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeclensionController } from './declension.controller';
import { DeclensionService } from './declension.service';
import { DeclensionEngine } from './declension.engine';
import { Noun } from './noun.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Noun])],
  controllers: [DeclensionController],
  providers: [DeclensionService, DeclensionEngine],
  exports: [DeclensionService, DeclensionEngine],
})
export class DeclensionModule {}
