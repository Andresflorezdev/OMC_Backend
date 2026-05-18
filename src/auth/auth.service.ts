import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const adminEmail =
      this.configService.getOrThrow<string>('AUTH_ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('AUTH_ADMIN_PASSWORD');
    const adminPasswordHash = this.configService.get<string>(
      'AUTH_ADMIN_PASSWORD_HASH',
    );

    const emailMatches = loginDto.email === adminEmail;
    const passwordMatches = adminPasswordHash
      ? await bcrypt.compare(loginDto.password, adminPasswordHash)
      : loginDto.password === adminPassword;

    if (!emailMatches || !passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: adminEmail,
      email: adminEmail,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        email: adminEmail,
      },
    };
  }
}
