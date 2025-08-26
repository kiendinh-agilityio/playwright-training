import { Page } from '@playwright/test';

type WaitForApiOptions = {
  urlIncludes: string | RegExp;
  method?: string;
  status?: number;
};

export function waitForApiResponse(page: Page, { urlIncludes, method, status }: WaitForApiOptions) {
  return page.waitForResponse((res) => {
    const matchesUrl =
      typeof urlIncludes === 'string'
        ? res.url().includes(urlIncludes)
        : urlIncludes.test(res.url());
    const matchesMethod = method ? res.request().method() === method : true;
    const matchesStatus = status ? res.status() === status : true;
    return matchesUrl && matchesMethod && matchesStatus;
  });
}

export function randomEmail(prefix = 'user') {
  const unique = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${unique}@example.com`;
}

export function randomUsername(prefix = 'user') {
  const unique = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${unique}`;
}
