import React, { useState, useMemo } from 'react';
import {
    Zap,
    ShieldAlert,
    ScanLine,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Send,
    User,
    Pill,
    ArrowRight,
    LayoutGrid,
    ListFilter,
    Flame,
    Lock,
    Eye,
} from 'lucide-react';
import {
    PharmacyOrder,
    PharmacyTriageStatus,
    PharmacyTriageUrgency,
} from '../../packages/shared/types';

interface PharmacyTriagePipelineProps {
    orders: PharmacyOrder[];
    onReviewOrder: (order: PharmacyOrder) => void;
    onQuickAdvance: (orderId: string, nextStatus: PharmacyTriageStatus) => void;
    onOpenBarcodeScan: (order: PharmacyOrder) => void;
}

type TriageFilterType = 'All' | 'STAT' | 'Pending Verification' | 'In Dispensing' | 'Barcode Verification' | 'Ready for Delivery' | 'Clinical Hold';

export const PharmacyTriagePipeline: React.FC<PharmacyTriagePipelineProps> = ({
    orders,
    onReviewOrder,
    onQuickAdvance,
    onOpenBarcodeScan,
}) => {
    const [filterAcuity, setFilterAcuity] = useState<TriageFilterType>('All');
    const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');

    // Counts for filter pills
    const filterCounts = useMemo(() => {
        return {
            All: orders.length,
            STAT: orders.filter((o) => o.urgency === 'STAT' && o.status !== 'Dispensed').length,
            'Pending Verification': orders.filter((o) => o.status === 'Pending Verification').length,
            'In Dispensing': orders.filter((o) => o.status === 'In Dispensing').length,
            'Barcode Verification': orders.filter((o) => o.status === 'Barcode Verification').length,
            'Ready for Delivery': orders.filter((o) => o.status === 'Ready for Delivery').length,
            'Clinical Hold': orders.filter((o) => o.status === 'Clinical Hold').length,
        };
    }, [orders]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        if (filterAcuity === 'All') return orders;
        if (filterAcuity === 'STAT') {
            return orders.filter((o) => o.urgency === 'STAT' && o.status !== 'Dispensed');
        }
        return orders.filter((o) => o.status === filterAcuity);
    }, [orders, filterAcuity]);

    // Grouping by stage for pipeline kanban
    const stages: Array<{
        status: PharmacyTriageStatus;
        title: string;
        color: string;
        badgeColor: string;
    }> = [
        {
            status: 'Clinical Hold',
            title: 'Clinical Safety Holds',
            color: 'border-rose-300 bg-rose-50/40',
            badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        },
        {
            status: 'Pending Verification',
            title: 'Pending Pharmacist Triage',
            color: 'border-amber-300 bg-amber-50/40',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        {
            status: 'In Dispensing',
            title: 'In Robotics / Compounding',
            color: 'border-blue-300 bg-blue-50/40',
            badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        },
        {
            status: 'Barcode Verification',
            title: 'Barcode Scan (BCMA)',
            color: 'border-teal-300 bg-teal-50/40',
            badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        },
        {
            status: 'Ready for Delivery',
            title: 'Ready for Tube / Dispatch',
            color: 'border-emerald-300 bg-emerald-50/40',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
    ];

    const getUrgencyBadge = (urgency: PharmacyTriageUrgency) => {
        switch (urgency) {
            case 'STAT':
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                        <Flame className="w-2.5 h-2.5" />
                        STAT
                    </span>
                );
            case 'Urgent':
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        Urgent
                    </span>
                );
            case 'Discharge':
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Discharge
                    </span>
                );
            case 'Routine':
            default:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700">
                        Routine
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Triage Acuity Filter Bar & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    <button
                        onClick={() => setFilterAcuity('All')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                            filterAcuity === 'All'
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All ({filterCounts.All})
                    </button>

                    <button
                        onClick={() => setFilterAcuity('STAT')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                            filterAcuity === 'STAT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : filterCounts.STAT > 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        STAT / Code ({filterCounts.STAT})
                    </button>

                    <button
                        onClick={() => setFilterAcuity('Clinical Hold')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                            filterAcuity === 'Clinical Hold'
                                ? 'bg-rose-800 text-white shadow-xs'
                                : filterCounts['Clinical Hold'] > 0
                                ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Clinical Holds ({filterCounts['Clinical Hold']})
                    </button>

                    <button
                        onClick={() => setFilterAcuity('Pending Verification')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                            filterAcuity === 'Pending Verification'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Pending Triage ({filterCounts['Pending Verification']})
                    </button>

                    <button
                        onClick={() => setFilterAcuity('In Dispensing')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                            filterAcuity === 'In Dispensing'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        In Robotics ({filterCounts['In Dispensing']})
                    </button>

                    <button
                        onClick={() => setFilterAcuity('Barcode Verification')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                            filterAcuity === 'Barcode Verification'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Barcode Scan ({filterCounts['Barcode Verification']})
                    </button>

                    <button
                        onClick={() => setFilterAcuity('Ready for Delivery')}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                            filterAcuity === 'Ready for Delivery'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Ready / Transit ({filterCounts['Ready for Delivery']})
                    </button>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
                    <button
                        onClick={() => setViewMode('pipeline')}
                        className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            viewMode === 'pipeline'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                        title="Pipeline Swimlanes View"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pipeline</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            viewMode === 'table'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                        title="Dense Table View"
                    >
                        <ListFilter className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Table</span>
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900">Queue Clear</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        No orders currently match the selected triage filter. All medications are either verified or processed.
                    </p>
                </div>
            )}

            {/* PIPELINE / KANBAN VIEW */}
            {viewMode === 'pipeline' && filteredOrders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
                    {stages.map((stage) => {
                        const stageOrders = filteredOrders.filter((o) => o.status === stage.status);

                        return (
                            <div
                                key={stage.status}
                                className={`rounded-2xl border p-3.5 flex flex-col gap-3 min-h-[420px] ${stage.color}`}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight">
                                            {stage.title}
                                        </h3>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${stage.badgeColor}`}
                                    >
                                        {stageOrders.length}
                                    </span>
                                </div>

                                {/* Orders List */}
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[720px] pr-0.5">
                                    {stageOrders.length === 0 ? (
                                        <div className="h-32 border-2 border-dashed border-gray-200/80 rounded-xl flex items-center justify-center text-[11px] text-gray-400 font-medium">
                                            Stage Empty
                                        </div>
                                    ) : (
                                        stageOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className={`bg-white rounded-xl border p-3.5 shadow-xs transition hover:shadow-md flex flex-col justify-between gap-2.5 ${
                                                    order.urgency === 'STAT'
                                                        ? 'border-rose-300 ring-1 ring-rose-200'
                                                        : order.status === 'Clinical Hold'
                                                        ? 'border-rose-400'
                                                        : 'border-gray-200/90'
                                                }`}
                                            >
                                                {/* Card Header: Rx# & Urgency */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-mono text-gray-400 font-medium block">
                                                            {order.orderNumber}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                                                            {order.medicationName}
                                                        </h4>
                                                    </div>
                                                    {getUrgencyBadge(order.urgency)}
                                                </div>

                                                {/* Patient Demographics */}
                                                <div className="bg-gray-50/80 rounded-lg p-2 text-[11px] border border-gray-100 space-y-1">
                                                    <div className="flex items-center justify-between font-semibold text-gray-800">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3 text-gray-400" />
                                                            {order.patientName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            {order.patientMRN}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                        <span>{order.patientLocation}</span>
                                                        <span>{order.patientAge}y · {order.patientWeightKg}kg</span>
                                                    </div>
                                                </div>

                                                {/* Order Specifications */}
                                                <div className="text-[11px] text-gray-600 space-y-0.5">
                                                    <div className="flex items-center justify-between text-xs font-medium text-gray-900">
                                                        <span>Dose: {order.dose}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 font-mono">
                                                            {order.route}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 line-clamp-1">
                                                        {order.frequency}
                                                    </p>
                                                </div>

                                                {/* Safety Alerts Pill (if any) */}
                                                {order.safetyAlerts && order.safetyAlerts.length > 0 && (
                                                    <div className="space-y-1">
                                                        {order.safetyAlerts.slice(0, 2).map((alert) => (
                                                            <div
                                                                key={alert.id}
                                                                className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1.5 ${
                                                                    alert.severity === 'Contraindicated'
                                                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                                        : alert.severity === 'Major'
                                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                        : 'bg-blue-50 text-blue-700'
                                                                }`}
                                                            >
                                                                <ShieldAlert className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">{alert.title}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* High Alert / Controlled Drug indicators */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {order.isHighAlert && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            HIGH-ALERT
                                                        </span>
                                                    )}
                                                    {order.isControlledSubstance && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                                                            <Lock className="w-2.5 h-2.5" />
                                                            {order.scheduleLevel || 'C-II'}
                                                        </span>
                                                    )}
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-600">
                                                        {order.deliveryMethod}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => onReviewOrder(order)}
                                                        className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white transition flex items-center justify-center gap-1 shadow-xs"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>Triage</span>
                                                    </button>

                                                    {order.status === 'Barcode Verification' && (
                                                        <button
                                                            onClick={() => onOpenBarcodeScan(order)}
                                                            className="py-1.5 px-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1"
                                                            title="Scan 2D Barcode / BCMA"
                                                        >
                                                            <ScanLine className="w-3 h-3" />
                                                            <span>Scan</span>
                                                        </button>
                                                    )}

                                                    {order.status === 'Ready for Delivery' && (
                                                        <button
                                                            onClick={() => onQuickAdvance(order.id, 'Dispensed')}
                                                            className="py-1.5 px-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1"
                                                            title="Dispatch via Pneumatic Tube / Bedside Delivery"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            <span>Launch</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* HIGH-DENSITY CLINICAL TABLE VIEW */}
            {viewMode === 'table' && filteredOrders.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Urgency & Rx #</th>
                                    <th className="py-3 px-4">Patient & Location</th>
                                    <th className="py-3 px-4">Medication Order</th>
                                    <th className="py-3 px-4">Route & Dose</th>
                                    <th className="py-3 px-4">CDSS Safety Flags</th>
                                    <th className="py-3 px-4">Triage Status</th>
                                    <th className="py-3 px-4">Delivery</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-teal-50/40 transition cursor-pointer ${
                                            order.urgency === 'STAT' ? 'bg-rose-50/30' : ''
                                        }`}
                                        onClick={() => onReviewOrder(order)}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {getUrgencyBadge(order.urgency)}
                                                <span className="font-mono text-gray-900 font-semibold text-xs">
                                                    {order.orderNumber}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 block mt-0.5">
                                                {new Date(order.prescribedAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-bold text-gray-900 text-xs">
                                                {order.patientName}
                                            </div>
                                            <div className="text-[11px] text-gray-500">
                                                {order.patientLocation} ({order.patientMRN})
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-bold text-gray-900 text-xs">
                                                {order.medicationName}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-mono">
                                                NDC: {order.ndc}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-gray-800">
                                                {order.dose}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {order.route} · {order.frequency}
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            {order.safetyAlerts.length > 0 ? (
                                                <div className="flex flex-col gap-1 max-w-xs">
                                                    {order.safetyAlerts.map((a) => (
                                                        <span
                                                            key={a.id}
                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md truncate ${
                                                                a.severity === 'Contraindicated'
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : a.severity === 'Major'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-blue-50 text-blue-700'
                                                            }`}
                                                        >
                                                            {a.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    No Alerts
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    order.status === 'Clinical Hold'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : order.status === 'Pending Verification'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : order.status === 'In Dispensing'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : order.status === 'Barcode Verification'
                                                        ? 'bg-teal-100 text-teal-800'
                                                        : order.status === 'Ready for Delivery'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4">
                                            <span className="text-xs text-gray-700 font-medium">
                                                {order.deliveryMethod}
                                            </span>
                                            {order.tubeStationCode && (
                                                <span className="block font-mono text-[10px] text-teal-600 font-semibold">
                                                    {order.tubeStationCode}
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onReviewOrder(order)}
                                                    className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                                >
                                                    Review
                                                </button>
                                                {order.status === 'Barcode Verification' && (
                                                    <button
                                                        onClick={() => onOpenBarcodeScan(order)}
                                                        className="px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
                                                    >
                                                        Scan
                                                    </button>
                                                )}
                                                {order.status === 'Ready for Delivery' && (
                                                    <button
                                                        onClick={() => onQuickAdvance(order.id, 'Dispensed')}
                                                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                                                    >
                                                        Dispatch
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
