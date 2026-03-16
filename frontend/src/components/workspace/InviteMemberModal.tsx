'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { invitationService } from '@/services/api/invitation.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess?: () => void;
}

const roleOptions = [
  { value: 'viewer', label: 'Viewer - Can view projects and tasks' },
  { value: 'member', label: 'Member - Can create and edit tasks' },
  { value: 'pm', label: 'Project Manager - Can manage projects' },
  { value: 'admin', label: 'Admin - Can manage workspace settings' },
];

export function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: InviteMemberModalProps) {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Prevent self-invitation
    if (user?.email && email.toLowerCase() === user.email.toLowerCase()) {
      setError('You cannot invite yourself to the workspace');
      return;
    }

    try {
      setLoading(true);
      await invitationService.createInvitation({
        workspaceId,
        email,
        role,
      });

      // Show success toast (you can implement a toast system)
      console.log('Invitation sent successfully');
      
      // Reset form
      setEmail('');
      setRole('member');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (err: any) {
      console.error('Failed to send invitation:', err);
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setRole('member');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Team Member"
      subtitle="Send an invitation to join your workspace"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
          disabled={loading}
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roleOptions}
          icon={<UserPlus className="w-4 h-4" />}
          disabled={loading}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
