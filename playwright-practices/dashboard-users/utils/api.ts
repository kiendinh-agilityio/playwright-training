import { API } from '@/constants';
import { Page } from '@playwright/test';

type HttpMethodLiteral = 'POST' | 'PUT' | 'PATCH';

const CREATE_METHODS: ReadonlyArray<HttpMethodLiteral> = ['POST'];
const EDIT_METHODS: ReadonlyArray<HttpMethodLiteral> = ['PATCH', 'PUT', 'POST'];

async function waitForUsersResponseByMethods(
  page: Page,
  methods: ReadonlyArray<HttpMethodLiteral>,
) {
  const response = await page.waitForResponse((res) => {
    const url = res.url();
    const method = res.request().method();
    const isUsersCollection = url.includes(API.USERS);
    const isDesiredMethod = (methods as ReadonlyArray<string>).includes(method);
    return isUsersCollection && isDesiredMethod;
  });
  return response.json();
}

export async function waitForCreateUserResponse(page: Page) {
  return waitForUsersResponseByMethods(page, CREATE_METHODS);
}

export async function waitForEditUserRequest(page: Page) {
  return waitForUsersResponseByMethods(page, EDIT_METHODS);
}
