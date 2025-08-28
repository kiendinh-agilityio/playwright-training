import { API } from '@/constants';
import { APIRequestContext } from '@playwright/test';
import { CreateUserRequest, EditUserRequest, UserApiResponse } from '@/interfaces/user';

export class UserApiClient {
  private readonly api: APIRequestContext;

  constructor(api: APIRequestContext) {
    this.api = api;
  }

  async createUser(payload: CreateUserRequest): Promise<UserApiResponse> {
    const response = await this.api.post(API.USERS, { data: payload });
    return (await response.json()) as UserApiResponse;
  }

  async updateUser(recordId: string, payload: EditUserRequest): Promise<UserApiResponse> {
    const response = await this.api.patch(`${API.USERS}/${recordId}`, { data: payload });
    return (await response.json()) as UserApiResponse;
  }

  async deleteUser(recordId: string): Promise<void> {
    await this.api.delete(`${API.USERS}/${recordId}`);
  }

  async getUser(recordId: string): Promise<UserApiResponse> {
    const response = await this.api.get(`${API.USERS}/${recordId}`);
    return (await response.json()) as UserApiResponse;
  }
}
