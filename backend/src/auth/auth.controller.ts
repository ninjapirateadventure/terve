import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export class SimpleLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('simple-login')
  @ApiOperation({ summary: 'Simple login with email and name' })
  async simpleLogin(@Body() loginDto: SimpleLoginDto) {
    return this.authService.simpleLogin(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('test-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test JWT token validation' })
  async testToken(@Request() req) {
    return {
      message: 'Token is valid',
      user: req.user,
      userId: req.user?.id,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check authentication status' })
  getStatus(@Request() req) {
    return {
      authenticated: !!req.user,
      user: req.user || null,
    };
  }
}
