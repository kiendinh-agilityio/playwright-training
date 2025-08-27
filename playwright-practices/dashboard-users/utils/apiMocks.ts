import { Page, Route } from 'playwright';
import { API } from '@/constants';
import {
  UserData,
  MockUserResponse,
  createMockUserResponse,
  createMockUsersListResponse,
  createMockEditUserResponse,
} from '@/mocks/userMocks';

export class ApiMockHelper {
  constructor(private page: Page) {}

  async mockCreateUser(userData: UserData): Promise<void> {
    await this.page.route(
      (url) => url.pathname.endsWith(API.USERS) && this.page.url().includes('pocketbase'),
      async (route: Route) => {
        const mockResponse = createMockUserResponse(userData);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse),
        });
      },
    );
  }

  async mockGetUsersList(
    newUser: MockUserResponse,
    existingUsers: MockUserResponse[] = [],
  ): Promise<void> {
    await this.page.route(
      new RegExp(`${API.USERS.replace(/\//g, '\\/')}.+`),
      async (route: Route) => {
        if (route.request().method() !== 'GET') return route.continue();

        const mockResponse = createMockUsersListResponse(newUser, existingUsers);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse),
        });
      },
    );
  }

  async mockEditUser(email: string): Promise<void> {
    await this.page.route(/\/api\/collections\/users\/records\/.+/, async (route: Route) => {
      if (route.request().method() === 'PATCH') {
        const mockResponse = createMockEditUserResponse(email);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse),
        });
      } else {
        await route.continue();
      }
    });
  }

  async mockCreateUserWithList(userData: UserData): Promise<void> {
    const mockUser = createMockUserResponse(userData);
    await this.mockCreateUser(userData);
    await this.mockGetUsersList(mockUser);
  }
}
