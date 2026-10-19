import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, mock } from 'bun:test';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { UserRole, UserStatus } from '../user/utils/user.types';
import { UserService } from '../user/user.service';

describe('AuthService security', () => {
  it('does not accept a client-supplied role during registration', async () => {
    const dto = plainToInstance(SignupDto, {
      username: 'cashier',
      email: 'cashier@example.com',
      password: 'StrongPassword123!',
      role: UserRole.ADMIN,
    });

    await validate(dto, { whitelist: true });

    expect('role' in dto).toBe(false);
  });

  it('rejects login for inactive accounts', async () => {
    const password = 'StrongPassword123!';
    const user = {
      id: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
      username: 'cashier',
      email: 'cashier@example.com',
      password: await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 8,
        timeCost: 1,
      }),
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
    };
    const userService = {
      findByUsernameOrEmail: mock(() => Promise.resolve(user)),
    };
    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: UserService, useValue: userService }],
    }).compile();

    let loginError: unknown;
    try {
      await module.get(AuthService).login({
        usernameOrEmail: 'cashier',
        password,
        rememberMe: false,
      });
    } catch (error) {
      loginError = error;
    }

    expect(loginError).toBeInstanceOf(UnauthorizedException);
  });

  it('does not return the password hash after registration', async () => {
    const user = {
      id: '01J8Q2M6K4N7P9R3T5V0W1X2YZ',
      username: 'cashier',
      email: 'cashier@example.com',
      password: '$argon2id$hash',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const userService = {
      create: mock(() => Promise.resolve(user)),
    };
    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: UserService, useValue: userService }],
    }).compile();

    const signup = Object.assign(new SignupDto(), {
      username: user.username,
      email: user.email,
      password: 'StrongPassword123!',
      role: UserRole.ADMIN,
    });
    const result = await module.get(AuthService).register(signup);

    expect(userService.create).toHaveBeenCalledWith({
      username: user.username,
      email: user.email,
      password: 'StrongPassword123!',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('role', UserRole.ADMIN);
    expect(result.role).toBe(UserRole.USER);
  });
});
