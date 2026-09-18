import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Users,
    Search,
    Filter,
    UserPlus,
    Download,
    RefreshCw,
    HeartPulse,
    Activity,
    AlertTriangle,
    Eye,
    Edit,
    Trash2,
    Building,
    Stethoscope,
    ChevronDown,
    X,
    FileSpreadsheet,
    Check,
} from 'lucide-react';
import { getPatients, deletePatient, getPatientStats } from '../../api/patientsApi';
import { getTenants } from '../../api/tenantsApi';
import { Patient, PatientStatus } from '../../packages/shared/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Toast } from '../shared/Toast';
import { PatientDetailsModal } from '../patients/PatientDetailsModal';
import { PatientFormModal } from '../patients/PatientFormModal';
import { PatientQuickVitalsModal } from '../patients/PatientQuickVitalsModal';
import { NEWS2TriageBadge } from '../patients/NEWS2TriageBadge';

export const PatientsView: React.FC = () => {
    const queryClient = useQueryClient();

    // Query Data
    const {
        data: patientsData,
        isLoading,
        isRefetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ['patients'],
        queryFn: () => getPatients(),
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const { data: statsData } = useQuery({
        queryKey: ['patient-stats'],
        queryFn: () => getPatientStats(),
    });

    const patientList: Patient[] = Array.isArray(patientsData) ? patientsData : [];
    const tenantList = Array.isArray(tenantsData) ? tenantsData : [];

    // Filter and Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'mrn' | 'critical'>('recent');

    // Modals State
    const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const [patientForVitals, setPatientForVitals] = useState<Patient | null>(null);
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(message);
        setToastType(type);
    };

    // Calculate aggregated metrics
    const metrics = useMemo(() => {
        const total = patientList.length;
        const admitted = patientList.filter((p) => p.status === PatientStatus.Admitted).length;
        const critical = patientList.filter((p) => p.status === PatientStatus.Critical).length;
        const outpatient = patientList.filter((p) => p.status === PatientStatus.Outpatient).length;
        const inTreatment = patientList.filter((p) => p.status === PatientStatus.InTreatment).length;
        return {
            total: statsData?.totalPatients || total,
            admitted,
            critical,
            outpatient: outpatient + inTreatment,
        };
    }, [patientList, statsData]);

    // Unique departments from data
    const departments = useMemo(() => {
        const depts = new Set<string>();
        patientList.forEach((p) => {
            if (p.assignedDepartment) depts.add(p.assignedDepartment);
        });
        return Array.from(depts);
    }, [patientList]);

    // Filter and Sort Pipeline
    const filteredPatients = useMemo(() => {
        return patientList
            .filter((patient) => {
                // Search term matching
                const term = searchTerm.toLowerCase().trim();
                const matchesSearch =
                    !term ||
                    patient.name?.toLowerCase().includes(term) ||
                    patient.mrn?.toLowerCase().includes(term) ||
                    patient.phone?.toLowerCase().includes(term) ||
                    patient.email?.toLowerCase().includes(term) ||
                    patient.primaryPhysician?.toLowerCase().includes(term);

                // Tenant filter
                const matchesTenant = selectedTenant === 'ALL' || patient.tenantId === selectedTenant;

                // Status filter
                const matchesStatus = selectedStatus === 'ALL' || patient.status === selectedStatus;

                // Department filter
                const matchesDepartment =
                    selectedDepartment === 'ALL' || patient.assignedDepartment === selectedDepartment;

                return matchesSearch && matchesTenant && matchesStatus && matchesDepartment;
            })
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                }
                if (sortBy === 'mrn') {
                    return a.mrn.localeCompare(b.mrn);
                }
                if (sortBy === 'critical') {
                    if (a.status === PatientStatus.Critical && b.status !== PatientStatus.Critical) return -1;
                    if (b.status === PatientStatus.Critical && a.status !== PatientStatus.Critical) return 1;
                    return 0;
                }
                // default recent
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
    }, [patientList, searchTerm, selectedTenant, selectedStatus, selectedDepartment, sortBy]);

    // Handlers
    const handleOpenRegister = () => {
        setPatientToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (patient: Patient) => {
        setPatientToEdit(patient);
        setIsFormModalOpen(true);
    };

    const handleOpenDetails = (patient: Patient) => {
        setSelectedPatientForDetails(patient);
        setIsDetailsModalOpen(true);
    };

    const handleOpenVitals = (patient: Patient) => {
        setPatientForVitals(patient);
        setIsVitalsModalOpen(true);
    };

    const handlePatientSaved = (patient: Patient) => {
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        queryClient.invalidateQueries({ queryKey: ['patient-stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        if (selectedPatientForDetails?.id === patient.id) {
            setSelectedPatientForDetails(patient);
        }
        showToast(
            patientToEdit
                ? `Patient record for ${patient.name} updated successfully.`
                : `New patient ${patient.name} registered with MRN ${patient.mrn}.`
        );
    };

    const handlePatientUpdatedFromModal = (updated: Patient) => {
        setSelectedPatientForDetails(updated);
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        queryClient.invalidateQueries({ queryKey: ['patient-stats'] });
        showToast(`Patient EHR record updated for ${updated.name}.`);
    };

    const handleConfirmDelete = async () => {
        if (!patientToDelete) return;
        try {
            setIsDeleting(true);
            await deletePatient(patientToDelete.id);
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patient-stats'] });
            showToast(`Patient record for ${patientToDelete.name} has been removed.`, 'info');
            setPatientToDelete(null);
            if (selectedPatientForDetails?.id === patientToDelete.id) {
                setIsDetailsModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to delete patient:', err);
            showToast('Failed to delete patient record.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        if (filteredPatients.length === 0) {
            showToast('No patient records to export.', 'info');
            return;
        }

        const headers = [
            'MRN',
            'Full Name',
            'Gender',
            'DOB',
            'Blood Type',
            'Status',
            'Hospital Facility',
            'Department',
            'Primary Physician',
            'Room / Bed',
            'Phone',
            'Email',
            'Blood Pressure',
            'Heart Rate',
            'SpO2',
            'Insurance Provider',
            'Policy ID',
            'Registered Date',
        ];

        const rows = filteredPatients.map((p) => [
            p.mrn,
            `"${p.name}"`,
            p.gender,
            p.dateOfBirth,
            p.bloodType,
            p.status,
            `"${p.tenantName || ''}"`,
            `"${p.assignedDepartment || ''}"`,
            `"${p.primaryPhysician || ''}"`,
            `"${p.roomNumber || 'N/A'}"`,
            p.phone,
            p.email,
            p.vitals?.bloodPressure || '',
            p.vitals?.heartRate || '',
            p.vitals?.oxygenSaturation || '',
            `"${p.insuranceProvider || ''}"`,
            `"${p.insurancePolicyNumber || ''}"`,
            p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd') : '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `raphamis_patients_registry_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredPatients.length} patient records to CSV.`);
    };

    const calculateAge = (dob: string) => {
        try {
            const birthDate = new Date(dob);
            const ageDiff = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDiff);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        } catch {
            return 'N/A';
        }
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
                        <h2 className="text-2xl font-bold text-neutral">Patient Management & Global Registry</h2>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                            Central EHR Network
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Unified electronic health records, active inpatient admissions, clinical observations, and multi-tenant patient care.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading || isRefetching}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                        title="Refresh registry"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin text-teal-600' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition flex items-center gap-1.5"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Export Registry
                    </button>

                    <button
                        onClick={handleOpenRegister}
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                    >
                        <UserPlus className="h-4 w-4" />
                        Register New Patient
                    </button>
                </div>
            </div>

            {/* Aggregated Statistical Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Registered Patients</p>
                        <p className="text-2xl font-bold text-neutral mt-1">{metrics.total.toLocaleString()}</p>
                        <p className="text-[11px] text-teal-600 font-medium mt-1">Active across all facilities</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <Users className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Admitted Inpatients</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{metrics.admitted}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Occupying hospital beds</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Building className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Critical Monitoring</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-red-600">{metrics.critical}</p>
                            {metrics.critical > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-red-600 font-medium mt-1">ICU & Emergency care</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Outpatient / Ambulatory</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{metrics.outpatient}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Active care / clinics</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                        <Stethoscope className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Name, MRN, Doctor, Phone..."
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
                            <option value="ALL">All Hospital Facilities</option>
                            {tenantList.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full py-2 px-3 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Patient Statuses</option>
                            <option value={PatientStatus.Admitted}>Admitted</option>
                            <option value={PatientStatus.Outpatient}>Outpatient</option>
                            <option value={PatientStatus.InTreatment}>In Treatment</option>
                            <option value={PatientStatus.Critical}>Critical</option>
                            <option value={PatientStatus.Discharged}>Discharged</option>
                        </select>
                    </div>

                    {/* Department / Sort */}
                    <div className="flex gap-2">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-32 py-2 px-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                        >
                            <option value="recent">Recent</option>
                            <option value="name">Name A-Z</option>
                            <option value="mrn">MRN</option>
                            <option value="critical">Critical First</option>
                        </select>
                    </div>
                </div>

                {/* Filter tags & active result count */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div>
                        Showing <strong>{filteredPatients.length}</strong> of <strong>{patientList.length}</strong> patient EHR records
                        {(selectedTenant !== 'ALL' || selectedStatus !== 'ALL' || selectedDepartment !== 'ALL' || searchTerm) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTenant('ALL');
                                    setSelectedStatus('ALL');
                                    setSelectedDepartment('ALL');
                                }}
                                className="ml-3 text-teal-600 hover:underline font-semibold"
                            >
                                Reset all filters
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Normal vitals
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span> Critical attention
                        </span>
                    </div>
                </div>
            </div>

            {/* Patients Table (Desktop) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-5 py-3.5">Patient Details</th>
                                <th scope="col" className="px-4 py-3.5">MRN & Identifier</th>
                                <th scope="col" className="px-4 py-3.5">Hospital Facility</th>
                                <th scope="col" className="px-4 py-3.5">Department & Physician</th>
                                <th scope="col" className="px-4 py-3.5">Status & Location</th>
                                <th scope="col" className="px-4 py-3.5">Vitals Observation</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <RefreshCw className="h-5 w-5 animate-spin text-teal-600" />
                                            <span>Loading patient health records...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-red-500">
                                        Error loading patient registry. Please refresh the page.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-gray-500">
                                        <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="font-semibold text-gray-700">No matching patient records found</p>
                                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                            Try adjusting your search criteria or register a new patient in the hospital network.
                                        </p>
                                        <button
                                            onClick={handleOpenRegister}
                                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                                        >
                                            + Register New Patient
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {filteredPatients.map((patient) => {
                                const age = calculateAge(patient.dateOfBirth);
                                const isCritical = patient.status === PatientStatus.Critical;

                                return (
                                    <tr
                                        key={patient.id}
                                        className={`hover:bg-teal-50/40 transition ${
                                            isCritical ? 'bg-red-50/30' : 'bg-white'
                                        }`}
                                    >
                                        {/* Patient Identity */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-teal-200">
                                                    {patient.firstName.charAt(0)}
                                                    {patient.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => handleOpenDetails(patient)}
                                                        className="font-bold text-gray-900 hover:text-teal-700 text-left transition"
                                                    >
                                                        {patient.name}
                                                    </button>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                                        <span>{patient.gender}, {age} yrs</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-rose-600">{patient.bloodType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* MRN */}
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                                                {patient.mrn}
                                            </span>
                                        </td>

                                        {/* Facility */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1 text-gray-800 font-medium">
                                                <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                <span className="truncate max-w-[150px]" title={patient.tenantName}>
                                                    {patient.tenantName}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Department & Physician */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <span className="bg-gray-100 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-200">
                                                    {patient.assignedDepartment}
                                                </span>
                                                <div className="text-[11px] text-gray-600 mt-1 truncate max-w-[140px]" title={patient.primaryPhysician}>
                                                    {patient.primaryPhysician}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status & Location */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-1">
                                                <StatusBadge status={patient.status} size="sm" />
                                                {patient.roomNumber && (
                                                    <div className="text-[10px] text-gray-500 font-mono">
                                                        {patient.roomNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Vitals Snapshot & NEWS2 CDSS */}
                                        <td className="px-4 py-3.5">
                                            {patient.vitals ? (
                                                <div className="space-y-1.5">
                                                    {patient.vitals.news2Score !== undefined && (
                                                        <NEWS2TriageBadge
                                                            score={patient.vitals.news2Score}
                                                            riskLevel={patient.vitals.news2RiskLevel || 'Low'}
                                                            clinicalAction={patient.vitals.news2ClinicalAction}
                                                            monitoringFrequency={patient.vitals.news2MonitoringFrequency}
                                                            compact={true}
                                                        />
                                                    )}
                                                    <div className="text-[11px] space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-gray-400">BP:</span>
                                                            <span className="font-semibold text-gray-800">{patient.vitals.bloodPressure || 'N/A'}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-gray-400">HR:</span>
                                                            <span className="font-semibold text-gray-800">{patient.vitals.heartRate || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-gray-400">SpO2:</span>
                                                            <span className={`font-semibold ${patient.vitals.oxygenSaturation < 94 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                                                                {patient.vitals.oxygenSaturation}%
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-gray-400">Temp:</span>
                                                            <span className="font-semibold text-gray-800">{patient.vitals.temperature}°</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">No vitals logged</span>
                                            )}
                                        </td>

                                        {/* Action buttons */}
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleOpenDetails(patient)}
                                                    className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
                                                    title="View Full EHR Dossier"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleOpenVitals(patient)}
                                                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                                                    title="Quick Vitals Log"
                                                >
                                                    <HeartPulse className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleOpenEdit(patient)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Patient Intake"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() => setPatientToDelete(patient)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="block md:hidden divide-y divide-gray-100">
                    {filteredPatients.map((patient) => {
                        const age = calculateAge(patient.dateOfBirth);
                        return (
                            <div key={patient.id} className="p-4 space-y-3 bg-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <button
                                            onClick={() => handleOpenDetails(patient)}
                                            className="font-bold text-sm text-gray-900 hover:text-teal-600 text-left"
                                        >
                                            {patient.name}
                                        </button>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{patient.mrn}</span>
                                            <span>{patient.gender}, {age} yrs</span>
                                            <span className="font-bold text-rose-600">{patient.bloodType}</span>
                                        </div>
                                    </div>
                                    <StatusBadge status={patient.status} size="sm" />
                                </div>

                                <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <p className="flex justify-between">
                                        <span className="text-gray-400">Facility:</span>
                                        <span className="font-medium text-gray-800">{patient.tenantName}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-400">Department:</span>
                                        <span className="font-medium text-gray-800">{patient.assignedDepartment}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-400">Vitals:</span>
                                        <span className="font-semibold text-teal-700">
                                            {patient.vitals?.bloodPressure || 'N/A'} • {patient.vitals?.heartRate || 'N/A'} bpm • {patient.vitals?.oxygenSaturation || 'N/A'}% SpO2
                                        </span>
                                    </p>
                                    {patient.vitals?.news2Score !== undefined && (
                                        <div className="pt-1">
                                            <NEWS2TriageBadge
                                                score={patient.vitals.news2Score}
                                                riskLevel={patient.vitals.news2RiskLevel || 'Low'}
                                                clinicalAction={patient.vitals.news2ClinicalAction}
                                                monitoringFrequency={patient.vitals.news2MonitoringFrequency}
                                                compact={true}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        onClick={() => handleOpenDetails(patient)}
                                        className="px-3 py-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded font-semibold"
                                    >
                                        EHR Dossier
                                    </button>
                                    <button
                                        onClick={() => handleOpenVitals(patient)}
                                        className="px-3 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold"
                                    >
                                        Vitals
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(patient)}
                                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded font-semibold"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EHR Dossier Modal */}
            <PatientDetailsModal
                isOpen={isDetailsModalOpen}
                patient={selectedPatientForDetails}
                onClose={() => setIsDetailsModalOpen(false)}
                onPatientUpdated={handlePatientUpdatedFromModal}
                onEditPatient={(patient) => {
                    setIsDetailsModalOpen(false);
                    handleOpenEdit(patient);
                }}
            />

            {/* Patient Registration & Intake / Edit Modal */}
            <PatientFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                patientToEdit={patientToEdit}
                onSuccess={handlePatientSaved}
            />

            {/* Quick Vitals Modal */}
            <PatientQuickVitalsModal
                isOpen={isVitalsModalOpen}
                patient={patientForVitals}
                onClose={() => setIsVitalsModalOpen(false)}
                onVitalsSaved={(updated) => {
                    queryClient.invalidateQueries({ queryKey: ['patients'] });
                    showToast(`Updated vitals recorded for ${updated.name}.`);
                }}
            />

            {/* Delete Confirmation Modal */}
            {patientToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md w-full space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Remove Patient Record</h3>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Are you sure you want to remove <strong>{patientToDelete.name}</strong> ({patientToDelete.mrn}) from the hospital registry? This action will archive their clinical consultations, active prescriptions, and observation history.
                        </p>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                onClick={() => setPatientToDelete(null)}
                                className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                            >
                                {isDeleting ? 'Removing...' : 'Confirm Deletion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
