import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { PortalUserAccount } from '../../packages/shared/types';
import { getTenants } from '../../api/tenantsApi';
import { useQuery } from '@tanstack/react-query';

interface InvitePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        patientId: string;
        patientMrn: string;
        patientName: string;
        email: string;
        phone: string;
        tenantId: string;
        tenantName: string;
    }) => Promise<void>;
}

export const InvitePatientModal: React.FC<InvitePatientModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const [patientName, setPatientName] = useState('');
    const [patientMrn, setPatientMrn] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [tenantId, setTenantId] = useState(tenants[0]?.id || 'tnt_001');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!patientName.trim() || !email.trim()) {
            setError('Patient Name and Email Address are required.');
            return;
        }

        setIsSubmitting(true);
        const tenant = tenants.find((t) => t.id === tenantId) || tenants[0];

        try {
            await onSubmit({
                patientId: `pat_${Date.now()}`,
                patientMrn: patientMrn.trim() || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
                patientName: patientName.trim(),
                email: email.trim(),
                phone: phone.trim() || '+1 (555) 000-0000',
                tenantId,
                tenantName: tenant?.name || 'St. Jude General Hospital',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to send portal invitation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral">
                                Enroll Patient in Portal
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Send a secure electronic enrollment invitation to the patient.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Patient Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="e.g. Jonathan Morris"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Medical Record # (MRN)
                                </label>
                                <input
                                    type="text"
                                    value={patientMrn}
                                    onChange={(e) => setPatientMrn(e.target.value)}
                                    placeholder="e.g. MRN-10099"
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Primary Facility
                                </label>
                                <select
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 bg-white"
                                >
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Patient Email (Portal Login)
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter patient email address"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Mobile Phone (SMS 2FA Verification)
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                            <Mail className="h-4 w-4" />
                            {isSubmitting ? 'Sending...' : 'Send Portal Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
