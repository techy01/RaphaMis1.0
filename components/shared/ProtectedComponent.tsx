import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../packages/shared/types';

interface ProtectedComponentProps {
    children: ReactNode;
    allowedRoles: UserRole[];
}

// A simple component to show/hide UI elements based on role.
// Note: This is for UI convenience only and does not replace backend authorization.
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
};
