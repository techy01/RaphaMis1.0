import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    X,
    Film,
    User,
    Stethoscope,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    Activity,
    Printer,
    Edit3,
    Eye,
    ShieldAlert,
    Camera,
    Layers,
} from 'lucide-react';
import {
    RadiologyStudy,
    RadiologyStatus,
    RadiologyKeyImage,
    DicomStudy,
} from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { DicomViewer } from './DicomViewer';

interface RadiologyStudyDetailsModalProps {
    study: RadiologyStudy | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenReportEntry: (study: RadiologyStudy) => void;
    onAdvanceStatus: (studyId: string, nextStatus: RadiologyStatus) => Promise<void>;
    onAcknowledgeCriticalFinding: (studyId: string) => Promise<void>;
}

export const RadiologyStudyDetailsModal: React.FC<RadiologyStudyDetailsModalProps> = ({
    study,
    isOpen,
    onClose,
    onOpenReportEntry,
    onAdvanceStatus,
    onAcknowledgeCriticalFinding,
}) => {
    if (!isOpen || !study) return null;

    const [activeTab, setActiveTab] = useState<'report' | 'pacs'>('report');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleAdvance = async (nextStatus: RadiologyStatus) => {
        setIsUpdating(true);
        try {
            await onAdvanceStatus(study.id, nextStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAcknowledge = async () => {
        setIsUpdating(true);
        try {
            await onAcknowledgeCriticalFinding(study.id);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    let formattedRequestedAt = 'N/A';
    try {
        formattedRequestedAt = format(new Date(study.requestedAt), 'MMM d, yyyy HH:mm');
    } catch {
        formattedRequestedAt = String(study.requestedAt);
    }

    let formattedReportedAt = 'Pending Radiologist Signature';
    if (study.reportedAt) {
        try {
            formattedReportedAt = format(new Date(study.reportedAt), 'MMM d, yyyy HH:mm');
        } catch {
            formattedReportedAt = String(study.reportedAt);
        }
    }

    const urgencyBadgeClass = {
        STAT: 'bg-red-100 text-red-800 border-red-200 font-semibold',
        Urgent: 'bg-amber-100 text-amber-800 border-amber-200',
        Routine: 'bg-gray-100 text-gray-700 border-gray-200',
    }[study.urgency] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-4xl w-full my-8 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <Film className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-neutral">
                                    Radiology Study: {study.procedureName}
                                </h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${urgencyBadgeClass}`}>
                                    {study.urgency}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Accession #{study.accessionNumber} • Modality: {study.modality} • {study.patientTenantName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="flex bg-gray-200/80 p-1 rounded-lg text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setActiveTab('report')}
                                className={`px-3 py-1.5 rounded-md transition ${
                                    activeTab === 'report'
                                        ? 'bg-white text-gray-900 shadow-2xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Diagnostic Report
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('pacs')}
                                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                                    activeTab === 'pacs'
                                        ? 'bg-teal-600 text-white shadow-2xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                PACS Viewer
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition ml-2"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Critical Finding Alert Box */}
                    {study.criticalFindingAlert && (
                        <div className="p-4 rounded-xl border border-red-200 bg-red-50/80 text-red-900 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                    <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
                                            Critical Radiological Finding Alert
                                        </h4>
                                        <p className="text-xs text-red-700 mt-0.5">
                                            This study contains urgent, life-threatening findings requiring immediate verbal provider readback notification.
                                        </p>
                                    </div>
                                </div>
                                {!study.criticalFindingAcknowledgedBy ? (
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={handleAcknowledge}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition shrink-0 shadow-xs"
                                    >
                                        Acknowledge Provider Readback
                                    </button>
                                ) : (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold shrink-0">
                                        Readback Confirmed
                                    </span>
                                )}
                            </div>
                            {study.criticalFindingAcknowledgedBy && (
                                <p className="text-[11px] text-red-700 bg-white/70 p-2 rounded border border-red-200 mt-2">
                                    <strong>Readback Confirmed:</strong> {study.criticalFindingAcknowledgedBy} at{' '}
                                    {study.criticalFindingAcknowledgedAt
                                        ? format(new Date(study.criticalFindingAcknowledgedAt), 'MMM d, yyyy HH:mm')
                                        : 'Recorded'}
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === 'report' ? (
                        <>
                            {/* 2-Column Demographics & Technical Specs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient Information */}
                                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-teal-600" />
                                        Patient Demographics
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Patient Name:</span>
                                            <span className="font-semibold text-gray-900">{study.patientName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Medical Record Number:</span>
                                            <span className="font-mono font-medium text-gray-700">{study.patientMRN}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Age & Gender:</span>
                                            <span className="text-gray-800">
                                                {study.patientAge} years • {study.patientGender}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Care Location / Unit:</span>
                                            <span className="text-gray-800 font-medium">{study.patientLocation}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-200 pt-2">
                                            <span className="text-gray-500">Hospital Facility:</span>
                                            <span className="text-gray-800">{study.patientTenantName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Examination Specifications */}
                                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                        <Layers className="h-4 w-4 text-teal-600" />
                                        Imaging Modality & Technique
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Modality:</span>
                                            <span className="font-semibold text-gray-900">{study.modality}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Body Region:</span>
                                            <span className="text-gray-800">{study.bodyRegion}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Contrast Administration:</span>
                                            <span className={`font-semibold ${study.contrastUsed ? 'text-indigo-700' : 'text-gray-600'}`}>
                                                {study.contrastUsed ? `Yes (${study.contrastType || 'IV Contrast'})` : 'None (Non-contrast)'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">PACS Instances:</span>
                                            <span className="font-mono text-gray-700">
                                                {study.imageSeriesCount} Series • {study.totalImageInstances} Images
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-200 pt-2">
                                            <span className="text-gray-500">Workflow Status:</span>
                                            <StatusBadge status={study.status} size="sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical History & Indication */}
                            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-semibold">Clinical Indication:</span>
                                    <span className="text-gray-500">
                                        Ordered by <strong>{study.orderingPhysicianName}</strong> ({study.orderingPhysicianDepartment})
                                    </span>
                                </div>
                                <p className="text-gray-800">{study.clinicalIndication}</p>
                            </div>

                            {/* Formal Diagnostic Radiology Report Section */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-teal-600" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral">
                                            Radiologist Diagnostic Report
                                        </h4>
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                        {study.reportedAt ? `Signed: ${formattedReportedAt}` : 'Pending Radiologist Final Report'}
                                    </div>
                                </div>

                                <div className="p-5 space-y-5 text-xs text-gray-800">
                                    {/* Technique */}
                                    {study.techniqueDescription && (
                                        <div className="space-y-1">
                                            <h5 className="font-bold text-gray-700 uppercase text-[11px] tracking-wider">
                                                Technique
                                            </h5>
                                            <p className="text-gray-700 leading-relaxed bg-gray-50/60 p-2.5 rounded-lg border border-gray-100">
                                                {study.techniqueDescription}
                                            </p>
                                        </div>
                                    )}

                                    {/* Findings */}
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-gray-700 uppercase text-[11px] tracking-wider">
                                            Findings
                                        </h5>
                                        {study.findings ? (
                                            <p className="whitespace-pre-line leading-relaxed text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                                                {study.findings}
                                            </p>
                                        ) : (
                                            <div className="p-4 rounded-lg bg-gray-50 text-gray-400 italic text-center border border-dashed border-gray-200">
                                                No findings transcribed yet. Study is currently {study.status}.
                                            </div>
                                        )}
                                    </div>

                                    {/* Impression */}
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider">
                                            Impression
                                        </h5>
                                        {study.impression ? (
                                            <div className="whitespace-pre-line leading-relaxed text-gray-900 font-medium bg-teal-50/40 p-3.5 rounded-lg border border-teal-200">
                                                {study.impression}
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-gray-50 text-gray-400 italic text-center border border-dashed border-gray-200">
                                                Pending radiologist conclusion.
                                            </div>
                                        )}
                                    </div>

                                    {/* Recommendations */}
                                    {study.recommendations && (
                                        <div className="space-y-1">
                                            <h5 className="font-bold text-gray-700 uppercase text-[11px] tracking-wider">
                                                Recommendations
                                            </h5>
                                            <p className="text-gray-700 leading-relaxed bg-amber-50/40 p-2.5 rounded-lg border border-amber-200">
                                                {study.recommendations}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Radiologist Digital Signature */}
                                <div className="bg-gray-50/70 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-700">
                                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                        <span>
                                            Interpreting Radiologist: <strong>{study.radiologistName || 'Unassigned'}</strong>
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 font-mono">
                                        Digital Verification • RIS PACS Link #89410
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Interactive Enterprise DICOM / PACS Viewer Tab */
                        <div className="space-y-4">
                            <div className="h-[480px] rounded-xl overflow-hidden border border-neutral-800 shadow-xl bg-neutral-950">
                                <DicomViewer
                                    study={{
                                        id: study.id,
                                        studyInstanceUid: `1.2.840.113619.2.55.3.2831154.${study.accessionNumber.replace(/\D/g, '') || '101'}`,
                                        accessionNumber: study.accessionNumber,
                                        patientId: study.patientId,
                                        patientName: study.patientName,
                                        patientMRN: study.patientMRN,
                                        patientBirthDate: '1982-05-14',
                                        patientSex: study.patientGender,
                                        studyDate: study.studyDate || study.performedAt?.split('T')[0] || study.requestedAt?.split('T')[0] || '2026-09-15',
                                        studyTime: study.studyTime || study.performedAt?.split('T')[1]?.substring(0, 5) || study.requestedAt?.split('T')[1]?.substring(0, 5) || '09:00',
                                        studyDescription: `${study.procedureName} - ${study.bodyRegion}`,
                                        modality: study.modality,
                                        modalitiesInStudy: [study.modality],
                                        seriesCount: study.imageSeriesCount || 1,
                                        instanceCount: study.totalImageInstances || 1,
                                        institutionName: study.patientTenantName || 'RaphaMIS Referral Hospital',
                                        status: 'ONLINE',
                                        tenantId: study.tenantId || study.patientTenantId || 'tenant_001',
                                        createdAt: study.createdAt || study.requestedAt || new Date().toISOString(),
                                        series: [
                                            {
                                                id: `ser_${study.id}`,
                                                seriesInstanceUid: `1.2.840.113619.2.55.3.2831154.${study.accessionNumber.replace(/\D/g, '') || '101'}.1`,
                                                studyInstanceUid: `1.2.840.113619.2.55.3.2831154.${study.accessionNumber.replace(/\D/g, '') || '101'}`,
                                                seriesNumber: 1,
                                                seriesDescription: `${study.bodyRegion} Diagnostic Series`,
                                                modality: study.modality,
                                                bodyPartExamined: study.bodyRegion.toUpperCase(),
                                                numberOfInstances: study.keyImages.length || 1,
                                                pixelSpacing: [0.65, 0.65],
                                                sliceThickness: 1.25,
                                                instances: study.keyImages.map((img, idx) => ({
                                                    id: `inst_${study.id}_${idx}`,
                                                    sopInstanceUid: `1.2.840.113619.2.55.3.2831154.${study.accessionNumber.replace(/\D/g, '') || '101'}.1.${idx + 1}`,
                                                    seriesInstanceUid: `1.2.840.113619.2.55.3.2831154.${study.accessionNumber.replace(/\D/g, '') || '101'}.1`,
                                                    instanceNumber: idx + 1,
                                                    rows: 512,
                                                    columns: 512,
                                                    bitsAllocated: 16,
                                                    windowCenter: 40,
                                                    windowWidth: 400,
                                                    photometricInterpretation: 'MONOCHROME2',
                                                    pixelSpacing: [0.65, 0.65],
                                                    sliceThickness: 1.25,
                                                    imageUrl: img.imageUrl,
                                                    metadataTags: {
                                                        '0008,0060': study.modality,
                                                        '0010,0010': study.patientName,
                                                        '0010,0020': study.patientMRN,
                                                        '0020,000D': `1.2.840.113619.2.55.3.2831154.${study.accessionNumber.replace(/\D/g, '') || '101'}`,
                                                        '0008,1030': study.procedureName,
                                                    },
                                                })),
                                            },
                                        ],
                                    }}
                                />
                            </div>

                            {/* Key Images Series Thumbnails */}
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Stored Diagnostic Series & Annotations
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {study.keyImages.map((img, i) => (
                                        <div key={i} className="p-2.5 bg-white rounded-lg border border-gray-200 flex items-start gap-2.5">
                                            <div className="h-10 w-10 bg-gray-900 rounded flex items-center justify-center text-cyan-400 shrink-0">
                                                <Film className="h-5 w-5" />
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-semibold text-gray-900">{img.title}</p>
                                                <p className="text-[11px] text-gray-500">{img.description}</p>
                                                <p className="text-[10px] font-mono text-teal-700 mt-0.5">{img.sliceInfo}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        >
                            <Printer className="h-3.5 w-3.5 text-gray-500" />
                            Print RIS Report
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {study.status === 'Requested' && (
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdvance('Scheduled')}
                                className="px-3.5 py-2 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Clock className="h-3.5 w-3.5 text-sky-600" />
                                Schedule Modality Slot
                            </button>
                        )}

                        {study.status === 'Scheduled' && (
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdvance('In Progress')}
                                className="px-3.5 py-2 text-xs font-medium text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Camera className="h-3.5 w-3.5 text-indigo-600" />
                                Start Image Acquisition
                            </button>
                        )}

                        {study.status === 'In Progress' && (
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdvance('Under Review')}
                                className="px-3.5 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Layers className="h-3.5 w-3.5 text-amber-600" />
                                Complete Scan & Send to Worklist
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenReportEntry(study);
                            }}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            {study.status === 'Reported' || study.status === 'Critical Finding'
                                ? 'Edit / Amend Report'
                                : 'Draft & Sign Report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
