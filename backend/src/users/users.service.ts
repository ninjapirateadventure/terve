import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, CEFRLevel } from './user.entity';

export interface CreateUserDto {
  email: string;
  name: string;
  googleId?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  cefrLevel?: CEFRLevel;
  hasCompletedOnboarding?: boolean;
  googleId?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      googleId: createUserDto.googleId || `simple_${Date.now()}`,
      avatar: createUserDto.avatar,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async findOrCreate(googleProfile: any): Promise<User> {
    const existingUser = await this.findByGoogleId(googleProfile.id);
    
    if (existingUser) {
      return existingUser;
    }

    return this.create({
      email: googleProfile.emails[0].value,
      name: googleProfile.displayName,
      googleId: googleProfile.id,
      avatar: googleProfile.photos?.[0]?.value,
    });
  }
}
