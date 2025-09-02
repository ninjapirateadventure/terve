import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Terve! Finnish Learning API is running 🇫🇮';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'terve-api',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
