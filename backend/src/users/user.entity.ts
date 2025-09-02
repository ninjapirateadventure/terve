import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2', 
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'google_id', nullable: true })
  googleId: string;

  @Column({
    type: 'enum',
    enum: CEFRLevel,
    default: CEFRLevel.A1
  })
  cefrLevel: CEFRLevel;

  @Column({ default: false })
  hasCompletedOnboarding: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
