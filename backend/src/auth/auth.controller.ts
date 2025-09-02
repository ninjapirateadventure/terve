import { Controller, Get, Post, UseGuards, Request, Response } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  async googleAuth() {
    // Passport will handle the redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Request() req, @Response() res) {
    const loginResult = await this.authService.login(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${loginResult.access_token}`;
    
    return res.redirect(redirectUrl);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
