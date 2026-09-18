import React, { useState } from 'react';
import {
    X,
    Save,
    User,
    Award,
    Building2,
    DollarSign,
    CreditCard,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import {
    StaffMember,
    StaffDepartment,
    EmploymentType,
    ProfessionalCouncil,
} from '../../types/staffPayrollTypes';

interface StaffEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffMember | null;
    onSave: (savedStaff: StaffMember) => void;
}

const DEPARTMENTS: StaffDepartment[] = [
    'Emergency & Casualty (A&E)',
    'Internal Medicine',
    'General Surgery & Theatre',
    'Pediatrics & Child Health',
    'Obstetrics & Gynaecology',
    'Critical Care (ICU / HDU)',
    'Pharmacy & Therapeutics',
    'Laboratory & Pathology',
    'Radiology & Medical Imaging',
    'Nursing Services',
    'Outpatient Clinics (OPD)',
    'Finance, Billing & Cashier',
    'Hospital Administration & HR',
];

const EMPLOYMENT_TYPES: EmploymentType[] = [
    'Permanent & Pensionable',
    'Fixed-Term Contract',
    'Locum / Casual',
    'Visiting Consultant',
];

const COUNCILS: ProfessionalCouncil[] = [
    'MD_COUNCIL',
    'NURSING_BOARD',
    'PPB',
    'LAB_BOARD',
    'COC',
    'RAD_BOARD',
    'None / Administrative',
];

export const StaffEditModal: React.FC<StaffEditModalProps> = ({
    isOpen,
    onClose,
    staff,
    onSave,
}) => {
    const isNew = !staff;

    const [formData, setFormData] = useState<StaffMember>(
        staff || {
            id: `st-${Date.now().toString().slice(-4)}`,
            employeeNumber: `STJ-EMP-0${Math.floor(100 + Math.random() * 900)}`,
            firstName: '',
            lastName: '',
            gender: 'Female',
            dateOfBirth: '1990-01-01',
            nationalId: '',
            email: '',
            phone: '+1 ',
            address: 'New York, USA',
            department: 'Nursing Services',
            jobTitle: 'Staff Registered Nurse',
            employmentType: 'Permanent & Pensionable',
            dateOfJoining: new Date().toISOString().split('T')[0],
            status: 'Active',
            professionalCouncil: 'NURSING_BOARD',
            licenseNumber: 'NURSING_BOARD/RN/2022/',
            licenseExpiryDate: '2027-12-31',
            retentionStatus: 'Valid & Active',
            kraPin: 'A00',
            nssfNumber: '',
            healthInsuranceNumber: 'SHIF-',
            paymentMethod: 'Bank Transfer',
            bankName: 'Global Standard Bank',
            bankBranch: 'Upper Hill Branch',
            bankAccountNumber: '',
            mpesaNumber: '254',
            compensation: {
                basicSalary: 95000,
                houseAllowance: 25000,
                commuterAllowance: 8000,
                medicalAllowance: 6000,
                callDutyAllowance: 10000,
                riskAllowance: 10000,
                overtimeHours: 0,
                overtimeRatePerHour: 800,
                saccoDeduction: 5000,
                saccoName: 'Afya SACCO',
                staffLoanDeduction: 0,
                voluntaryPensionPercent: 4.0,
                benevolentFund: 500,
                otherDeductions: 0,
            },
        }
    );

    const [activeSection, setActiveSection] = useState<'profile' | 'credentialing' | 'compensation' | 'banking'>('profile');

    if (!isOpen) return null;

    const handleChange = (field: keyof StaffMember, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleCompChange = (field: keyof StaffMember['compensation'], value: any) => {
        setFormData({
            ...formData,
            compensation: {
                ...formData.compensation,
                [field]: value === '' ? 0 : Number(value),
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                {isNew ? 'Enroll New Hospital Staff Member' : `Edit Profile: ${formData.firstName} ${formData.lastName}`}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">
                                Staff ID: {formData.employeeNumber} • {formData.department}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub Navigation */}
                <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveSection('profile')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeSection === 'profile'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        1. Personal & Role
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('credentialing')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeSection === 'credentialing'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        2. Council License & KRA PIN
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('compensation')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeSection === 'compensation'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        3. Monthly Pay Package (KES)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('banking')}
                        className={`py-3 border-b-2 transition-colors ${
                            activeSection === 'banking'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        4. Bank / Digital Wallet Account
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
                        {/* SECTION 1: PERSONAL & ROLE */}
                        {activeSection === 'profile' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => handleChange('firstName', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        >
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Hospital Department *</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => handleChange('department', e.target.value as StaffDepartment)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:bg-white"
                                        >
                                            {DEPARTMENTS.map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Job Title / Designation *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.jobTitle}
                                            onChange={(e) => handleChange('jobTitle', e.target.value)}
                                            placeholder="e.g. Senior Medical Officer"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Employment Terms</label>
                                        <select
                                            value={formData.employmentType}
                                            onChange={(e) => handleChange('employmentType', e.target.value as EmploymentType)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        >
                                            {EMPLOYMENT_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">National ID No *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nationalId}
                                            onChange={(e) => handleChange('nationalId', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Official Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 2: CREDENTIALING & KRA PIN */}
                        {activeSection === 'credentialing' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center gap-2">
                                    <Award className="w-4 h-4 text-teal-700 shrink-0" />
                                    <span>Medical council licensing enables clinical e-prescribing, surgery sign-offs, and LIS verification authority.</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Professional Licensing Council</label>
                                        <select
                                            value={formData.professionalCouncil}
                                            onChange={(e) => handleChange('professionalCouncil', e.target.value as ProfessionalCouncil)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:bg-white"
                                        >
                                            {COUNCILS.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Council License / Reg No</label>
                                        <input
                                            type="text"
                                            value={formData.licenseNumber}
                                            onChange={(e) => handleChange('licenseNumber', e.target.value)}
                                            placeholder="e.g. MD_COUNCIL/2018/A49102"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">License Expiry Date</label>
                                        <input
                                            type="date"
                                            value={formData.licenseExpiryDate}
                                            onChange={(e) => handleChange('licenseExpiryDate', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pt-3 border-t border-slate-200">
                                    Statutory Identifiers (Tax ID, Social Security)
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">KRA PIN Number *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="A012345678Z"
                                            value={formData.kraPin}
                                            onChange={(e) => handleChange('kraPin', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NSSF Member Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nssfNumber}
                                            onChange={(e) => handleChange('nssfNumber', e.target.value)}
                                            placeholder="e.g. 10928472"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">SHIF (Social Health) No *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.healthInsuranceNumber}
                                            onChange={(e) => handleChange('healthInsuranceNumber', e.target.value)}
                                            placeholder="e.g. SHIF-7820194"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: COMPENSATION */}
                        {activeSection === 'compensation' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs">
                                    Specify the monthly earnings package and voluntary deductions. Statutory deductions (PAYE, NSSF, SHIF, AHL) will be automatically computed based on Kenyan tax law.
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Basic Monthly Pay (KES) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.compensation.basicSalary}
                                            onChange={(e) => handleCompChange('basicSalary', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-teal-800 focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">House Allowance (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.houseAllowance}
                                            onChange={(e) => handleCompChange('houseAllowance', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Commuter Allowance (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.commuterAllowance}
                                            onChange={(e) => handleCompChange('commuterAllowance', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Medical Allowance (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.medicalAllowance}
                                            onChange={(e) => handleCompChange('medicalAllowance', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Doctor Call Duty Allowance (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.callDutyAllowance}
                                            onChange={(e) => handleCompChange('callDutyAllowance', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Risk Allowance (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.riskAllowance}
                                            onChange={(e) => handleCompChange('riskAllowance', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pt-3 border-t border-slate-200">
                                    Voluntary Monthly Deductions (SACCO & Loan Check-offs)
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">SACCO Deduction (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.saccoDeduction}
                                            onChange={(e) => handleCompChange('saccoDeduction', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">SACCO Society Name</label>
                                        <input
                                            type="text"
                                            value={formData.compensation.saccoName || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                compensation: { ...formData.compensation, saccoName: e.target.value }
                                            })}
                                            placeholder="e.g. Afya SACCO, Harambee SACCO"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Staff Loan Check-off (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.compensation.staffLoanDeduction}
                                            onChange={(e) => handleCompChange('staffLoanDeduction', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 4: BANKING */}
                        {activeSection === 'banking' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Disbursement Method</label>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:bg-white"
                                        >
                                            <option value="Bank Transfer">Bank Electronic Funds Transfer (EFT/RTGS)</option>
                                            <option value="Mobile Money Bulk B2C">Digital Wallet (e.g., PayPal, Venmo) Bulk Salary</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Digital Wallet Number</label>
                                        <input
                                            type="text"
                                            value={formData.mpesaNumber}
                                            onChange={(e) => handleChange('mpesaNumber', e.target.value)}
                                            placeholder="2547XXXXXXXX"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Commercial Bank</label>
                                        <input
                                            type="text"
                                            value={formData.bankName}
                                            onChange={(e) => handleChange('bankName', e.target.value)}
                                            placeholder="e.g. Global Standard Bank"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Branch</label>
                                        <input
                                            type="text"
                                            value={formData.bankBranch}
                                            onChange={(e) => handleChange('bankBranch', e.target.value)}
                                            placeholder="e.g. Moi Avenue Branch"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={formData.bankAccountNumber}
                                            onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                                            placeholder="e.g. 1109284719"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Staff Profile</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
