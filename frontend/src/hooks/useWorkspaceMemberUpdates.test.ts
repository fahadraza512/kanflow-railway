import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkspaceMemberUpdates } from './useWorkspaceMemberUpdates';
import { useAuthStore } from '@/store/useAuthStore';

// Mock the auth store
jest.mock('@/store/useAuthStore');

describe('useWorkspaceMemberUpdates', () => {
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

  it('should subscribe to workspace member added events', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useWorkspaceMemberUpdates('workspace-1'), {
      wrapper,
    });

    expect(result.current).toBeUndefined();
  });

  it('should invalidate member list cache when member added', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWorkspaceMemberUpdates('workspace-1'), { wrapper });

    const event = new CustomEvent('workspace:workspace-1:member:added', {
      detail: {
        workspaceId: 'workspace-1',
        userId: 'user-2',
        user: {
          id: 'user-2',
          email: 'newuser@example.com',
          name: 'New User',
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

    renderHook(() => useWorkspaceMemberUpdates('workspace-1'), { wrapper });

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should not subscribe if workspaceId is not provided', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useWorkspaceMemberUpdates(''), { wrapper });

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWorkspaceMemberUpdates('workspace-1'), {
      wrapper,
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
