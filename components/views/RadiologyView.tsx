import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Film,
    Search,
    RefreshCw,
    Plus,
    FileSpreadsheet,
    X,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Eye,
    Edit3,
    Camera,
    Layers,
    ShieldAlert,
    Activity,
    SlidersHorizontal,
    Server,
    Upload,
    HardDrive,
    Zap,
    Maximize2,
    Check,
} from 'lucide-react';
import {
    getRadiologyStudies,
    getRadiologyStats,
    updateRadiologyStudyStatus,
    submitRadiologyReport,
    acknowledgeCriticalFinding,
    createRadiologyStudy,
} from '../../api/radiologyApi';
import { getTenants } from '../../api/tenantsApi';
import {
    getPacsStudies,
    getPacsServers,
    echoPacsServer,
} from '../../api/pacsApi';
import {
    RadiologyStudy,
    RadiologyStatus,
    RadiologyModality,
    DicomStudy,
    PacsServerConfig,
} from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Toast } from '../shared/Toast';
import { RadiologyStudyDetailsModal } from '../radiology/RadiologyStudyDetailsModal';
import { RadiologyReportEntryModal } from '../radiology/RadiologyReportEntryModal';
import { NewRadiologyOrderModal } from '../radiology/NewRadiologyOrderModal';
import { DicomViewer } from '../radiology/DicomViewer';
import { PacsUploadModal } from '../radiology/PacsUploadModal';
import { PacsServerManagerModal } from '../radiology/PacsServerManagerModal';

export const RadiologyView: React.FC = () => {
    const queryClient = useQueryClient();

    // Mode: RIS Worklist vs PACS Archive
    const [viewMode, setViewMode] = useState<'ris' | 'pacs'>('ris');

    // Filters and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('ALL');
    const [selectedModality, setSelectedModality] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedUrgency, setSelectedUrgency] = useState('ALL');
    const [sortBy, setSortBy] = useState<'recent' | 'urgency' | 'patient' | 'modality'>('recent');

    // Modals
    const [selectedStudyForDetails, setSelectedStudyForDetails] = useState<RadiologyStudy | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [selectedStudyForReport, setSelectedStudyForReport] = useState<RadiologyStudy | null>(null);
    const [isReportEntryOpen, setIsReportEntryOpen] = useState(false);

    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

    // PACS Modals & Viewer state
    const [isPacsUploadOpen, setIsPacsUploadOpen] = useState(false);
    const [isPacsManagerOpen, setIsPacsManagerOpen] = useState(false);
    const [selectedDicomStudyForViewer, setSelectedDicomStudyForViewer] = useState<DicomStudy | null>(null);
    const [isDicomViewerModalOpen, setIsDicomViewerModalOpen] = useState(false);
    const [echoTestingId, setEchoTestingId] = useState<string | null>(null);

    // Toast notifications
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(message);
        setToastType(type);
    };

    // Queries
    const {
        data: studiesData = [],
        isLoading,
        isRefetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ['radiologyStudies', selectedTenant, searchTerm, selectedStatus, selectedModality, selectedUrgency],
        queryFn: () =>
            getRadiologyStudies({
                tenantId: selectedTenant,
                search: searchTerm,
                status: selectedStatus,
                modality: selectedModality,
                urgency: selectedUrgency,
            }),
    });

    const {
        data: pacsStudiesData = [],
        isLoading: isPacsLoading,
        refetch: refetchPacsStudies,
    } = useQuery({
        queryKey: ['pacsStudies', searchTerm, selectedModality],
        queryFn: () => getPacsStudies({ search: searchTerm, modality: selectedModality }),
    });

    const {
        data: pacsServersData = [],
        refetch: refetchPacsServers,
    } = useQuery<PacsServerConfig[]>({
        queryKey: ['pacsServers'],
        queryFn: () => getPacsServers(),
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { data: statsData } = useQuery({
        queryKey: ['radiologyStats', selectedTenant],
        queryFn: () => getRadiologyStats(selectedTenant),
    });

    const studyList: RadiologyStudy[] = Array.isArray(studiesData) ? studiesData : [];
    const tenantList = Array.isArray(tenantsData) ? tenantsData : [];

    // Aggregated Metrics
    const metrics = useMemo(() => {
        const total = studyList.length;
        const pendingAcquisition = studyList.filter(
            (s) => s.status === 'Requested' || s.status === 'Scheduled' || s.status === 'In Progress'
        ).length;
        const unreported = studyList.filter((s) => s.status === 'Under Review').length;
        const criticalFindings = studyList.filter(
            (s) => s.status === 'Critical Finding' || s.criticalFindingAlert
        ).length;

        return {
            total: statsData?.totalStudiesToday ?? total,
            pendingAcquisition: statsData?.pendingAcquisitionCount ?? pendingAcquisition,
            unreported: statsData?.unreportedCount ?? unreported,
            criticalFindings: statsData?.criticalFindingsCount ?? criticalFindings,
        };
    }, [studyList, statsData]);

    // Filter and Sort Pipeline
    const filteredStudies = useMemo(() => {
        return studyList
            .filter((study) => {
                const term = searchTerm.toLowerCase().trim();
                const matchesSearch =
                    !term ||
                    study.accessionNumber.toLowerCase().includes(term) ||
                    study.procedureName.toLowerCase().includes(term) ||
                    study.patientName.toLowerCase().includes(term) ||
                    study.patientMRN.toLowerCase().includes(term) ||
                    study.orderingPhysicianName.toLowerCase().includes(term) ||
                    (study.radiologistName && study.radiologistName.toLowerCase().includes(term));

                const matchesTenant =
                    selectedTenant === 'ALL' || study.patientTenantId === selectedTenant;

                const matchesModality =
                    selectedModality === 'ALL' || study.modality === selectedModality;

                const matchesStatus =
                    selectedStatus === 'ALL' || study.status === selectedStatus;

                const matchesUrgency =
                    selectedUrgency === 'ALL' || study.urgency === selectedUrgency;

                return matchesSearch && matchesTenant && matchesModality && matchesStatus && matchesUrgency;
            })
            .sort((a, b) => {
                if (sortBy === 'urgency') {
                    const weight: Record<string, number> = { STAT: 3, Urgent: 2, Routine: 1 };
                    return (weight[b.urgency] || 0) - (weight[a.urgency] || 0);
                }
                if (sortBy === 'patient') {
                    return a.patientName.localeCompare(b.patientName);
                }
                if (sortBy === 'modality') {
                    return a.modality.localeCompare(b.modality);
                }
                // default: recent
                return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
            });
    }, [studyList, searchTerm, selectedTenant, selectedModality, selectedStatus, selectedUrgency, sortBy]);

    // Handlers
    const handleOpenDetails = (study: RadiologyStudy) => {
        setSelectedStudyForDetails(study);
        setIsDetailsOpen(true);
    };

    const handleOpenReportEntry = (study: RadiologyStudy) => {
        setSelectedStudyForReport(study);
        setIsReportEntryOpen(true);
    };

    const handleAdvanceStatus = async (studyId: string, nextStatus: RadiologyStatus) => {
        const updated = await updateRadiologyStudyStatus(studyId, nextStatus);
        setSelectedStudyForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['radiologyStudies'] });
        queryClient.invalidateQueries({ queryKey: ['radiologyStats'] });
        showToast(`Study status transitioned to "${nextStatus}".`, 'success');
    };

    const handleSubmitReport = async (
        studyId: string,
        reportData: {
            techniqueDescription?: string;
            findings: string;
            impression: string;
            recommendations?: string;
            radiologistName: string;
            criticalFindingAlert?: boolean;
        }
    ) => {
        const updated = await submitRadiologyReport(studyId, reportData);
        setSelectedStudyForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['radiologyStudies'] });
        queryClient.invalidateQueries({ queryKey: ['radiologyStats'] });

        if (updated.criticalFindingAlert) {
            showToast('CRITICAL RADIOLOGICAL FINDING FLAGGED. Mandatory telephone provider readback initiated.', 'error');
        } else {
            showToast(`Diagnostic report finalized and signed for ${updated.accessionNumber}.`, 'success');
        }
    };

    const handleAcknowledgeFinding = async (studyId: string) => {
        const updated = await acknowledgeCriticalFinding(
            studyId,
            'Dr. Sarah Lin, MD (Attending Physician)'
        );
        setSelectedStudyForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['radiologyStudies'] });
        queryClient.invalidateQueries({ queryKey: ['radiologyStats'] });
        showToast('Critical finding readback acknowledged and logged in RIS.', 'info');
    };

    const handleCreateStudy = async (payload: Partial<RadiologyStudy>) => {
        const created = await createRadiologyStudy(payload);
        queryClient.invalidateQueries({ queryKey: ['radiologyStudies'] });
        queryClient.invalidateQueries({ queryKey: ['radiologyStats'] });
        showToast(`Imaging study requisition ${created.accessionNumber} queued successfully.`, 'success');
    };

    const handleTestEcho = async (server: PacsServerConfig) => {
        setEchoTestingId(server.id);
        try {
            const res = await echoPacsServer(server.id);
            if (res.success) {
                showToast(`C-ECHO SUCCESS: ${server.name} responded in ${res.roundTripMs}ms.`, 'success');
            } else {
                showToast(`C-ECHO FAILED: ${server.name} - ${res.message}`, 'error');
            }
            refetchPacsServers();
        } catch (err: any) {
            showToast(`C-ECHO test error: ${err?.message || 'Connection timeout'}`, 'error');
        } finally {
            setEchoTestingId(null);
        }
    };

    const handleLaunchDicomViewer = (study: DicomStudy) => {
        setSelectedDicomStudyForViewer(study);
        setIsDicomViewerModalOpen(true);
    };

    const handleLaunchViewerFromRis = (study: RadiologyStudy) => {
        const dicomStudy: DicomStudy = {
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
        };
        setSelectedDicomStudyForViewer(dicomStudy);
        setIsDicomViewerModalOpen(true);
    };

    const handleExportCSV = () => {
        if (filteredStudies.length === 0) {
            showToast('No radiology records to export.', 'info');
            return;
        }

        const headers = [
            'Accession Number',
            'Procedure Name',
            'Modality',
            'Body Region',
            'Patient Name',
            'MRN',
            'Urgency',
            'Status',
            'Contrast Used',
            'Ordering Physician',
            'Interpreting Radiologist',
            'Facility',
            'Requested At',
            'Reported At',
            'Critical Finding',
        ];

        const rows = filteredStudies.map((s) => [
            s.accessionNumber,
            `"${s.procedureName}"`,
            s.modality,
            s.bodyRegion,
            `"${s.patientName}"`,
            s.patientMRN,
            s.urgency,
            s.status,
            s.contrastUsed ? 'Yes' : 'No',
            `"${s.orderingPhysicianName}"`,
            `"${s.radiologistName || 'Unassigned'}"`,
            `"${s.patientTenantName}"`,
            s.requestedAt ? format(new Date(s.requestedAt), 'yyyy-MM-dd HH:mm') : '',
            s.reportedAt ? format(new Date(s.reportedAt), 'yyyy-MM-dd HH:mm') : '',
            s.criticalFindingAlert ? 'YES' : 'NO',
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `raphamis_radiology_studies_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredStudies.length} radiology records to CSV.`);
    };

    return (
        <div className="space-y-6">
            {toastMessage && (
                <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-neutral">Radiology Information System (RIS & PACS)</h2>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                            Diagnostic Imaging
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                            Phase 4 Production Ready
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Comprehensive multi-modality scheduling, PACS DICOM image archive, structured reporting, and critical finding workflows.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            if (viewMode === 'ris') refetch();
                            else { refetchPacsStudies(); refetchPacsServers(); }
                        }}
                        disabled={isLoading || isRefetching || isPacsLoading}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        title="Refresh data"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefetching || isPacsLoading ? 'animate-spin text-teal-600' : ''}`} />
                        Refresh
                    </button>

                    {viewMode === 'ris' ? (
                        <>
                            <button
                                onClick={handleExportCSV}
                                className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                Export RIS Log
                            </button>

                            <button
                                onClick={() => setIsNewOrderOpen(true)}
                                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <Plus className="h-4 w-4" />
                                New Imaging Order
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsPacsManagerOpen(true)}
                                className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Server className="h-4 w-4 text-indigo-600" />
                                PACS Server Nodes
                            </button>

                            <button
                                onClick={() => setIsPacsUploadOpen(true)}
                                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <Upload className="h-4 w-4" />
                                Ingest DICOM (.dcm / ZIP)
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* View Mode Navigation Tabs */}
            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setViewMode('ris')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                        viewMode === 'ris'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <Film className="h-4 w-4" />
                    RIS Worklist & Reports
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        viewMode === 'ris' ? 'bg-teal-700 text-teal-100' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {studyList.length}
                    </span>
                </button>

                <button
                    onClick={() => setViewMode('pacs')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                        viewMode === 'pacs'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <HardDrive className="h-4 w-4" />
                    Enterprise PACS DICOM Archive
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        viewMode === 'pacs' ? 'bg-teal-700 text-teal-100' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {pacsStudiesData.length}
                    </span>
                </button>
            </div>

            {viewMode === 'ris' ? (
                <>

            {/* Statistical Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Studies */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Studies Today</p>
                        <p className="text-2xl font-bold text-neutral mt-1">{metrics.total.toLocaleString()}</p>
                        <p className="text-[11px] text-teal-600 font-medium mt-1">Across all hospital scanners</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <Film className="h-6 w-6" />
                    </div>
                </div>

                {/* 2. Pending Image Acquisition */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Acquisition</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{metrics.pendingAcquisition}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Requested & on table</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Camera className="h-6 w-6" />
                    </div>
                </div>

                {/* 3. Unreported Worklist */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Unreported Worklist</p>
                        <p className="text-2xl font-bold text-indigo-700 mt-1">{metrics.unreported}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Awaiting radiologist dictation</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Layers className="h-6 w-6" />
                    </div>
                </div>

                {/* 4. Critical Findings Alert */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Critical Findings</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-red-600">{metrics.criticalFindings}</p>
                            {metrics.criticalFindings > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-red-600 font-medium mt-1">Immediate telephone readback</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Accession, Procedure, Patient, MRN, Doctor..."
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Facility / Tenant Filter */}
                    <div>
                        <select
                            value={selectedTenant}
                            onChange={(e) => setSelectedTenant(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Facilities</option>
                            {tenantList.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Modality Filter */}
                    <div>
                        <select
                            value={selectedModality}
                            onChange={(e) => setSelectedModality(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Modalities</option>
                            <option value="X-Ray (CR/DR)">X-Ray (CR/DR)</option>
                            <option value="Computed Tomography (CT)">Computed Tomography (CT)</option>
                            <option value="Magnetic Resonance Imaging (MRI)">MRI</option>
                            <option value="Ultrasound (US)">Ultrasound (US)</option>
                            <option value="Mammography">Mammography</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="Requested">Requested</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Reported">Reported</option>
                            <option value="Critical Finding">Critical Finding</option>
                        </select>
                    </div>

                    {/* Urgency & Sort */}
                    <div className="flex gap-2">
                        <select
                            value={selectedUrgency}
                            onChange={(e) => setSelectedUrgency(e.target.value)}
                            className="w-full py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Urgencies</option>
                            <option value="STAT">STAT</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Routine">Routine</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-32 py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="recent">Recent</option>
                            <option value="urgency">Urgency</option>
                            <option value="patient">Patient</option>
                            <option value="modality">Modality</option>
                        </select>
                    </div>
                </div>

                {/* Filter tags & active result count */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div>
                        Showing <strong>{filteredStudies.length}</strong> of <strong>{studyList.length}</strong> imaging studies
                        {(selectedTenant !== 'ALL' ||
                            selectedModality !== 'ALL' ||
                            selectedStatus !== 'ALL' ||
                            selectedUrgency !== 'ALL' ||
                            searchTerm) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTenant('ALL');
                                    setSelectedModality('ALL');
                                    setSelectedStatus('ALL');
                                    setSelectedUrgency('ALL');
                                }}
                                className="ml-3 text-teal-600 hover:underline font-semibold"
                            >
                                Reset all filters
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span> STAT / Critical Finding
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span> Under Radiologist Review
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Reported
                        </span>
                    </div>
                </div>
            </div>

            {/* Studies Table (Desktop) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-5 py-3.5">Study & Procedure</th>
                                <th scope="col" className="px-4 py-3.5">Patient Details</th>
                                <th scope="col" className="px-4 py-3.5">Modality & Protocol</th>
                                <th scope="col" className="px-4 py-3.5">Urgency</th>
                                <th scope="col" className="px-4 py-3.5">Workflow Status</th>
                                <th scope="col" className="px-4 py-3.5">Ordering Physician</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <RefreshCw className="h-5 w-5 animate-spin text-teal-600" />
                                            <span>Loading radiology studies...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-red-500">
                                        Error loading imaging records. Please refresh.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filteredStudies.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-gray-500">
                                        <Film className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="font-semibold text-gray-700">No matching radiology studies found</p>
                                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                            Try modifying your filter parameters or schedule a new examination requisition.
                                        </p>
                                        <button
                                            onClick={() => setIsNewOrderOpen(true)}
                                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                                        >
                                            + New Imaging Order
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {filteredStudies.map((study) => {
                                const isCritical = study.status === 'Critical Finding' || study.criticalFindingAlert;
                                const isStat = study.urgency === 'STAT';

                                const urgencyBadgeClass = {
                                    STAT: 'bg-red-100 text-red-800 border-red-200 font-semibold',
                                    Urgent: 'bg-amber-100 text-amber-800 border-amber-200',
                                    Routine: 'bg-gray-100 text-gray-700 border-gray-200',
                                }[study.urgency] || 'bg-gray-100 text-gray-700 border-gray-200';

                                return (
                                    <tr
                                        key={study.id}
                                        className={`hover:bg-teal-50/40 transition ${
                                            isCritical ? 'bg-red-50/30' : isStat ? 'bg-amber-50/20' : 'bg-white'
                                        }`}
                                    >
                                        {/* Study & Procedure */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs shrink-0 border ${
                                                        isCritical
                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                            : 'bg-teal-50 text-teal-700 border-teal-200'
                                                    }`}
                                                >
                                                    {isCritical ? (
                                                        <ShieldAlert className="h-4 w-4 text-red-600" />
                                                    ) : (
                                                        <Film className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => handleOpenDetails(study)}
                                                        className="font-semibold text-gray-900 hover:text-teal-700 text-left"
                                                    >
                                                        {study.procedureName}
                                                    </button>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                                        <span className="font-mono">{study.accessionNumber}</span>
                                                        <span>•</span>
                                                        <span className="text-teal-700 font-medium">
                                                            {study.bodyRegion}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Patient Details */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="font-semibold text-gray-900">{study.patientName}</p>
                                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                    MRN: {study.patientMRN}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {study.patientAge}y • {study.patientGender} • {study.patientLocation}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Modality & Protocol */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                                    {study.modality}
                                                </span>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                                    {study.contrastUsed ? (
                                                        <span className="text-indigo-600 font-medium">+ IV Contrast</span>
                                                    ) : (
                                                        <span>Non-contrast</span>
                                                    )}
                                                    {study.totalImageInstances > 0 && (
                                                        <span>• {study.totalImageInstances} imgs</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Urgency */}
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${urgencyBadgeClass}`}
                                            >
                                                {study.urgency === 'STAT' && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5 animate-ping"></span>
                                                )}
                                                {study.urgency}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={study.status} size="sm" />
                                        </td>

                                        {/* Physician & Facility */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-gray-900 font-medium">{study.orderingPhysicianName}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    {study.patientTenantName}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenDetails(study)}
                                                    className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition flex items-center gap-1"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View / PACS
                                                </button>

                                                <button
                                                    onClick={() => handleOpenReportEntry(study)}
                                                    className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1"
                                                    title="Dictate / Sign Report"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5 text-gray-600" />
                                                    Report
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-gray-200">
                    {filteredStudies.map((study) => (
                        <div key={study.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-neutral text-sm">{study.procedureName}</p>
                                    <p className="text-xs font-mono text-gray-500">
                                        {study.accessionNumber} • {study.patientName}
                                    </p>
                                </div>
                                <StatusBadge status={study.status} size="sm" />
                            </div>
                            <div className="text-xs text-gray-600 flex justify-between">
                                <span>{study.modality}</span>
                                <span className="font-semibold text-red-600">{study.urgency}</span>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    onClick={() => handleOpenReportEntry(study)}
                                    className="px-3 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-300 rounded-lg"
                                >
                                    Draft Report
                                </button>
                                <button
                                    onClick={() => handleOpenDetails(study)}
                                    className="px-3 py-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg"
                                >
                                    View / PACS
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </>
            ) : (
                /* PACS Enterprise DICOM Archive Mode */
                <div className="space-y-6">
                    {/* PACS Server Nodes Status Header Bar */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Server className="h-5 w-5 text-indigo-600" />
                                <h3 className="text-sm font-bold text-gray-900">Connected PACS DICOM Application Entities (AE)</h3>
                                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                                    {pacsServersData.filter(s => s.status === 'ONLINE').length} Active
                                </span>
                            </div>
                            <button
                                onClick={() => setIsPacsManagerOpen(true)}
                                className="text-xs text-teal-700 hover:text-teal-900 font-medium hover:underline self-start sm:self-auto"
                            >
                                Configure Server Nodes & Routing →
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {pacsServersData.map((server) => (
                                <div
                                    key={server.id}
                                    className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs text-gray-900">{server.name}</span>
                                                {server.isDefault && (
                                                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-medium">Default</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                                {server.aeTitle} • {server.host}:{server.port}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            server.status === 'ONLINE'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {server.status}
                                        </span>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500">
                                            {server.type} • {server.dicomwebUrl ? 'DICOMweb' : 'DIMSE C-STORE'}
                                        </span>
                                        <button
                                            onClick={() => handleTestEcho(server)}
                                            disabled={echoTestingId === server.id}
                                            className="px-2 py-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 rounded hover:bg-indigo-50 transition flex items-center gap-1"
                                            title="Perform DICOM C-ECHO Verification"
                                        >
                                            <Zap className={`h-3 w-3 ${echoTestingId === server.id ? 'animate-spin text-indigo-600' : ''}`} />
                                            {echoTestingId === server.id ? 'Echoing...' : 'C-ECHO Ping'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PACS Search and Modality Filters */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full sm:w-80">
                            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search PACS by Patient, MRN, UID, Accession..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                            {['ALL', 'CT', 'MR', 'CR', 'DX', 'US', 'NM'].map((mod) => (
                                <button
                                    key={mod}
                                    onClick={() => setSelectedModality(mod)}
                                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                                        selectedModality === mod
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {mod}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PACS Studies Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Archived DICOM Studies ({pacsStudiesData.length})
                            </span>
                            <span className="text-xs text-gray-500">
                                DICOM PS 3.10 / C-STORE Archive
                            </span>
                        </div>

                        {pacsStudiesData.length === 0 ? (
                            <div className="p-12 text-center">
                                <HardDrive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">No DICOM studies matched your criteria</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Try clearing your search query or ingest new DICOM files into the archive.
                                </p>
                                <button
                                    onClick={() => setIsPacsUploadOpen(true)}
                                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg inline-flex items-center gap-1.5"
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    Ingest DICOM (.dcm)
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Modality</th>
                                            <th className="px-4 py-3">Patient</th>
                                            <th className="px-4 py-3">Study / Description</th>
                                            <th className="px-4 py-3">Accession / UID</th>
                                            <th className="px-4 py-3">Series / Imgs</th>
                                            <th className="px-4 py-3">Date & Time</th>
                                            <th className="px-4 py-3">Storage Status</th>
                                            <th className="px-4 py-3 text-right">Diagnostic Viewer</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {pacsStudiesData.map((pacsStudy) => (
                                            <tr key={pacsStudy.id} className="hover:bg-gray-50/70 transition">
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                        pacsStudy.modality === 'CT'
                                                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                            : pacsStudy.modality === 'MR'
                                                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                                            : 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                                                    }`}>
                                                        {pacsStudy.modality}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{pacsStudy.patientName}</p>
                                                        <p className="text-[11px] font-mono text-gray-500">
                                                            MRN: {pacsStudy.patientMRN}
                                                            {pacsStudy.patientSex && ` • ${pacsStudy.patientSex}`}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="text-gray-900 font-medium text-xs">{pacsStudy.studyDescription}</p>
                                                        <p className="text-[10px] text-gray-400">{pacsStudy.institutionName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 font-mono text-[11px] text-gray-600">
                                                    <p className="font-semibold text-teal-800">{pacsStudy.accessionNumber}</p>
                                                    <p className="text-[10px] text-gray-400 truncate max-w-[150px]" title={pacsStudy.studyInstanceUid}>
                                                        {pacsStudy.studyInstanceUid}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span className="text-xs font-semibold text-gray-800">
                                                        {pacsStudy.seriesCount} ser • {pacsStudy.instanceCount} img
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500">
                                                    {pacsStudy.studyDate} {pacsStudy.studyTime?.substring(0, 5)}
                                                </td>
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                                                        {pacsStudy.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleLaunchDicomViewer(pacsStudy)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition shadow-xs inline-flex items-center gap-1.5"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Launch Viewer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <RadiologyStudyDetailsModal
                study={selectedStudyForDetails}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onOpenReportEntry={(study) => {
                    setSelectedStudyForReport(study);
                    setIsReportEntryOpen(true);
                }}
                onAdvanceStatus={handleAdvanceStatus}
                onAcknowledgeCriticalFinding={handleAcknowledgeFinding}
            />

            <RadiologyReportEntryModal
                study={selectedStudyForReport}
                isOpen={isReportEntryOpen}
                onClose={() => setIsReportEntryOpen(false)}
                onSubmitReport={handleSubmitReport}
            />

            <NewRadiologyOrderModal
                isOpen={isNewOrderOpen}
                onClose={() => setIsNewOrderOpen(false)}
                onSubmit={handleCreateStudy}
            />

            <PacsUploadModal
                isOpen={isPacsUploadOpen}
                onClose={() => setIsPacsUploadOpen(false)}
                onUploadSuccess={() => {
                    refetchPacsStudies();
                    refetch();
                }}
            />

            <PacsServerManagerModal
                isOpen={isPacsManagerOpen}
                onClose={() => setIsPacsManagerOpen(false)}
            />

            {/* Diagnostic DICOM Viewer Fullscreen Modal */}
            {isDicomViewerModalOpen && selectedDicomStudyForViewer && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-950 rounded-2xl border border-neutral-800 w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Viewer Modal Titlebar */}
                        <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                                    <Film className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-neutral-100">
                                            Diagnostic DICOM PACS Viewer
                                        </span>
                                        <span className="text-xs bg-teal-900/60 text-teal-300 font-mono font-semibold px-2 py-0.5 rounded border border-teal-700/50">
                                            {selectedDicomStudyForViewer.accessionNumber}
                                        </span>
                                        <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                                            {selectedDicomStudyForViewer.modality}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">
                                        {selectedDicomStudyForViewer.patientName} • MRN: {selectedDicomStudyForViewer.patientMRN} • {selectedDicomStudyForViewer.studyDescription}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsDicomViewerModalOpen(false);
                                        setSelectedDicomStudyForViewer(null);
                                    }}
                                    className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition flex items-center gap-1 text-xs"
                                >
                                    <X className="h-5 w-5" />
                                    <span className="hidden sm:inline">Close</span>
                                </button>
                            </div>
                        </div>

                        {/* Viewer Canvas Component */}
                        <div className="flex-1 overflow-hidden">
                            <DicomViewer study={selectedDicomStudyForViewer} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
