import React, { useState } from 'react';
import {
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Filter,
    Download,
    RefreshCw,
    ExternalLink,
    DollarSign,
    Check,
    X,
    Building2,
    FileText,
} from 'lucide-react';
import { HospitalPatientBill } from '../../packages/shared/types';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ClaimsAdjudicationTabProps {
    bills: HospitalPatientBill[];
    onSelectBill: (bill: HospitalPatientBill) => void;
}

export const ClaimsAdjudicationTab: React.FC<ClaimsAdjudicationTabProps> = ({
    bills,
    onSelectBill,
}) => {
    const { format: formatCurrency } = useCurrency();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Approved' | 'Pending' | 'Rejected'>('ALL');

    // Extract all insurance tenders across all bills
    const claims = bills.flatMap((bill) => {
        return bill.tenders
            .filter((t) => t.type === 'insurance' && t.insuranceDetails)
            .map((t) => ({
                id: t.id,
                billId: bill.id,
                billNumber: bill.billNumber,
                patientName: bill.patientName,
                patientMrn: bill.patientMrn,
                tenantName: bill.tenantName,
                department: bill.department,
                claimedAmount: t.convertedAmount,
                currency: bill.currency,
                provider: t.insuranceDetails!.provider,
                policyNumber: t.insuranceDetails!.policyNumber,
                preAuthCode: t.insuranceDetails!.preAuthCode,
                status: t.insuranceDetails!.claimStatus,
                copayRequired: t.insuranceDetails!.copayRequired || 0,
                processedAt: t.processedAt,
                fullBill: bill,
            }));
    });

    const filteredClaims = claims.filter((c) => {
        const matchesSearch =
            c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.preAuthCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'Approved' && c.status === 'Approved') ||
            (statusFilter === 'Pending' && c.status === 'Pending Adjudication') ||
            (statusFilter === 'Rejected' && c.status === 'Rejected');
        return matchesSearch && matchesStatus;
    });

    const totalClaimed = claims.reduce((sum, c) => sum + c.claimedAmount, 0);
    const approvedCount = claims.filter((c) => c.status === 'Approved').length;
    const cleanClaimRate = claims.length > 0 ? Math.round((approvedCount / claims.length) * 100) : 100;

    return (
        <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Claims Submitted</span>
                        <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
                        {formatCurrency(totalClaimed, 'USD')}
                    </p>
                    <span className="text-xs text-blue-600 font-medium mt-1 inline-block">
                        {claims.length} claims processed
                    </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Clean Claim Rate</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-mono">
                        {cleanClaimRate}%
                    </p>
                    <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
                        Instant pre-auth validation
                    </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Active Payers</span>
                        <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                        8 Payers
                    </p>
                    <span className="text-xs text-purple-600 font-medium mt-1 inline-block">
                        SHA, Jubilee, Aetna, Cigna
                    </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Settlement Time</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                        Real-time
                    </p>
                    <span className="text-xs text-amber-600 font-medium mt-1 inline-block">
                        Direct co-pay adjudication
                    </span>
                </div>
            </div>

            {/* Claims Management Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search patient, MRN, insurer..."
                            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter:</span>
                        {(['ALL', 'Approved', 'Pending', 'Rejected'] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                                    statusFilter === st
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MOBILE FIRST: Claims Card List for small screens */}
                <div className="block md:hidden divide-y divide-gray-200">
                    {filteredClaims.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-500">
                            No insurance claims match your criteria.
                        </div>
                    ) : (
                        filteredClaims.map((claim) => (
                            <div key={claim.id} className="p-4 space-y-2 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-xs text-blue-700">
                                            {claim.preAuthCode}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            ({claim.billNumber})
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                            claim.status === 'Approved'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : claim.status === 'Pending Adjudication'
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        {claim.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{claim.patientName}</h4>
                                        <p className="text-xs text-gray-500">
                                            MRN: <span className="font-mono text-gray-700">{claim.patientMrn}</span> • {claim.provider}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-sm text-gray-900">
                                            {formatCurrency(claim.claimedAmount, claim.currency)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-1 flex justify-end">
                                    <button
                                        onClick={() => onSelectBill(claim.fullBill)}
                                        className="py-1.5 px-3 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-1"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        View Bill Receipt
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                            <tr>
                                <th className="py-3 px-4">Claim & Pre-Auth Code</th>
                                <th className="py-3 px-4">Patient / MRN</th>
                                <th className="py-3 px-4">Health Insurer & Policy</th>
                                <th className="py-3 px-4">Hospital & Dept</th>
                                <th className="py-3 px-4 text-right">Claim Amount</th>
                                <th className="py-3 px-4">Adjudication Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {filteredClaims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="font-mono font-bold text-blue-700">
                                            {claim.preAuthCode}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            Bill: {claim.billNumber}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-gray-900">{claim.patientName}</div>
                                        <div className="font-mono text-gray-400 text-[10px]">{claim.patientMrn}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-gray-800">{claim.provider}</div>
                                        <div className="text-gray-500 font-mono text-[10px]">{claim.policyNumber}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-gray-800">{claim.tenantName}</div>
                                        <div className="text-gray-400 text-[10px]">{claim.department}</div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 text-sm">
                                        {formatCurrency(claim.claimedAmount, claim.currency)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                            claim.status === 'Approved'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : claim.status === 'Pending Adjudication'
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}>
                                            <CheckCircle2 className="w-3 h-3" />
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => onSelectBill(claim.fullBill)}
                                            className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-1"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            View Bill
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
