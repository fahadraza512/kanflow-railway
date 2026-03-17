'use client';

import { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { invitationService, Invitation } from '@/services/api/invitation.service';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { RefreshCw, X, Mail, Trash2 } from 'lucide-react';

interface InvitationListProps {
  workspaceId: string;
}

export interface InvitationListRef {
  refresh: () => void;
}

const VALID_ROLES = ['owner', 'admin', 'pm', 'member', 'viewer'];

export const InvitationList = forwardRef<InvitationListRef, InvitationListProps>(
  function InvitationList({ workspaceId }, ref) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => fetchInvitations(true),
  }));

  useEffect(() => {
    if (workspaceId) {
      fetchInvitations();
    }
  }, [workspaceId, statusFilter]);

  // Poll every 10 seconds for real-time updates
  useEffect(() => {
    if (!workspaceId) return;
    const interval = setInterval(() => fetchInvitations(true), 10000);
    return () => clearInterval(interval);
  }, [workspaceId, statusFilter]);

  const fetchInvitations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setInitialLoading(true);
      const data = await invitationService.getWorkspaceInvitations(
        workspaceId,
        statusFilter || undefined
      );
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch invitations:', err);
      setInvitations([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      setActionLoading(invitationId);
      await invitationService.cancelInvitation(invitationId);
      await fetchInvitations(true);
    } catch (err: any) {
      console.error('Failed to cancel invitation:', err);
      alert(err.message || 'Failed to cancel invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      setActionLoading(invitationId);
      await invitationService.resendInvitation(invitationId);
      await fetchInvitations(true);
      alert('Invitation resent successfully');
    } catch (err: any) {
      console.error('Failed to resend invitation:', err);
      alert(err.message || 'Failed to resend invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (invitationId: string) => {
    if (!confirm('Delete this invitation record?')) return;
    try {
      setActionLoading(invitationId);
      await invitationService.deleteInvitation(invitationId);
      await fetchInvitations(true);
    } catch (err: any) {
      console.error('Failed to delete invitation:', err);
      alert(err.message || 'Failed to delete invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string, memberRemoved?: boolean) => {
    if (status === 'accepted' && memberRemoved) {
      return <Badge variant="warning">Removed</Badge>;
    }
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: 'yellow', label: 'Pending' },
      accepted: { color: 'success', label: 'Accepted' },
      expired: { color: 'danger', label: 'Expired' },
      cancelled: { color: 'default', label: 'Cancelled' },
    };
    const { color, label } = config[status] || config.pending;
    return <Badge variant={color as any}>{label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { color: string; label: string }> = {
      owner: { color: 'purple', label: 'Owner' },
      admin: { color: 'blue', label: 'Admin' },
      pm: { color: 'indigo', label: 'Project Manager' },
      member: { color: 'green', label: 'Member' },
      viewer: { color: 'gray', label: 'Viewer' },
    };

    const normalized = role?.toLowerCase();
    const isValid = VALID_ROLES.includes(normalized);

    if (!isValid) {
      // Role no longer exists in the system
      return (
        <span className="inline-flex items-center gap-1">
          <Badge variant="danger">{role}</Badge>
          <span className="text-xs text-red-500 font-medium">Role not found</span>
        </span>
      );
    }

    const { color, label } = config[normalized];
    return <Badge variant={color as any}>{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isRoleInvalid = (role: string) => !VALID_ROLES.includes(role?.toLowerCase());

  if (!workspaceId) {
    return (
      <EmptyState
        icon={<Mail className="w-12 h-12" />}
        title="No workspace selected"
        message="Please select a workspace to view invitations"
      />
    );
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <EmptyState
          icon={<Mail className="w-12 h-12" />}
          title="No invitations"
          message={
            statusFilter
              ? `No ${statusFilter} invitations found. Try changing the filter.`
              : 'You haven\'t sent any invitations yet. Click "Invite Member" above to invite someone to this workspace.'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Invitations
        </h3>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'expired', label: 'Expired' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          className="w-48"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Invited By</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Created</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Expires</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => {
              const isRemoved = invitation.status === 'accepted' && invitation.memberRemoved;
              const roleInvalid = isRoleInvalid(invitation.role);
              const isLoading = actionLoading === invitation.id;

              return (
                <tr
                  key={invitation.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${roleInvalid ? 'bg-red-50' : ''}`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{invitation.email}</td>
                  <td className="py-3 px-4">{getRoleBadge(invitation.role)}</td>
                  <td className="py-3 px-4">{getStatusBadge(invitation.status, invitation.memberRemoved)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{invitation.inviterName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(invitation.createdAt)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(invitation.expiresAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Resend: pending, expired, cancelled, removed, or invalid role */}
                      {(invitation.status === 'pending' ||
                        invitation.status === 'expired' ||
                        invitation.status === 'cancelled' ||
                        isRemoved ||
                        roleInvalid) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResend(invitation.id)}
                          disabled={isLoading}
                          title="Resend invitation"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      )}

                      {/* Cancel (X): pending OR removed */}
                      {(invitation.status === 'pending' || isRemoved) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(invitation.id)}
                          disabled={isLoading}
                          title="Cancel invitation"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}

                      {/* Delete: non-pending, or invalid role */}
                      {(invitation.status !== 'pending' || roleInvalid) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(invitation.id)}
                          disabled={isLoading}
                          title="Delete record"
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
