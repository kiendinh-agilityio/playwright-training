import { APIRequestContext } from '@playwright/test';
import { UserApiClient } from '@/services/services';
import { UserApiResponse, UserData } from '@/interfaces/user';

type CredentialType = 'email' | 'username';

export const generateUniqueCredential = (type: CredentialType, prefix = 'user'): string => {
  const unique = Date.now().toString(36);
  return type === 'email' ? `${prefix}.${unique}@example.com` : `${prefix}_${unique}`;
};

export const createUniqueUserData = (emailPrefix = 'pb', usernamePrefix = 'pbuser'): UserData => ({
  email: generateUniqueCredential('email', emailPrefix),
  username: generateUniqueCredential('username', usernamePrefix),
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
export const createUsers = async (
  request: APIRequestContext,
  count: number,
): Promise<UserApiResponse[]> => {
  const userApi = new UserApiClient(request);

  const userPromises = Array.from({ length: count }, (_, i) => {
    const suffix = `${Date.now()}_${i}`;
    const base = createUniqueUserData('pb', `pbuser-${suffix}`);

    const payload = {
      ...base,
      passwordConfirm: base.password,
      email: `pbuser-${suffix}@example.com`,
      username: `pbuser-${suffix}`,
      name: `PB User ${suffix}`,
    } as const;

    return userApi.createUser(payload);
  });

  return Promise.all(userPromises);
};

export const getUserDeletePromises = async (
  request: APIRequestContext,
  users: UserApiResponse[],
): Promise<Promise<void>[]> => {
  const userApi = new UserApiClient(request);
  const candidates = users.filter((user) => user && user.id);

  const existingIdResults = await Promise.allSettled(
    candidates.map((user) => userApi.getUser(user.id).then(() => user.id)),
  );

  const existingIds = existingIdResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map((r) => r.value);

  const deletePromises = existingIds.map((id) => userApi.deleteUser(id));
  return deletePromises;
};
