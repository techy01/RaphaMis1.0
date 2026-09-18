import React, { useState } from 'react';
import {
    Boxes,
    Search,
    QrCode,
    Printer,
    Thermometer,
    Clock,
    User,
    CheckCircle2,
    RefreshCw,
    X,
    Filter,
    ShieldCheck,
    FlaskConical,
    ChevronRight,
} from 'lucide-react';
import {
    SpecimenRack,
    SpecimenTube,
    SpecimenTubeStatus,
    SpecimenCapColor,
} from '../../packages/shared/types';
import { updateSpecimenTubeStatus } from '../../api/laboratoryApi';

interface SpecimenRackTabProps {
    racks: SpecimenRack[];
    onRefresh: () => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SpecimenRackTab: React.FC<SpecimenRackTabProps> = ({
    racks,
    onRefresh,
    showToast,
}) => {
    const [selectedRackId, setSelectedRackId] = useState<string>(racks[0]?.id || '');
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [selectedTube, setSelectedTube] = useState<SpecimenTube | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const activeRack = racks.find((r) => r.id === selectedRackId) || racks[0];

    const getCapColorClass = (color: SpecimenCapColor) => {
        switch (color) {
            case 'LAVENDER_EDTA':
                return 'bg-purple-600 text-white border-purple-700';
            case 'RED_SERUM':
                return 'bg-rose-600 text-white border-rose-700';
            case 'YELLOW_SST':
                return 'bg-amber-400 text-amber-950 border-amber-500';
            case 'LIGHT_BLUE_CITRATE':
                return 'bg-sky-500 text-white border-sky-600';
            case 'GREEN_HEPARIN':
                return 'bg-emerald-600 text-white border-emerald-700';
            case 'GREY_FLUORIDE':
                return 'bg-slate-500 text-white border-slate-600';
            default:
                return 'bg-slate-700 text-white border-slate-800';
        }
    };

    const getTubeLabel = (color: SpecimenCapColor) => {
        switch (color) {
            case 'LAVENDER_EDTA':
                return 'Lavender (K2-EDTA)';
            case 'RED_SERUM':
                return 'Red (Plain Serum)';
            case 'YELLOW_SST':
                return 'Gold/Yellow (SST Gel)';
            case 'LIGHT_BLUE_CITRATE':
                return 'Light Blue (Sodium Citrate)';
            case 'GREEN_HEPARIN':
                return 'Green (Lithium Heparin)';
            case 'GREY_FLUORIDE':
                return 'Grey (Sodium Fluoride)';
            default:
                return color;
        }
    };

    // Slot matrix generator (5 rows A-E, 10 columns 1-10)
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);

    const handleStatusTransition = async (newStatus: SpecimenTubeStatus) => {
        if (!selectedTube || !activeRack) return;
        try {
            await updateSpecimenTubeStatus(activeRack.id, selectedTube.id, newStatus, 'Dr. Sarah Lin / MLT');
            showToast(`Specimen ${selectedTube.barcode} moved to "${newStatus}".`, 'success');
            setSelectedTube({
                ...selectedTube,
                status: newStatus,
                chainOfCustody: [
                    ...selectedTube.chainOfCustody,
                    {
                        action: `Status updated to ${newStatus}`,
                        performedBy: 'Lab Technician',
                        timestamp: new Date().toISOString(),
                    },
                ],
            });
            onRefresh();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                            <Boxes className="w-5 h-5" />
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">Specimen Barcoding & Rack Tracking</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            Matrix 5x10 (50 Slots)
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        Chain-of-custody specimen accessioning, tube color-coding, refrigerated preservation tracking, and barcode label printing.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Rack Switcher */}
                    <select
                        value={selectedRackId}
                        onChange={(e) => setSelectedRackId(e.target.value)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
                    >
                        {racks.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name} ({r.department})
                            </option>
                        ))}
                    </select>

                    {/* Barcode Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Scan or enter barcode..."
                            value={barcodeSearch}
                            onChange={(e) => setBarcodeSearch(e.target.value)}
                            className="text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl w-52 font-mono text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tube Cap Legend */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-700 text-[11px] mr-2">Color Matrix:</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-medium text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Lavender (EDTA - CBC)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-medium text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Red (Plain Clot)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Gold (SST Chemistry)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-medium text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Light Blue (Citrate - Coag)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-medium text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Green (Heparin - Troponin)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-medium text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Grey (Fluoride - Glucose)
                </span>
            </div>

            {/* Interactive 50-Slot Rack Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Rack Grid Layout */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">{activeRack.name}</h4>
                            <p className="text-xs text-slate-400">
                                Temperature Zone: {activeRack.temperatureZone} • Department: {activeRack.department}
                            </p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {activeRack.tubes.length} / {activeRack.totalSlots} Slots Filled
                        </span>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
                        <div className="min-w-[560px] space-y-2">
                            {/* Column Numbers Header */}
                            <div className="grid grid-cols-11 gap-2 text-center text-xs font-mono font-bold text-slate-400">
                                <div></div>
                                {cols.map((c) => (
                                    <div key={c}>{c}</div>
                                ))}
                            </div>

                            {/* Matrix Rows */}
                            {rows.map((rowLetter) => (
                                <div key={rowLetter} className="grid grid-cols-11 gap-2 items-center">
                                    {/* Row letter */}
                                    <div className="text-center font-mono font-bold text-xs text-slate-400">
                                        {rowLetter}
                                    </div>

                                    {/* 10 Slots */}
                                    {cols.map((colNum) => {
                                        const slotPos = `${rowLetter}${colNum}`;
                                        const tubeInSlot = activeRack.tubes.find(
                                            (t) => t.rackSlotPosition === slotPos
                                        );
                                        const isSelected = selectedTube?.id === tubeInSlot?.id;

                                        return (
                                            <div
                                                key={slotPos}
                                                onClick={() => tubeInSlot && setSelectedTube(tubeInSlot)}
                                                className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative border ${
                                                    tubeInSlot
                                                        ? `${getCapColorClass(tubeInSlot.tubeColor)} shadow-sm hover:scale-105 ${
                                                              isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105' : ''
                                                          }`
                                                        : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 text-slate-600'
                                                }`}
                                                title={
                                                    tubeInSlot
                                                        ? `${slotPos}: ${tubeInSlot.patientName} (${tubeInSlot.barcode})\nTest: ${tubeInSlot.testPanelName}\nStatus: ${tubeInSlot.status}`
                                                        : `${slotPos}: Vacant slot`
                                                }
                                            >
                                                <span className="text-[10px] font-mono font-bold">
                                                    {slotPos}
                                                </span>
                                                {tubeInSlot && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 mt-0.5"></span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Tube Inspector & Chain of Custody */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Tube Inspection & Audit Log
                        </h4>
                        {selectedTube && (
                            <button
                                onClick={() => setIsPrintModalOpen(true)}
                                className="px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Barcode Label
                            </button>
                        )}
                    </div>

                    {selectedTube ? (
                        <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[460px]">
                            <div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCapColorClass(selectedTube.tubeColor)}`}>
                                    {getTubeLabel(selectedTube.tubeColor)}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 mt-2">{selectedTube.patientName}</h4>
                                <p className="text-xs text-slate-500 font-mono">
                                    MRN: {selectedTube.patientMRN} • Slot: {selectedTube.rackSlotPosition}
                                </p>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Barcode:</span>
                                    <span className="font-mono font-bold text-slate-900">{selectedTube.barcode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Accession #:</span>
                                    <span className="font-mono text-teal-700 font-semibold">{selectedTube.accessionNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Test Requisition:</span>
                                    <span className="font-medium text-slate-800">{selectedTube.testPanelName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Current Status:</span>
                                    <span className="font-bold text-teal-700">{selectedTube.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Storage Temp:</span>
                                    <span className="font-medium text-slate-800">{selectedTube.temperature}</span>
                                </div>
                            </div>

                            {/* Lifecycle Stage Advancement */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Update Processing Status
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleStatusTransition('CENTRIFUGED')}
                                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                    >
                                        Mark Centrifuged
                                    </button>
                                    <button
                                        onClick={() => handleStatusTransition('IN_ANALYZER')}
                                        className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                                    >
                                        Load into Analyzer
                                    </button>
                                    <button
                                        onClick={() => handleStatusTransition('ARCHIVED_COLD_STORE')}
                                        className="px-2.5 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                                    >
                                        Cold Storage (4°C)
                                    </button>
                                    <button
                                        onClick={() => handleStatusTransition('DISPOSED')}
                                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                                    >
                                        Biohazard Dispose
                                    </button>
                                </div>
                            </div>

                            {/* Chain of Custody History */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Chain of Custody Audit Log
                                </span>
                                <div className="space-y-2">
                                    {selectedTube.chainOfCustody.map((log, idx) => (
                                        <div key={idx} className="p-2 bg-slate-50 rounded-lg text-[11px] space-y-0.5 border border-slate-100">
                                            <p className="font-semibold text-slate-800">{log.action}</p>
                                            <p className="text-slate-400">
                                                {log.performedBy} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-xs text-slate-400 flex-1 flex flex-col items-center justify-center space-y-2">
                            <Boxes className="w-8 h-8 opacity-40" />
                            <p>Click any occupied slot in the matrix to inspect tube history and custody audit trail.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Printable Barcode Label Modal */}
            {isPrintModalOpen && selectedTube && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Printer className="w-4 h-4 text-teal-600" />
                                Thermal Barcode Label Preview
                            </h3>
                            <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Thermal Label Graphic Box */}
                        <div className="p-4 bg-white border-2 border-dashed border-slate-400 rounded-xl space-y-2 shadow-xs">
                            <div className="flex justify-between items-start border-b border-slate-300 pb-1.5">
                                <div>
                                    <p className="text-[11px] font-black text-slate-900 tracking-tight">RAPHAMIS CENTRAL LAB</p>
                                    <p className="text-[10px] text-slate-600 font-semibold">{selectedTube.patientName}</p>
                                </div>
                                <span className="text-[9px] font-mono bg-slate-100 px-1 py-0.5 rounded font-bold">
                                    {selectedTube.rackSlotPosition}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-700">
                                <span>MRN: <strong className="font-mono">{selectedTube.patientMRN}</strong></span>
                                <span>ACC: <strong className="font-mono">{selectedTube.accessionNumber}</strong></span>
                            </div>

                            {/* Simulated Code-128 Barcode Lines */}
                            <div className="py-2 text-center">
                                <div className="h-10 flex items-center justify-center gap-0.5 overflow-hidden">
                                    {Array.from({ length: 38 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-full ${
                                                i % 3 === 0 ? 'w-1 bg-black' : i % 2 === 0 ? 'w-0.5 bg-black' : 'w-1.5 bg-black'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                                <p className="font-mono text-[10px] font-bold tracking-widest text-slate-900 mt-1">
                                    *{selectedTube.barcode}*
                                </p>
                            </div>

                            <div className="text-[9px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
                                <span>{selectedTube.testPanelName}</span>
                                <span>{new Date(selectedTube.collectionTimestamp).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsPrintModalOpen(false)}
                                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    showToast(`Printed thermal barcode label for ${selectedTube.barcode}.`, 'success');
                                    setIsPrintModalOpen(false);
                                }}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm flex items-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Send to Zebra ZD421
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
