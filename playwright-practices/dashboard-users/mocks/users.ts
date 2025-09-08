import type { CreateUserRequest, ValidationTestCase } from '@/interfaces/user';

export const VALIDATION_TEST_CASES: ValidationTestCase[] = [
  {
    name: 'Should show validation error when email is empty',
    data: {
      email: '',
      username: 'testuser',
      name: 'Test User',
      password: '12345678',
      passwordConfirm: '12345678',
    },
  },
  {
    name: 'Should show validation error when username is empty',
    data: {
      email: 'test@example.com',
      username: '',
      name: 'Test User',
      password: '12345678',
      passwordConfirm: '12345678',
    },
  },
  {
    name: 'Should show validation error when name is empty',
    data: {
      email: 'test@example.com',
      username: 'testuser',
      name: '',
      password: '12345678',
      passwordConfirm: '12345678',
    },
  },
  {
    name: 'Should show validation error when password is empty',
    data: {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      password: '',
      passwordConfirm: '',
    },
  },
  {
    name: 'Should show validation error when password confirmation does not match',
    data: {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      password: '12345678',
      passwordConfirm: '87654321',
    },
  },
];

export const DATA_USERS: CreateUserRequest[] = [
  {
    email: 'test1@gmail.com',
    username: 'testuser1',
    name: 'Test User 1',
    password: '12345678',
    passwordConfirm: '12345678',
  },
  {
    email: 'test2@gmail.com',
    username: 'testuser2',
    name: 'Test User 2',
    password: '12345678',
    passwordConfirm: '12345678',
  },
];
