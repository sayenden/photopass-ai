const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class ApiService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async processPhoto(photoFile: File, backgroundColor: string) {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('backgroundColor', backgroundColor);

    return this.makeRequest('/photos/process', {
      method: 'POST',
      body: formData,
    });
  }

  static async checkCompliance(photoFile: File, country: string, photoType: string) {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('country', country);
    formData.append('photoType', photoType);

    return this.makeRequest('/photos/compliance', {
      method: 'POST',
      body: formData,
    });
  }

  static async generateFinalPhotos(
    photoFile: File, 
    country: string, 
    photoType: string, 
    cropData: { zoom: number; position: { x: number; y: number } }
  ) {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('country', country);
    formData.append('photoType', photoType);
    formData.append('cropData', JSON.stringify(cropData));

    return this.makeRequest('/photos/generate', {
      method: 'POST',
      body: formData,
    });
  }

  static async createPaymentIntent(amount: number, currency: string = 'usd') {
    return this.makeRequest('/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });
  }
}
