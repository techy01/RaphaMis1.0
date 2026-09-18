import React from 'react';

type StatusType =
    | 'Active'
    | 'Inactive'
    | 'Suspended'
    | 'Trial'
    | 'Paid'
    | 'Pending'
    | 'Overdue'
    | 'Cancelled'
    | 'Admitted'
    | 'Outpatient'
    | 'In Treatment'
    | 'Discharged'
    | 'Critical'
    | string;

interface StatusBadgeProps {
    status: StatusType;
    size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const statusClasses: Record<string, string> = {
        Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        Suspended: 'bg-amber-100 text-amber-800 border-amber-200',
        Trial: 'bg-sky-100 text-sky-800 border-sky-200',
        Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        Pending: 'bg-amber-100 text-amber-800 border-amber-200',
        Overdue: 'bg-rose-100 text-rose-800 border-rose-200',
        Cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
        Admitted: 'bg-blue-100 text-blue-800 border-blue-200',
        Outpatient: 'bg-purple-100 text-purple-800 border-purple-200',
        'In Treatment': 'bg-teal-100 text-teal-800 border-teal-200',
        Discharged: 'bg-gray-100 text-gray-600 border-gray-200',
        Critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
        // Laboratory & Diagnostics Statuses
        Ordered: 'bg-slate-100 text-slate-700 border-slate-200',
        'Sample Collected': 'bg-sky-100 text-sky-800 border-sky-200',
        'In Analysis': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Critical Alert': 'bg-red-100 text-red-800 border-red-200 font-semibold',
        // Pharmacy Statuses
        'Pending Verification': 'bg-amber-100 text-amber-800 border-amber-200',
        'In Dispensing': 'bg-blue-100 text-blue-800 border-blue-200',
        Dispensed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Clinical Hold': 'bg-rose-100 text-rose-800 border-rose-200',
        // Radiology & RIS Statuses
        Requested: 'bg-slate-100 text-slate-700 border-slate-200',
        Scheduled: 'bg-sky-100 text-sky-800 border-sky-200',
        'Under Review': 'bg-amber-100 text-amber-800 border-amber-200',
        Reported: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Critical Finding': 'bg-red-100 text-red-800 border-red-200 font-semibold',
        // Inventory & Supply Chain Statuses
        'In Stock': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Low Stock': 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
        'Out of Stock': 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
        'Expiring Soon': 'bg-orange-100 text-orange-800 border-orange-200',
        Overstocked: 'bg-blue-100 text-blue-800 border-blue-200',
        Dispatched: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        Received: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Pending Approval': 'bg-amber-100 text-amber-800 border-amber-200',
        Draft: 'bg-slate-100 text-slate-700 border-slate-200',
        // Patient Portal Statuses
        Invited: 'bg-sky-100 text-sky-800 border-sky-200',
        Unread: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
        'In Review': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        Replied: 'bg-blue-100 text-blue-800 border-blue-200',
        Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Pending Review': 'bg-amber-100 text-amber-800 border-amber-200',
        'Approved & Sent': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        Denied: 'bg-rose-100 text-rose-800 border-rose-200',
        Confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        // Subscription & Licensing Statuses
        'Renewing Soon': 'bg-sky-100 text-sky-800 border-sky-200 font-medium',
        'Past Due': 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
        'Starter Clinic': 'bg-slate-100 text-slate-800 border-slate-200',
        'Community Hospital': 'bg-blue-100 text-blue-800 border-blue-200',
        'Enterprise Health System': 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold',
        'Sovereign Cloud': 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold',
    };

    const classes = statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
    const isCritical =
        status === 'Critical' ||
        status === 'Critical Alert' ||
        status === 'Critical Finding' ||
        status === 'Out of Stock';

    return (
        <span className={`inline-flex items-center font-medium border rounded-full ${sizeClasses} ${classes}`}>
            {isCritical && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-ping"></span>
            )}
            {status}
        </span>
    );
};
