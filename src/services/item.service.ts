/**
 * Item Service
 * Handles calls to the external Item API such as Receive-Change
 */

import { apiRequest } from '@/lib/api/client';

export interface ReceiveChangeRequest {
  itemId: string;
  description?: string;
  price?: number;
}

export interface ReceiveChangeResponse {
  // Keep flexible since external API shape may vary
  [key: string]: any;
}

class ItemService {
  /**
   * Call Receive-Change endpoint
   * Uses the absolute URL from Postman to ensure the external API is hit
   */
  async receiveChange(payload: ReceiveChangeRequest): Promise<ReceiveChangeResponse> {
    const url = 'http://35.188.204.114/api/v1/Item/Receive-Change';

    // Build Basic auth header for testing if provided via NEXT_PUBLIC env var
    const basicCreds = process.env.NEXT_PUBLIC_ITEM_API_BASIC_AUTH_CREDENTIALS || 'admin:admin';
    const base64Encode = (s: string) => {
      if (typeof window !== 'undefined' && typeof window.btoa === 'function') return window.btoa(s);
      return Buffer.from(s).toString('base64');
    };

    const response = await apiRequest<ReceiveChangeResponse>('POST', url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${base64Encode(basicCreds)}`,
      },
      timeout: 30000,
      withAuth: false, // testing: do not attach bearer auth
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to call Receive-Change');
    }

    return response.data;
  }
}

export const itemService = new ItemService();
