import { APIRequestContext, request } from '@playwright/test';
import { API } from '@/constants';
import { CreateUserRequest, EditUserRequest, UserApiResponse } from '@/interfaces/user';

export class UserApiClient {
  private readonly api: APIRequestContext;

  constructor(api: APIRequestContext) {
    this.api = api;
  }

  static async createDefault(): Promise<UserApiClient> {
    const api = await request.newContext({ baseURL: 'https://pocketbase.io/demo' });
    return new UserApiClient(api);
  }

  async createUser(payload: CreateUserRequest): Promise<UserApiResponse> {
    const response = await this.api.post(API.USERS, { data: payload });
    const data = (await response.json()) as UserApiResponse;
    return data;
  }

  async updateUser(recordId: string, payload: EditUserRequest): Promise<UserApiResponse> {
    const response = await this.api.patch(`${API.USERS}/${recordId}`, { data: payload });
    const data = (await response.json()) as UserApiResponse;
    return data;
  }

  async deleteUser(recordId: string): Promise<void> {
    await this.api.delete(`${API.USERS}/${recordId}`);
  }
}
