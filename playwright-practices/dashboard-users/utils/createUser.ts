import { generateRandom } from './generators';
import type { UserData } from '@/interfaces/user';

export const createRandomUserData = (
  emailPrefix: string = 'pb',
  usernamePrefix: string = 'pbuser',
): UserData => ({
  email: generateRandom('email', emailPrefix),
  username: generateRandom('username', usernamePrefix),
  password: '12345678',
  name: 'Playwright User',
});
