const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5191/api'

export interface UserDto {
  id: number
  name: string
  email: string
  avatar?: string
  isVerified: boolean
  createdAt: string
}

export class UserService {
  static async updateProfile(name: string, token: string): Promise<UserDto> {
    console.log('=== UPDATE PROFILE START ===')
    console.log('Name:', name)
    console.log('Token exists:', !!token)
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      try {
        const error = JSON.parse(errorText)
        throw new Error(error.message || 'Failed to update profile')
      } catch {
        throw new Error(errorText || 'Failed to update profile')
      }
    }

    const result = await response.json()
    console.log('Update profile success:', result)
    return result
  }

  static async updateAvatar(file: File, token: string): Promise<UserDto> {
    console.log('=== AVATAR UPLOAD START ===')
    console.log('File name:', file.name)
    console.log('File size:', file.size, 'bytes')
    console.log('File type:', file.type)
    console.log('Token exists:', !!token)
    console.log('API URL:', `${API_BASE_URL}/user/avatar`)
    
    const formData = new FormData()
    formData.append('file', file)

    console.log('FormData created, sending request...')

    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== AVATAR UPLOAD ERROR ===')
      console.error('Error response:', errorText)
      try {
        const error = JSON.parse(errorText)
        console.error('Parsed error:', error)
        throw new Error(error.message || error.error || 'Failed to update avatar')
      } catch {
        console.error('Could not parse error as JSON')
        throw new Error(errorText || 'Failed to update avatar')
      }
    }

    const result = await response.json()
    console.log('=== AVATAR UPLOAD SUCCESS ===')
    console.log('Response data:', result)
    console.log('Avatar URL:', result.avatar)
    return result
  }
}
