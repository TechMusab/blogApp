const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5191/api'

export interface ImageUploadResponse {
  url: string
  relativePath: string
  fileName: string
  size: number
}

export class ImageService {
  static async uploadImage(file: File, token: string, folder: string = 'posts'): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/images/upload?folder=${folder}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const error = JSON.parse(errorText)
        throw new Error(error.message || 'Failed to upload image')
      } catch {
        throw new Error(errorText || 'Failed to upload image')
      }
    }

    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from server')
    }

    try {
      const result = JSON.parse(text) as ImageUploadResponse
      // Construct full URL from relative path
      const baseUrl = API_BASE_URL.replace('/api', '')
      result.url = result.relativePath.startsWith('http') 
        ? result.relativePath 
        : `${baseUrl}${result.relativePath}`
      return result
    } catch {
      throw new Error('Invalid JSON response from server')
    }
  }

  static async deleteImage(imagePath: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(imagePath)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  }

  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' }
    }

    return { valid: true }
  }
}
