import { API_BASE_URL, getErrorMessage } from '../utils/api';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export class UserService {
  static async updateProfile(name: string, token: string): Promise<UserDto> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to update profile'));
    }

    const result = await response.json();
    return result;
  }

  static async updateAvatar(file: File, token: string): Promise<UserDto> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to update avatar'));
    }

    const result = await response.json();
    return result;
  }
}
