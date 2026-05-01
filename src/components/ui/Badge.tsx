import React from 'react';

type BadgeVariant = 'cyan' | 'purple' | 'green' | 'red' | 'yellow' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeVariant> = {
    admin: 'red',
    moderator: 'purple',
    user: 'cyan',
  };
  return <Badge variant={map[role] ?? 'gray'}>{role}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    approved: 'green',
    pending: 'yellow',
    suspended: 'red',
  };
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>;
}
