import { test, APIRequestContext } from '@playwright/test';
import { UserApiClient } from '@/services/services';
import { UserApiResponse, UserData } from '@/interfaces/user';

const generateUniqueString = (length = 6): string =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length);

type RandomType = 'email' | 'username';

export const generateRandom = (type: RandomType, prefix = 'user'): string => {
  const unique = generateUniqueString();
  if (type === 'email') return `${prefix}.${unique}@example.com`;

  return `${prefix}_${unique}`;
};

export const createRandomUserData = (
  emailPrefix: string = 'pb',
  usernamePrefix: string = 'pbuser',
): UserData => ({
  email: generateRandom('email', emailPrefix),
  username: generateRandom('username', usernamePrefix),
  password: '12345678',
  name: 'Playwright User',
});

/**
 * Creates a specified number of unique users via the API for testing purposes.
 * Each user will have a unique email, username, and name.
 *
 * @param request - The APIRequestContext from Playwright.
 * @param count - The number of users to create.
 * @param specialString - An optional string to include in the email and username.
 * @returns A promise that resolves to an array of created user objects.
 */
export const createMultipleUsers = async (
  request: APIRequestContext,
  count: number,
  specialString?: string,
): Promise<UserApiResponse[]> => {
  const randomId = Math.floor(Math.random() * 1000000).toString();
  const workerIndex = test.info().workerIndex;
  const userApi = new UserApiClient(request);

  const userPromises = Array.from({ length: count }, (_, i) => {
    const uniqueSuffix = `${workerIndex}_${Date.now()}_${randomId}_${i}`;

    const base = createRandomUserData(
      'pb',
      `pbuser-${uniqueSuffix}${specialString ? `-${specialString}` : ''}`,
    );
    const payload = {
      ...base,
      passwordConfirm: base.password,
      email: `pbuser-${uniqueSuffix}${specialString ? `-${specialString}` : ''}@example.com`,
      username: `pbuser-${uniqueSuffix}${specialString ? `-${specialString}` : ''}`,
      name: `PB User ${uniqueSuffix}${specialString ? ` ${specialString}` : ''}`,
    } as const;

    return userApi.createUser(payload);
  });

  return Promise.all(userPromises);
};
