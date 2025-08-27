import { randomEmail, randomUsername } from '@/utils/api';

export interface UserData {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface MockUserResponse {
  id: string;
  email: string;
  username: string;
  name: string;
  verified: boolean;
  created: string;
  updated: string;
}

export interface MockUsersListResponse {
  page: number;
  perPage: number;
  totalItems: number;
  items: MockUserResponse[];
}

export interface EditUserTestData {
  newEmail: string;
  originalEmail: string;
}

export const createMockUserData = (prefix: string = 'pb'): UserData => ({
  email: `test.${prefix}@example.com`,
  username: `${prefix}user`,
  password: '12345678',
  name: 'Playwright User',
});

export const createRandomUserData = (
  emailPrefix: string = 'pb',
  usernamePrefix: string = 'pbuser',
): UserData => ({
  email: randomEmail(emailPrefix),
  username: randomUsername(usernamePrefix),
  password: '12345678',
  name: 'Playwright User',
});

export const createEditUserTestData = (
  newEmail: string = 'updated.email@example.com',
): EditUserTestData => ({
  newEmail,
  originalEmail: '',
});

export const createMockUserResponse = (userData: UserData): MockUserResponse => ({
  id: 'mock_id_' + Math.random().toString(36).slice(2, 8),
  email: userData.email,
  username: userData.username,
  name: userData.name,
  verified: false,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
});

export const createMockUsersListResponse = (
  newUser: MockUserResponse,
  existingUsers: MockUserResponse[] = [],
): MockUsersListResponse => {
  const defaultUsers: MockUserResponse[] = [
    {
      id: 'existing1',
      email: 'test@example.com',
      verified: true,
      username: 'u_x',
      name: 'Jane Doe',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      id: 'existing2',
      email: 'test2@example.com',
      verified: false,
      username: 'u_y',
      name: 'N/A',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    {
      id: 'existing3',
      email: 'test3@example.com',
      verified: false,
      username: 'u_z',
      name: 'John Doe',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  ];

  return {
    page: 1,
    perPage: 30,
    totalItems: defaultUsers.length + existingUsers.length + 1,
    items: [...defaultUsers, ...existingUsers, newUser],
  };
};

export const createMockEditUserResponse = (email: string): MockUserResponse => ({
  id: 'mock_id_edit',
  email,
  username: 'pbuser_edit',
  name: 'Updated User',
  verified: false,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
});

export const validationTestCases = [
  {
    name: 'cannot create with empty inputs',
    data: { email: '', password: '', passwordConfirm: '' },
    expectedResult: 'modal should remain visible',
  },
  {
    name: 'cannot create with invalid email format',
    data: { email: 'invalid-email', password: '12345678', passwordConfirm: '12345678' },
    expectedResult: 'modal should remain visible',
  },
  {
    name: 'cannot create with password mismatch',
    data: { email: 'test@example.com', password: '12345678', passwordConfirm: '87654321' },
    expectedResult: 'modal should remain visible',
  },
];
