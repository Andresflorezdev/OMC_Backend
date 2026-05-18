import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let signAsyncMock: jest.Mock;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('admin@lead-flow.com'),
      get: jest.fn((key: string) => {
        if (key === 'AUTH_ADMIN_PASSWORD') return 'change-me';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    signAsyncMock = jest.fn().mockResolvedValue('signed-jwt-token');
    jwtService = {
      signAsync: signAsyncMock,
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(configService, jwtService);
  });

  it('returns an access token for valid admin credentials', async () => {
    const result = await service.login({
      email: 'admin@lead-flow.com',
      password: 'change-me',
    });

    expect(result).toEqual({
      accessToken: 'signed-jwt-token',
      user: { email: 'admin@lead-flow.com' },
    });
    expect(signAsyncMock).toHaveBeenCalledWith({
      sub: 'admin@lead-flow.com',
      email: 'admin@lead-flow.com',
    });
  });

  it('throws unauthorized for invalid credentials', async () => {
    await expect(
      service.login({
        email: 'admin@lead-flow.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
