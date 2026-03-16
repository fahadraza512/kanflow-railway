import { BaseService, ApiResponse, handleApiError } from './base.service';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  workspaceId: string;
  inviterName: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  memberRemoved?: boolean;
}

export interface InvitationDetails {
  workspaceName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
}

export interface CreateInvitationDto {
  workspaceId: string;
  email: string;
  role: string;
}

class InvitationService extends BaseService {
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  constructor() {
    super('/invitations');
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const status = error?.response?.status;
      
      // Don't retry on 4xx errors (client errors)
      if (status && status >= 400 && status < 500) {
        throw error;
      }

      // Retry on 5xx errors or network failures
      if (retries > 0 && (!status || status >= 500)) {
        const delay = this.INITIAL_RETRY_DELAY * (this.MAX_RETRIES - retries + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1);
      }

      throw error;
    }
  }

  async validateToken(token: string): Promise<InvitationDetails> {
    return this.retryWithBackoff(async () => {
      try {
        const response = await this.client.get<ApiResponse<any>>(
          `${this.endpoint}/validate`,
          { params: { token } }
        );
        // Backend controller returns { success, data }, then ResponseInterceptor wraps it again
        // So we get: response.data.data.data
        const actualData = response.data.data?.data || response.data.data;
        return actualData;
      } catch (error) {
        throw handleApiError(error);
      }
    });
  }

  async acceptInvitation(token: string): Promise<{ workspaceId: string; workspaceName: string; role: string }> {
    return this.retryWithBackoff(async () => {
      try {
        const response = await this.client.post(`${this.endpoint}/accept`, { token });
        // Backend returns { data: { success, message, workspaceId, workspaceName, role }, success }
        // Due to ResponseInterceptor wrapping
        const data = response.data.data || response.data;
        const workspaceId = data.workspaceId;
        const workspaceName = data.workspaceName;
        const role = data.role;
        return { workspaceId, workspaceName, role };
      } catch (error) {
        throw handleApiError(error);
      }
    });
  }

  async createInvitation(data: CreateInvitationDto): Promise<Invitation> {
    try {
      const response = await this.client.post<ApiResponse<Invitation>>(
        this.endpoint,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getWorkspaceInvitations(
    workspaceId: string,
    status?: string
  ): Promise<Invitation[]> {
    try {
      const response = await this.client.get<ApiResponse<Invitation[]>>(
        `${this.endpoint}/workspace/${workspaceId}`,
        { params: status ? { status } : undefined }
      );
      // Handle nested response structure from ResponseInterceptor
      const invitations = response.data.data?.data || response.data.data || response.data || [];
      return Array.isArray(invitations) ? invitations : [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      await this.client.patch(`${this.endpoint}/${invitationId}/cancel`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteInvitation(invitationId: string): Promise<void> {
    try {
      await this.client.delete(`${this.endpoint}/${invitationId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async declineInvitation(token: string): Promise<void> {
    try {
      await this.client.post(`${this.endpoint}/decline`, { token });
    } catch (error) {
      // Swallow errors — if the token is already gone or invalid, that's fine
    }
  }

  async resendInvitation(invitationId: string): Promise<void> {
    try {
      await this.client.post(`${this.endpoint}/${invitationId}/resend`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const invitationService = new InvitationService();
