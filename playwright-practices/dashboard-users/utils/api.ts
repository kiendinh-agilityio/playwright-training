import { USERS_API } from '@/constants';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

const authFilePath = path.join(process.cwd(), 'playwright/.auth/user.json');

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'GET';

const USER_METHODS: Record<string, ReadonlyArray<HttpMethod>> = {
  CREATE: ['POST'],
  EDIT: ['PATCH', 'PUT', 'POST'],
  GET: ['GET'],
};

async function waitForUsersResponseByMethods(
  page: Page,
  methods: ReadonlyArray<HttpMethod>,
  urlContains?: string,
  returnJson: boolean = true,
) {
  const response = await page.waitForResponse(
    (res) => {
      const responseUrl = res.url();
      const method = res.request().method();
      const isUsersCollection = responseUrl.includes(USERS_API);
      const isDesiredMethod = methods.includes(method as HttpMethod);
      const hasUrlContains = urlContains ? responseUrl.includes(urlContains) : true;
      return isUsersCollection && isDesiredMethod && hasUrlContains;
    },
    { timeout: 30000 },
  );

  return returnJson ? response.json() : response;
}

export async function waitForCreateUserResponse(page: Page) {
  return waitForUsersResponseByMethods(page, USER_METHODS.CREATE);
}

export async function waitForEditUserRequest(page: Page) {
  return waitForUsersResponseByMethods(page, USER_METHODS.EDIT);
}

export async function waitForSortResponse({ url, page }: { url: string; page: Page }) {
  return waitForUsersResponseByMethods(page, USER_METHODS.GET, url, false);
}

/**
 * Extracts the access token from the auth file stored at the path specified by
 * the `authFilePath` constant. The token is extracted from the `__pb_superuser_auth__`
 * local storage item of the origin specified by the `BASE_URL` environment variable.
 * If the token is not found, an empty string is returned.
 *
 * @returns {string} The access token or an empty string if the token is not found.
 */
export const extractAccessToken = () => {
  try {
    if (!fs.existsSync(authFilePath)) {
      return '';
    }

    const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));
    // Storage state stores by origin (protocol + host), not full baseURL path.
    const base = process.env.BASE_URL || '';
    const expectedOrigin = base ? new URL(base).origin : '';
    const origin = authData.origins.find((o: { origin: string }) => o.origin === expectedOrigin);
    const authItem = origin?.localStorage.find(
      (item: { name: string; value: string }) => item.name === '__pb_superuser_auth__',
    );

    if (authItem?.value) {
      const parsed = JSON.parse(authItem.value);
      return parsed.token || '';
    }
  } catch (err) {
    console.warn('Could not extract token', err);
  }

  return '';
};
