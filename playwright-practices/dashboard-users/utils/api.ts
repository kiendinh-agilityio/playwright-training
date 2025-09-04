import { API } from '@/constants';
import { Page } from '@playwright/test';

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
      const isUsersCollection = responseUrl.includes(API.USERS);
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
