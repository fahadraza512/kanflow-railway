export const FEATURES = {
  invitations: process.env.NEXT_PUBLIC_INVITE_FEATURE_ENABLED === 'true',
} as const;
