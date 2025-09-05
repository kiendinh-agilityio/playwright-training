import { USERS_API } from '@/constants';
import { APIRequestContext } from '@playwright/test';
import { CreateUserRequest, EditUserRequest, UserApiResponse } from '@/interfaces/user';

export class UserApiClient {
  private readonly api: APIRequestContext;

  constructor(api: APIRequestContext) {
    this.api = api;
  }

  async createUser(payload: CreateUserRequest): Promise<UserApiResponse> {
    const response = await this.api.post(USERS_API, { data: payload });
    return (await response.json()) as UserApiResponse;
  }

  async updateUser(recordId: string, payload: EditUserRequest): Promise<UserApiResponse> {
    const response = await this.api.patch(`${USERS_API}/${recordId}`, { data: payload });
    return (await response.json()) as UserApiResponse;
  }

  async deleteUser(recordId: string): Promise<void> {
    try {
      const response = await this.api.delete(`${USERS_API}/${recordId}`);
      if (!response.ok()) {
        const body = await response.text();
        throw new Error(
          `Failed to delete user ${recordId}: ${response.status()} ${response.statusText()} - ${body}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`deleteUser error for ${recordId}: ${message}`);
    }
  }

  async getUser(recordId: string): Promise<UserApiResponse> {
    const response = await this.api.get(`${USERS_API}/${recordId}`);
    return (await response.json()) as UserApiResponse;
  }
}
