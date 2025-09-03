import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';

export interface SimpleLoginDto {
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async simpleLogin(loginDto: SimpleLoginDto) {
    console.log('SimpleLogin called with:', loginDto);
    
    // Find or create user
    let user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      console.log('User not found, creating new user');
      // Create new user with simple login
      user = await this.usersService.create({
        email: loginDto.email,
        name: loginDto.name,
      });
      console.log('Created user:', user);
    } else {
      console.log('Found existing user:', user);
    }

    return this.login(user);
  }

  async validateGoogleUser(profile: any): Promise<User> {
    console.log('Google OAuth validation for profile:', profile.id);
    
    // Find or create user based on Google profile
    let user = await this.usersService.findByEmail(profile.emails[0].value);
    
    if (!user) {
      console.log('User not found, creating new user from Google profile');
      // Create new user with Google profile data
      user = await this.usersService.create({
        email: profile.emails[0].value,
        name: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
        avatar: profile.photos?.[0]?.value,
        googleId: profile.id,
      });
      console.log('Created user from Google profile:', user);
    } else {
      console.log('Found existing user for Google profile:', user);
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
        await this.usersService.update(user.id, { googleId: profile.id });
      }
    }

    return user;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      name: user.name 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        cefrLevel: user.cefrLevel,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    };
  }
}
