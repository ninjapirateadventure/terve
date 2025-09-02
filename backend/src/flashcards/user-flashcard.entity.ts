import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Word } from '../words/word.entity';

export enum FlashcardCategory {
  LEARNING = 'LEARNING',
  WELL_KNOWN = 'WELL_KNOWN', 
  TODO = 'TODO',
  NOT_INTERESTED = 'NOT_INTERESTED'
}

@Entity('user_flashcards')
@Unique(['userId', 'wordId']) // Prevent duplicate user-word combinations
export class UserFlashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Word, { eager: true })
  @JoinColumn({ name: 'word_id' })
  word: Word;

  @Column({ name: 'word_id' })
  wordId: string;

  @Column({
    type: 'enum',
    enum: FlashcardCategory,
    default: FlashcardCategory.LEARNING
  })
  category: FlashcardCategory;

  @Column({ default: 0 })
  timesReviewed: number;

  @Column({ default: 0 })
  timesCorrect: number;

  @Column({ nullable: true })
  lastReviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
