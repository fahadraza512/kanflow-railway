import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardWorkspaceUpdates } from './useDashboardWorkspaceUpdates';
import { useAuthStore } from '@/store/useAuthStore';

// Mock the auth store
jest.mock('@/store/useAuthStore');

describe('useDashboardWorkspaceUpdates', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to dashboard workspace added events', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDashboardWorkspaceUpdates(), {
      wrapper,
    });

    expect(result.current).toBeUndefined();
  });

  it('should invalidate dashboard cache when workspace added', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useDashboardWorkspaceUpdates(), { wrapper });

    const event = new CustomEvent('user:user-1:workspace:added', {
      detail: {
        userId: 'user-1',
        workspace: {
          id: 'workspace-1',
          name: 'New Workspace',
          memberCount: 2,
        },
        timestamp: new Date().toISOString(),
      },
    });

    window.dispatchEvent(event);

    expect(invalidateQueriesSpy).toHaveBeenCalled();
  });

  it('should not subscribe if user is not authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useDashboardWorkspaceUpdates(), { wrapper });

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDashboardWorkspaceUpdates(), {
      wrapper,
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should use correct event name with user ID', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useDashboardWorkspaceUpdates(), { wrapper });

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'user:user-1:workspace:added',
      expect.any(Function),
    );
  });
});
