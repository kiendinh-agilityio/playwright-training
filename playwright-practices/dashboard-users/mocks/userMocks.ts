import { generateRandom } from '@/utils';
import { UserData, ValidationTestCase } from '@/interfaces';

export const createRandomUserData = (
  emailPrefix: string = 'pb',
  usernamePrefix: string = 'pbuser',
): UserData => ({
  email: generateRandom('email', emailPrefix),
  username: generateRandom('username', usernamePrefix),
  password: '12345678',
  name: 'Playwright User',
});

export const validationTestCases: ValidationTestCase[] = [
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
