import {
    PortalUserAccount,
    PortalAppointmentBooking,
    PortalSecureMessage,
    PortalRefillRequest,
    PortalEngagementStats,
    PortalAppointmentStatus,
    PortalRefillStatus,
    PortalMessageStatus,
} from '../packages/shared/types';

const INITIAL_PORTAL_USERS: PortalUserAccount[] = [
    {
        id: 'usr_001',
        patientId: 'pat_001',
        patientMrn: 'MRN-10023',
        patientName: 'Eleanor Vance',
        email: 'eleanor.vance@example.com',
        phone: '+1 (555) 234-5678',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        status: 'Active',
        mfaEnabled: true,
        lastLoginAt: '2026-09-10T08:15:00.000Z',
        registeredAt: '2026-01-15T10:00:00.000Z',
    },
    {
        id: 'usr_002',
        patientId: 'pat_002',
        patientMrn: 'MRN-10045',
        patientName: 'Marcus Brody',
        email: 'marcus.brody@example.com',
        phone: '+1 (555) 876-5432',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        status: 'Active',
        mfaEnabled: true,
        lastLoginAt: '2026-09-09T17:40:00.000Z',
        registeredAt: '2026-02-20T11:30:00.000Z',
    },
    {
        id: 'usr_003',
        patientId: 'pat_003',
        patientMrn: 'MRN-10088',
        patientName: 'Sophia Martinez',
        email: 'sophia.martinez@example.com',
        phone: '+1 (555) 345-6789',
        tenantId: 'tnt_002',
        tenantName: "Mercy Children's Clinic",
        status: 'Active',
        mfaEnabled: false,
        lastLoginAt: '2026-09-08T14:20:00.000Z',
        registeredAt: '2026-03-05T09:15:00.000Z',
    },
    {
        id: 'usr_004',
        patientId: 'pat_004',
        patientMrn: 'MRN-10012',
        patientName: 'David Chen',
        email: 'david.chen@example.com',
        phone: '+1 (555) 901-2345',
        tenantId: 'tnt_003',
        tenantName: 'Northwest Community Medical',
        status: 'Pending Verification',
        mfaEnabled: false,
        registeredAt: '2026-09-07T16:00:00.000Z',
    },
    {
        id: 'usr_005',
        patientId: 'pat_005',
        patientMrn: 'MRN-10067',
        patientName: 'Amara Okafor',
        email: 'amara.okafor@example.com',
        phone: '+1 (555) 678-1234',
        tenantId: 'tnt_004',
        tenantName: 'Apex Orthopedic Institute',
        status: 'Active',
        mfaEnabled: true,
        lastLoginAt: '2026-09-10T07:10:00.000Z',
        registeredAt: '2026-04-12T13:45:00.000Z',
    },
];

const INITIAL_PORTAL_APPOINTMENTS: PortalAppointmentBooking[] = [
    {
        id: 'app_001',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMrn: 'MRN-10023',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        providerName: 'Dr. Sarah Jenkins, MD',
        specialty: 'Cardiology',
        appointmentType: 'In-Person Consultation',
        requestedDate: '2026-09-14',
        requestedTimeSlot: '10:30 AM',
        reasonForVisit: 'Annual post-stent cardiac evaluation and routine blood pressure check.',
        status: 'Confirmed',
        createdAt: '2026-09-08T09:20:00.000Z',
        notes: 'Bring current daily blood pressure logbook.',
    },
    {
        id: 'app_002',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMrn: 'MRN-10045',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        providerName: 'Dr. Christopher Bell, MD',
        specialty: 'Internal Medicine',
        appointmentType: 'Video Telemedicine',
        requestedDate: '2026-09-15',
        requestedTimeSlot: '02:00 PM',
        reasonForVisit: 'Follow-up on recent lipid panel results and dosage adjustment.',
        status: 'Pending Approval',
        createdAt: '2026-09-09T15:10:00.000Z',
        notes: 'Patient requested secure video session link.',
    },
    {
        id: 'app_003',
        patientId: 'pat_005',
        patientName: 'Amara Okafor',
        patientMrn: 'MRN-10067',
        tenantId: 'tnt_004',
        tenantName: 'Apex Orthopedic Institute',
        providerName: 'Dr. Julian Thorne, MD',
        specialty: 'Orthopedic Surgery',
        appointmentType: 'In-Person Consultation',
        requestedDate: '2026-09-16',
        requestedTimeSlot: '11:15 AM',
        reasonForVisit: '6-week post-op arthroscopic knee rehab progression assessment.',
        status: 'Confirmed',
        createdAt: '2026-09-07T11:00:00.000Z',
    },
];

const INITIAL_PORTAL_MESSAGES: PortalSecureMessage[] = [
    {
        id: 'msg_001',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMrn: 'MRN-10023',
        providerId: 'prv_001',
        providerName: 'Dr. Sarah Jenkins, MD',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        subject: 'Question regarding morning dizziness with Lisinopril',
        category: 'General Medical Question',
        priority: 'Routine',
        status: 'Unread',
        lastMessageAt: '2026-09-10T08:30:00.000Z',
        thread: [
            {
                id: 'th_01',
                sender: 'patient',
                senderName: 'Eleanor Vance',
                content: 'Good morning Dr. Jenkins, I noticed mild lightheadedness when standing up quickly over the last two mornings after taking the 20mg Lisinopril. Should I check my blood pressure before taking it?',
                timestamp: '2026-09-10T08:30:00.000Z',
            },
        ],
    },
    {
        id: 'msg_002',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMrn: 'MRN-10045',
        providerId: 'prv_002',
        providerName: 'Dr. Christopher Bell, MD',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        subject: 'Recent Comprehensive Metabolic Panel results query',
        category: 'Lab Result Clarification',
        priority: 'Routine',
        status: 'Replied',
        lastMessageAt: '2026-09-09T18:00:00.000Z',
        thread: [
            {
                id: 'th_02',
                sender: 'patient',
                senderName: 'Marcus Brody',
                content: 'Hello Dr. Bell, I saw my potassium was 4.8 mEq/L on the portal lab report. Is that in the safe normal target?',
                timestamp: '2026-09-09T16:20:00.000Z',
            },
            {
                id: 'th_03',
                sender: 'provider',
                senderName: 'Dr. Christopher Bell, MD',
                content: 'Hi Marcus, yes, 4.8 mEq/L is completely normal (the standard reference range is 3.5 - 5.0 mEq/L). Your kidney function markers look excellent. Keep up the good hydration.',
                timestamp: '2026-09-09T18:00:00.000Z',
            },
        ],
    },
    {
        id: 'msg_003',
        patientId: 'pat_005',
        patientName: 'Amara Okafor',
        patientMrn: 'MRN-10067',
        providerId: 'prv_003',
        providerName: 'Dr. Julian Thorne, MD',
        tenantId: 'tnt_004',
        tenantName: 'Apex Orthopedic Institute',
        subject: 'Physical therapy clearance form signed',
        category: 'Appointment Inquiry',
        priority: 'Routine',
        status: 'Resolved',
        lastMessageAt: '2026-09-08T11:45:00.000Z',
        thread: [
            {
                id: 'th_04',
                sender: 'patient',
                senderName: 'Amara Okafor',
                content: 'Could you please sign the clearance slip so I can increase my resistance band exercises with my physical therapist?',
                timestamp: '2026-09-08T09:30:00.000Z',
            },
            {
                id: 'th_05',
                sender: 'provider',
                senderName: 'Dr. Julian Thorne, MD',
                content: 'Slip has been signed electronically and faxed to your PT clinic. You are clear for progressive resistance exercises up to 15 lbs.',
                timestamp: '2026-09-08T11:45:00.000Z',
            },
        ],
    },
];

const INITIAL_PORTAL_REFILLS: PortalRefillRequest[] = [
    {
        id: 'ref_001',
        patientId: 'pat_001',
        patientName: 'Eleanor Vance',
        patientMrn: 'MRN-10023',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        medicationName: 'Atorvastatin Calcium',
        dosage: '40mg Oral Tablet (90-day supply)',
        preferredPharmacy: 'CVS Pharmacy #4921 (Main St)',
        requestDate: '2026-09-09T14:10:00.000Z',
        status: 'Pending Review',
        notes: 'Refill requested via patient mobile portal. 5 days remaining in bottle.',
    },
    {
        id: 'ref_002',
        patientId: 'pat_002',
        patientName: 'Marcus Brody',
        patientMrn: 'MRN-10045',
        tenantId: 'tnt_001',
        tenantName: 'St. Jude General Hospital',
        medicationName: 'Metformin Hydrochloride',
        dosage: '1000mg Extended Release',
        preferredPharmacy: 'Walgreens #1029 (Broadway Ave)',
        requestDate: '2026-09-07T11:00:00.000Z',
        status: 'Approved & Sent',
        reviewedBy: 'Dr. Christopher Bell, MD',
        notes: 'Transmitted electronically to Walgreens with 3 authorized refills.',
    },
];

const PORTAL_USERS_KEY = 'raphamis_portal_users_v1';
const PORTAL_APPOINTMENTS_KEY = 'raphamis_portal_appointments_v1';
const PORTAL_MESSAGES_KEY = 'raphamis_portal_messages_v1';
const PORTAL_REFILLS_KEY = 'raphamis_portal_refills_v1';

export const getStoredPortalUsers = (): PortalUserAccount[] => {
    try {
        const stored = localStorage.getItem(PORTAL_USERS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(PORTAL_USERS_KEY, JSON.stringify(INITIAL_PORTAL_USERS));
    } catch {}
    return INITIAL_PORTAL_USERS;
};

export const saveStoredPortalUsers = (users: PortalUserAccount[]) => {
    try {
        localStorage.setItem(PORTAL_USERS_KEY, JSON.stringify(users));
    } catch {}
};

export const getStoredPortalAppointments = (): PortalAppointmentBooking[] => {
    try {
        const stored = localStorage.getItem(PORTAL_APPOINTMENTS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(PORTAL_APPOINTMENTS_KEY, JSON.stringify(INITIAL_PORTAL_APPOINTMENTS));
    } catch {}
    return INITIAL_PORTAL_APPOINTMENTS;
};

export const saveStoredPortalAppointments = (apps: PortalAppointmentBooking[]) => {
    try {
        localStorage.setItem(PORTAL_APPOINTMENTS_KEY, JSON.stringify(apps));
    } catch {}
};

export const getStoredPortalMessages = (): PortalSecureMessage[] => {
    try {
        const stored = localStorage.getItem(PORTAL_MESSAGES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(PORTAL_MESSAGES_KEY, JSON.stringify(INITIAL_PORTAL_MESSAGES));
    } catch {}
    return INITIAL_PORTAL_MESSAGES;
};

export const saveStoredPortalMessages = (msgs: PortalSecureMessage[]) => {
    try {
        localStorage.setItem(PORTAL_MESSAGES_KEY, JSON.stringify(msgs));
    } catch {}
};

export const getStoredPortalRefills = (): PortalRefillRequest[] => {
    try {
        const stored = localStorage.getItem(PORTAL_REFILLS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    try {
        localStorage.setItem(PORTAL_REFILLS_KEY, JSON.stringify(INITIAL_PORTAL_REFILLS));
    } catch {}
    return INITIAL_PORTAL_REFILLS;
};

export const saveStoredPortalRefills = (refills: PortalRefillRequest[]) => {
    try {
        localStorage.setItem(PORTAL_REFILLS_KEY, JSON.stringify(refills));
    } catch {}
};

// API: Get Portal Accounts
export const getPortalUsers = async (filters?: {
    tenantId?: string;
    search?: string;
}): Promise<PortalUserAccount[]> => {
    await new Promise((r) => setTimeout(r, 40));
    let users = getStoredPortalUsers();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        users = users.filter((u) => u.tenantId === filters.tenantId);
    }

    if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        users = users.filter(
            (u) =>
                u.patientName.toLowerCase().includes(q) ||
                u.patientMrn.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.phone.includes(q)
        );
    }

    return users;
};

// API: Get Portal Appointments
export const getPortalAppointments = async (filters?: {
    tenantId?: string;
    patientId?: string;
    status?: string;
}): Promise<PortalAppointmentBooking[]> => {
    await new Promise((r) => setTimeout(r, 40));
    let apps = getStoredPortalAppointments();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        apps = apps.filter((a) => a.tenantId === filters.tenantId);
    }
    if (filters?.patientId) {
        apps = apps.filter((a) => a.patientId === filters.patientId);
    }
    if (filters?.status && filters.status !== 'ALL') {
        apps = apps.filter((a) => a.status === filters.status);
    }

    return apps;
};

// API: Create new portal appointment booking
export const bookPortalAppointment = async (
    payload: Partial<PortalAppointmentBooking>
): Promise<PortalAppointmentBooking> => {
    const apps = getStoredPortalAppointments();
    const newBooking: PortalAppointmentBooking = {
        id: `app_${Date.now()}`,
        patientId: payload.patientId || 'pat_001',
        patientName: payload.patientName || 'Eleanor Vance',
        patientMrn: payload.patientMrn || 'MRN-10023',
        tenantId: payload.tenantId || 'tnt_001',
        tenantName: payload.tenantName || 'St. Jude General Hospital',
        providerName: payload.providerName || 'Dr. Sarah Jenkins, MD',
        specialty: payload.specialty || 'General Practice',
        appointmentType: payload.appointmentType || 'In-Person Consultation',
        requestedDate: payload.requestedDate || '2026-09-20',
        requestedTimeSlot: payload.requestedTimeSlot || '10:00 AM',
        reasonForVisit: payload.reasonForVisit || 'Routine consultation',
        status: payload.status || 'Confirmed',
        createdAt: new Date().toISOString(),
        notes: payload.notes,
    };

    const updated = [newBooking, ...apps];
    saveStoredPortalAppointments(updated);
    return newBooking;
};

// API: Update appointment booking status (Confirm / Cancel)
export const updatePortalAppointmentStatus = async (
    id: string,
    status: PortalAppointmentStatus
): Promise<PortalAppointmentBooking> => {
    const apps = getStoredPortalAppointments();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');

    apps[idx] = {
        ...apps[idx],
        status,
    };
    saveStoredPortalAppointments(apps);
    return apps[idx];
};

// API: Get Portal Messages
export const getPortalMessages = async (filters?: {
    tenantId?: string;
    patientId?: string;
}): Promise<PortalSecureMessage[]> => {
    await new Promise((r) => setTimeout(r, 40));
    let msgs = getStoredPortalMessages();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        msgs = msgs.filter((m) => m.tenantId === filters.tenantId);
    }
    if (filters?.patientId) {
        msgs = msgs.filter((m) => m.patientId === filters.patientId);
    }

    return msgs;
};

// API: Reply or Send message
export const sendPortalMessageReply = async (
    messageId: string,
    replyContent: string,
    sender: 'patient' | 'provider',
    senderName: string
): Promise<PortalSecureMessage> => {
    const msgs = getStoredPortalMessages();
    const idx = msgs.findIndex((m) => m.id === messageId);
    if (idx === -1) throw new Error('Message thread not found');

    const threadItem = {
        id: `th_${Date.now()}`,
        sender,
        senderName,
        content: replyContent,
        timestamp: new Date().toISOString(),
    };

    msgs[idx] = {
        ...msgs[idx],
        status: sender === 'provider' ? 'Replied' : 'Unread',
        lastMessageAt: new Date().toISOString(),
        thread: [...msgs[idx].thread, threadItem],
    };

    saveStoredPortalMessages(msgs);
    return msgs[idx];
};

// API: Create new secure message thread
export const createPortalMessageThread = async (payload: {
    patientId: string;
    patientName: string;
    patientMrn: string;
    providerName: string;
    tenantId: string;
    tenantName: string;
    subject: string;
    category: any;
    priority: 'Routine' | 'Urgent';
    initialMessage: string;
}): Promise<PortalSecureMessage> => {
    const msgs = getStoredPortalMessages();
    const newThread: PortalSecureMessage = {
        id: `msg_${Date.now()}`,
        patientId: payload.patientId,
        patientName: payload.patientName,
        patientMrn: payload.patientMrn,
        providerName: payload.providerName,
        tenantId: payload.tenantId,
        tenantName: payload.tenantName,
        subject: payload.subject,
        category: payload.category,
        priority: payload.priority,
        status: 'Unread',
        lastMessageAt: new Date().toISOString(),
        thread: [
            {
                id: `th_${Date.now()}`,
                sender: 'patient',
                senderName: payload.patientName,
                content: payload.initialMessage,
                timestamp: new Date().toISOString(),
            },
        ],
    };

    const updated = [newThread, ...msgs];
    saveStoredPortalMessages(updated);
    return newThread;
};

// API: Get Refill Requests
export const getPortalRefills = async (filters?: {
    tenantId?: string;
    patientId?: string;
}): Promise<PortalRefillRequest[]> => {
    await new Promise((r) => setTimeout(r, 40));
    let refills = getStoredPortalRefills();

    if (filters?.tenantId && filters.tenantId !== 'ALL') {
        refills = refills.filter((r) => r.tenantId === filters.tenantId);
    }
    if (filters?.patientId) {
        refills = refills.filter((r) => r.patientId === filters.patientId);
    }

    return refills;
};

// API: Create Refill Request
export const createPortalRefill = async (
    payload: Partial<PortalRefillRequest>
): Promise<PortalRefillRequest> => {
    const refills = getStoredPortalRefills();
    const newRefill: PortalRefillRequest = {
        id: `ref_${Date.now()}`,
        patientId: payload.patientId || 'pat_001',
        patientName: payload.patientName || 'Eleanor Vance',
        patientMrn: payload.patientMrn || 'MRN-10023',
        tenantId: payload.tenantId || 'tnt_001',
        tenantName: payload.tenantName || 'St. Jude General Hospital',
        medicationName: payload.medicationName || 'Amlodipine 5mg',
        dosage: payload.dosage || '1 tablet daily',
        preferredPharmacy: payload.preferredPharmacy || 'Local Community Pharmacy',
        requestDate: new Date().toISOString(),
        status: 'Pending Review',
        notes: payload.notes,
    };

    const updated = [newRefill, ...refills];
    saveStoredPortalRefills(updated);
    return newRefill;
};

// API: Update Refill Request Status (Approve / Deny)
export const updatePortalRefillStatus = async (
    id: string,
    status: PortalRefillStatus,
    reviewedBy: string
): Promise<PortalRefillRequest> => {
    const refills = getStoredPortalRefills();
    const idx = refills.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Refill request not found');

    refills[idx] = {
        ...refills[idx],
        status,
        reviewedBy,
    };

    saveStoredPortalRefills(refills);
    return refills[idx];
};

// API: Invite Patient to Portal
export const invitePatientToPortal = async (payload: {
    patientId: string;
    patientMrn: string;
    patientName: string;
    email: string;
    phone: string;
    tenantId: string;
    tenantName: string;
}): Promise<PortalUserAccount> => {
    const users = getStoredPortalUsers();
    const newAccount: PortalUserAccount = {
        id: `usr_${Date.now()}`,
        patientId: payload.patientId,
        patientMrn: payload.patientMrn,
        patientName: payload.patientName,
        email: payload.email,
        phone: payload.phone,
        tenantId: payload.tenantId,
        tenantName: payload.tenantName,
        status: 'Active',
        mfaEnabled: true,
        registeredAt: new Date().toISOString(),
    };

    const updated = [newAccount, ...users];
    saveStoredPortalUsers(updated);
    return newAccount;
};

// API: Get Stats
export const getPortalStats = async (tenantId?: string): Promise<PortalEngagementStats> => {
    let users = getStoredPortalUsers();
    let appointments = getStoredPortalAppointments();
    let messages = getStoredPortalMessages();
    let refills = getStoredPortalRefills();

    if (tenantId && tenantId !== 'ALL') {
        users = users.filter((u) => u.tenantId === tenantId);
        appointments = appointments.filter((a) => a.tenantId === tenantId);
        messages = messages.filter((m) => m.tenantId === tenantId);
        refills = refills.filter((r) => r.tenantId === tenantId);
    }

    const activePortalUsers = users.filter((u) => u.status === 'Active').length;
    const onlineAppointmentsBooked = appointments.length;
    const secureMessagesCount = messages.length;
    const pendingRefillRequests = refills.filter((r) => r.status === 'Pending Review').length;

    return {
        activePortalUsers: activePortalUsers || 2150,
        onlineAppointmentsBooked: onlineAppointmentsBooked || 890,
        secureMessagesCount: secureMessagesCount || 1230,
        pendingRefillRequests: pendingRefillRequests || 14,
        onlinePaymentsTotal: 48920,
    };
};
