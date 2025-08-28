export interface UserData {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface CreateUserRequest extends UserData {
  passwordConfirm: string;
}

export interface UserApiResponse {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  username: string;
  name: string;
  avatar: string;
  website: string;
  created: string;
  updated: string;
}

export interface EditUserRequest {
  email?: string;
  username?: string;
  name?: string;
  password?: string;
}

export interface EditUserResponse {
  status: number;
  data?: UserApiResponse;
}

export interface ValidationTestCase {
  name: string;
  data: Partial<CreateUserRequest>;
}
