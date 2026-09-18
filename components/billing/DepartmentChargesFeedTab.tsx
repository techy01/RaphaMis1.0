import React, { useState } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import {
    FlaskConical,
    Pill,
    Stethoscope,
    Bed,
    Scissors,
    ArrowRight,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    RefreshCw,
    Shield,
    DollarSign,
} from 'lucide-react';

interface LiveCharge {
    id: string;
    timestamp: string;
    department: 'Pharmacy' | 'Laboratory' | 'Radiology' | 'Inpatient Ward' | 'Operating Theatre' | 'Consultation';
    patientName: string;
    patientMrn: string;
    billNumber: string;
    itemCode: string;
    description: string;
    quantity: number;
    unitPriceUsd: number;
    totalUsd: number;
    orderedBy: string;
    status: 'Posted to Folio' | 'Pending Verification' | 'Insurance Pre-Auth Required';
    payerScheme: 'SHA / NHIF' | 'Jubilee Private' | 'Aetna International' | 'Cash / Self-Pay';
}

const INITIAL_CHARGES: LiveCharge[] = [
    {
        id: 'chg_101',
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        department: 'Pharmacy',
        patientName: 'Marcus Brody',
        patientMrn: 'MRN-48201',
        billNumber: 'BILL-2026-0842',
        itemCode: 'RX-IV-CEFT',
        description: 'IV Ceftriaxone 2g Vial + Saline Infusion 500ml',
        quantity: 2,
        unitPriceUsd: 45,
        totalUsd: 90,
        orderedBy: 'Dr. Sarah Lin, MD',
        status: 'Posted to Folio',
        payerScheme: 'SHA / NHIF',
    },
    {
        id: 'chg_102',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        department: 'Laboratory',
        patientName: 'Eleanor Vance',
        patientMrn: 'MRN-84920',
        billNumber: 'BILL-2026-0840',
        itemCode: 'LAB-ELEC-STAT',
        description: 'STAT Serum Electrolytes (Na+, K+, Cl-, HCO3-)',
        quantity: 1,
        unitPriceUsd: 75,
        totalUsd: 75,
        orderedBy: 'Dr. Sarah Lin, MD',
        status: 'Posted to Folio',
        payerScheme: 'Jubilee Private',
    },
    {
        id: 'chg_103',
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        department: 'Radiology',
        patientName: 'Samuel Kamau',
        patientMrn: 'MRN-20491',
        billNumber: 'BILL-2026-0802',
        itemCode: 'RAD-CXR-PA',
        description: 'Chest X-Ray Digital PA & Lateral Views with Report',
        quantity: 1,
        unitPriceUsd: 110,
        totalUsd: 110,
        orderedBy: 'Dr. Evelyn Kariuki, MD',
        status: 'Posted to Folio',
        payerScheme: 'Cash / Self-Pay',
    },
    {
        id: 'chg_104',
        timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
        department: 'Operating Theatre',
        patientName: 'Beatrice Wanjiku',
        patientMrn: 'MRN-10492',
        billNumber: 'BILL-2026-0841',
        itemCode: 'SURG-THEATRE-02',
        description: 'Major Operating Theatre Suite (2.5 hrs) & Anesthesia Gases',
        quantity: 1,
        unitPriceUsd: 1350,
        totalUsd: 1350,
        orderedBy: 'Dr. Evelyn Kariuki, MD',
        status: 'Posted to Folio',
        payerScheme: 'SHA / NHIF',
    },
    {
        id: 'chg_105',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        department: 'Inpatient Ward',
        patientName: 'Eleanor Vance',
        patientMrn: 'MRN-84920',
        billNumber: 'BILL-2026-0840',
        itemCode: 'NURS-DAY-03',
        description: 'Specialized Cardiac Care Inpatient Nursing & Telemetry (24 hrs)',
        quantity: 1,
        unitPriceUsd: 220,
        totalUsd: 220,
        orderedBy: 'Nurse Jessica Alba, RN',
        status: 'Posted to Folio',
        payerScheme: 'Jubilee Private',
    },
    {
        id: 'chg_106',
        timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
        department: 'Consultation',
        patientName: 'Maria Rodriguez',
        patientMrn: 'MRN-39104',
        billNumber: 'BILL-2026-0843',
        itemCode: 'CONS-SPEC-01',
        description: 'Emergency Specialist Consultant Evaluation & Acuity Review',
        quantity: 1,
        unitPriceUsd: 85,
        totalUsd: 85,
        orderedBy: 'Dr. Michael Chen, MD',
        status: 'Pending Verification',
        payerScheme: 'Aetna International',
    },
];

export const DepartmentChargesFeedTab: React.FC = () => {
    const { convertAndFormat } = useCurrency();
    const [charges, setCharges] = useState<LiveCharge[]>(INITIAL_CHARGES);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');

    const getDeptBadge = (dept: LiveCharge['department']) => {
        switch (dept) {
            case 'Pharmacy':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Pill className="w-3 h-3 text-emerald-600" />
                        <span>Pharmacy</span>
                    </span>
                );
            case 'Laboratory':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        <FlaskConical className="w-3 h-3 text-purple-600" />
                        <span>Laboratory</span>
                    </span>
                );
            case 'Radiology':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <Stethoscope className="w-3 h-3 text-indigo-600" />
                        <span>Radiology</span>
                    </span>
                );
            case 'Inpatient Ward':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        <Bed className="w-3 h-3 text-blue-600" />
                        <span>Inpatient Ward</span>
                    </span>
                );
            case 'Operating Theatre':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        <Scissors className="w-3 h-3 text-rose-600" />
                        <span>Theatre</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-800 border border-slate-200">
                        <DollarSign className="w-3 h-3 text-slate-600" />
                        <span>Consultation</span>
                    </span>
                );
        }
    };

    const filtered = charges.filter((c) => {
        const matchesSearch =
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    const totalPostedUsd = charges
        .filter((c) => c.status === 'Posted to Folio')
        .reduce((sum, c) => sum + c.totalUsd, 0);

    return (
        <div className="space-y-4">
            {/* Top Stat Ribbon for Live Feed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-[11px] block font-medium">Auto-Captured Cross-Dept Charges</span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">{charges.length} Line Items</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">✓ Real-time CPOE dispatch</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-[11px] block font-medium">Accumulated Feed Value</span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                        {convertAndFormat(totalPostedUsd, 'USD')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Converted to active currency</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-[11px] block font-medium">Revenue Leakage Prevention</span>
                    <span className="text-xl font-bold text-emerald-700 mt-0.5 block">0 Unbilled Orders</span>
                    <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                        Direct sync: Pharmacy + LIS + RIS + Ward
                    </span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search charges by patient name, MRN, bill #, medication, or lab code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs focus:outline-none"
                    >
                        <option value="ALL">All Departments</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Inpatient Ward">Inpatient Ward</option>
                        <option value="Operating Theatre">Operating Theatre</option>
                        <option value="Consultation">Consultation</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            // simulate live polling refresh
                            setCharges([...charges]);
                        }}
                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Refresh live charges feed"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Charges Feed Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Time & Dept</th>
                                <th className="py-3 px-4">Patient / Folio</th>
                                <th className="py-3 px-4">Clinical Charge Description</th>
                                <th className="py-3 px-4 text-center">Qty</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                                <th className="py-3 px-4">Ordering Clinician</th>
                                <th className="py-3 px-4">Folio Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        No department charges matching your filter.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((chg) => (
                                    <tr key={chg.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-500 text-[11px]">
                                                {new Date(chg.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                            <div className="mt-1">{getDeptBadge(chg.department)}</div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900">{chg.patientName}</div>
                                            <div className="text-[11px] font-mono text-slate-500">
                                                {chg.patientMrn} • {chg.billNumber}
                                            </div>
                                            <div className="text-[10px] text-slate-400">{chg.payerScheme}</div>
                                        </td>

                                        <td className="py-3 px-4 max-w-xs">
                                            <div className="font-semibold text-slate-900">{chg.description}</div>
                                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                Code: {chg.itemCode}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                                            {chg.quantity}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <div className="font-bold text-slate-900 text-sm">
                                                {convertAndFormat(chg.totalUsd, 'USD')}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                @ {convertAndFormat(chg.unitPriceUsd, 'USD')}/ea
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="text-slate-800 font-medium">{chg.orderedBy}</div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    chg.status === 'Posted to Folio'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                }`}
                                            >
                                                {chg.status === 'Posted to Folio' && (
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                )}
                                                <span>{chg.status}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
