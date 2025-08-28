import { Page } from '@playwright/test';
import { API } from '@/constants';

export async function waitForCreateUserResponse(page: Page) {
  const response = await page.waitForResponse((res) => {
    const url = res.url();
    const isUsersCollection = url.includes(API.USERS);
    const isPost = res.request().method() === 'POST';
    return isUsersCollection && isPost;
  });
  return response.json();
}

export async function waitForEditUserRequest(page: Page, recordId?: string) {
  const request = await page.waitForRequest((req) => {
    const url = req.url();
    const isUsersCollection = url.includes(API.USERS);
    const idMatch = recordId ? url.includes(`/records/${recordId}`) : true;
    const method = req.method();
    const isEditMethod = method === 'PATCH' || method === 'PUT';
    return isUsersCollection && idMatch && isEditMethod;
  });

  const response = await request.response();
  const status = response ? response.status() : 0;
  const data = response ? await response.json() : {};

  return { status, data };
}
