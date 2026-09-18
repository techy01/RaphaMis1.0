/**
 * Official Legal Policies & SaaS Terms of Service
 * Proprietor & Operator: Saaslink Technologies Ltd
 * Platform: RaphaMIS (Hospital Management Information System)
 */

export interface LegalDocument {
    id: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa';
    title: string;
    subtitle: string;
    lastUpdated: string;
    sections: {
        heading: string;
        content: string[];
    }[];
}

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
    terms: {
        id: 'terms',
        title: 'Master SaaS Terms of Service & Subscription Agreement',
        subtitle: 'Binding Legal Contract between Customer/Tenant and Saaslink Technologies Ltd',
        lastUpdated: 'September 1, 2026 (Version 4.2)',
        sections: [
            {
                heading: '1. Identification of Parties & Acceptance of Agreement',
                content: [
                    'This Master Software-as-a-Service Agreement ("Agreement" or "Terms") is entered into by and between Saaslink Technologies Ltd, an incorporated enterprise technology corporation ("Saaslink Technologies Ltd", "Licensor", "Company", "We", "Us", or "Our"), and the subscribing healthcare facility, hospital network, clinic, medical practitioner group, or enterprise organization ("Subscriber", "Customer", "Hospital Tenant", or "You").',
                    'By registering an account, executing an enterprise order form, accessing, deploying, or utilizing the RaphaMIS platform, software, APIs, database architectures, or associated modules, You acknowledge that You have read, understood, and irrevocably agree to be bound by these Terms. If You are acting on behalf of a hospital, healthcare institution, or legal entity, You represent and warrant that You possess full corporate and statutory authority to bind that entity to this Agreement.'
                ]
            },
            {
                heading: '2. Clinical Practice & Medical Care Disclaimer (Zero Provider Liability)',
                content: [
                    'IMPORTANT NOTICE REGARDING CLINICAL AND MEDICAL SERVICES: RaphaMIS is strictly an administrative practice management, workflow orchestration, billing, electronic medical record (EMR) indexing, and operational facilitation software application. Saaslink Technologies Ltd IS NOT A HEALTHCARE PROVIDER, HOSPITAL, CLINICAL PRACTICE, PHARMACY, DIAGNOSTIC LABORATORY, OR MEDICAL PRACTITIONER.',
                    'The platform, its diagnostic calculators, pharmacy dosage suggestion tables, clinical templates, and AI-assistive documentation tools DO NOT provide medical advice, diagnosis, treatment plans, surgical guidance, or prescription authorizations.',
                    'The Customer, its licensed physicians, surgeons, nurses, pharmacists, and medical staff retain SOLE, EXCLUSIVE, AND UNQUALIFIED RESPONSIBILITY for all patient diagnoses, therapeutic interventions, medication prescriptions, patient triage decisions, and all clinical outcomes. Under no circumstances shall Saaslink Technologies Ltd, its officers, software engineers, or affiliates be held liable for any medical error, diagnostic omission, prescription mistake, surgical complication, bodily injury, personal injury, wrongful death, or medical malpractice arising out of or related to patient care conducted using or facilitated by RaphaMIS.'
                ]
            },
            {
                heading: '3. Scope of License & Multi-Tenant Infrastructure',
                content: [
                    'Subject to timely payment of applicable subscription licensing fees and ongoing compliance with this Agreement, Saaslink Technologies Ltd grants the Customer a non-exclusive, non-transferable, revocable, worldwide license to access and operate RaphaMIS hosted on our high-availability cloud infrastructure solely for Customer\'s internal healthcare operations.',
                    'The Customer shall not: (a) reverse engineer, decompile, or disassemble any source code, database schemas, or algorithms of RaphaMIS; (b) sublicense, lease, resell, or distribute the platform to unauthorized third parties; (c) bypass access controls or security firewalls; or (d) introduce malicious scripts, viruses, or unauthorized automated scraping bots into the infrastructure.'
                ]
            },
            {
                heading: '4. Comprehensive Limitation of Liability',
                content: [
                    'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SAASLINK TECHNOLOGIES LTD, ITS DIRECTORS, SHAREHOLDERS, EMPLOYEES, AFFILIATES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, COVER, OR CONSEQUENTIAL DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF HOSPITAL PROFITS, LOSS OF REVENUE, LOSS OF GOODWILL, LOSS OR CORRUPTION OF PATIENT RECORDS, HOSPITAL WORK STOPPAGE, CLINICAL DOWNTIME, OR COMPUTER FAILURE), REGARDLESS OF THE THEORY OF LIABILITY, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, STATUTORY DUTY, OR BREACH OF WARRANTY, EVEN IF SAASLINK TECHNOLOGIES LTD HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
                    'IN ALL CIRCUMSTANCES, THE MAXIMUM AGGREGATE FINANCIAL LIABILITY OF SAASLINK TECHNOLOGIES LTD ARISING OUT OF OR RELATING TO THIS AGREEMENT, THE RAPHAPMIS PLATFORM, OR ITS OPERATIONAL PERFORMANCE SHALL BE STRICTLY LIMITED TO THE ACTUAL NET SUBSCRIPTION FEES RECEIVED BY SAASLINK TECHNOLOGIES LTD FROM THE CUSTOMER UNDER THE RELEVANT ORDER FORM IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR USD $1,000 (ONE THOUSAND UNITED STATES DOLLARS), WHICHEVER AMOUNT IS LESS.',
                    'THE EXISTENCE OF ONE OR MORE CLAIMS WILL NOT ENLARGE OR EXTEND THIS LIMITATION. THE ALLOCATION OF RISK SET FORTH HEREIN IS AN ESSENTIAL BASIS OF THE BARGAIN BETWEEN THE PARTIES WITHOUT WHICH SAASLINK TECHNOLOGIES LTD WOULD NOT BE ABLE TO PROVIDE THE RAPHAPMIS SERVICES AT THE CURRENT COMMERCIAL RATES.'
                ]
            },
            {
                heading: '5. Third-Party Payment Gateways, Telcos & Currency Exchanges',
                content: [
                    'RaphaMIS interfaces with external third-party payment gateways, cellular mobile money networks (including Mobile Payment Gateways), merchant POS acquirers, central bank foreign exchange feeds (such as the European Central Bank and Federal Reserve / International Central Banks), and private/statutory health insurers (such as National and Private Health Insurers, Aetna, Cigna).',
                    'Saaslink Technologies Ltd exercises no operational control over external telecommunication infrastructure, cell tower outages, national bank settlement delays, insurance pre-authorization portal downtime, or API gateway maintenance performed by third parties. Saaslink Technologies Ltd EXPRESSLY DISCLAIMS ALL LIABILITY FOR ANY TRANSACTION DELAYS, FAILED CO-PAY PUSH NOTIFICATIONS, UNPROCESSED STK CALLS, OR FINANCIAL RECONCILIATION DISCREPANCIES CAUSED BY THIRD-PARTY OUTAGES OR UPSTREAM SERVICE DISRUPTIONS.'
                ]
            },
            {
                heading: '6. Customer Indemnification of Saaslink Technologies Ltd',
                content: [
                    'The Customer shall defend, indemnify, and hold harmless Saaslink Technologies Ltd, its parent company, subsidiaries, affiliates, directors, officers, agents, and employees from and against any and all claims, demands, damages, suits, liabilities, settlements, legal fees, court costs, and fines arising out of or related to: (a) any medical malpractice, clinical negligence, misdiagnosis, or treatment decision involving Customer\'s patients; (b) Customer\'s violation of patient privacy, Protected Health Information (PHI) exposure caused by Customer\'s compromised credentials or unauthorized internal staff access; (c) Customer\'s breach of any applicable healthcare statute, HIPAA standard, or Data Protection Act; or (d) unauthorized billing disputes lodged by patients or insurers regarding healthcare services rendered by Customer.'
                ]
            },
            {
                heading: '7. Service Levels, Backups & Scheduled Maintenance',
                content: [
                    'Saaslink Technologies Ltd uses enterprise-grade hosting facilities designed to deliver 99.9% platform availability, excluding scheduled maintenance windows announced at least 48 hours in advance.',
                    'While automated encrypted snapshot backups of hospital data are performed continuously, the Customer remains solely responsible for maintaining secondary organizational business continuity plans, paper emergency intake procedures, and backup clinical workflows in the event of unexpected internet disruptions at the Customer\'s local hospital premises.'
                ]
            },
            {
                heading: '8. Governing Law, Jurisdiction & Binding Arbitration',
                content: [
                    'This Agreement and any dispute, controversy, or claim arising out of or in connection with it shall be governed by, and construed in accordance with, the laws of the applicable jurisdiction and international corporate commercial standards, without giving effect to conflict of laws principles.',
                    'Any dispute between the parties that cannot be resolved amicably within thirty (30) business days through executive mediation shall be submitted to final and binding arbitration under the Rules of the Chartered Institute of Arbitrators (CIArb). The seat of arbitration shall be the primary business headquarters, conducted in the English language by a single arbitrator appointed in accordance with said Rules.'
                ]
            }
        ]
    },
    privacy: {
        id: 'privacy',
        title: 'Enterprise Privacy Policy & Health Data Protection Standard',
        subtitle: 'Commitment to HIPAA, GDPR, and General Data Protection Regulation (GDPR) Safeguards',
        lastUpdated: 'September 1, 2026 (Version 3.8)',
        sections: [
            {
                heading: '1. Executive Privacy Commitment',
                content: [
                    'Saaslink Technologies Ltd ("Saaslink", "We", "Us") respects the confidentiality and sensitivity of healthcare data. This Enterprise Privacy Policy governs how personal data, administrative telemetry, and Protected Health Information (PHI) are collected, processed, encrypted, and isolated within the RaphaMIS hospital management ecosystem.',
                    'Saaslink Technologies Ltd does not sell, rent, monetize, or disclose patient medical records, personal identity documents, or clinical diagnostics to commercial advertisers or data brokers under any circumstance.'
                ]
            },
            {
                heading: '2. Role Allocation: Data Controller vs. Data Processor',
                content: [
                    'In accordance with the General Data Protection Regulation (GDPR), GDPR, and international health data protection regimes: The subscribing Healthcare Institution (Hospital Tenant) acts as the DATA CONTROLLER with respect to all patient personal data, medical diagnoses, laboratory reports, prescriptions, and clinical notes entered into RaphaMIS.',
                    'Saaslink Technologies Ltd acts strictly as a DATA PROCESSOR (or Business Associate under HIPAA), processing such protected data solely upon the documented instructions of the Customer to provide the licensed SaaS services, perform system maintenance, and ensure infrastructure stability.'
                ]
            },
            {
                heading: '3. Technical, Physical & Administrative Safeguards',
                content: [
                    'To protect health information against unauthorized access, destruction, loss, or alteration, Saaslink Technologies Ltd implements defense-in-depth security measures:',
                    '• End-to-End Encryption: All data in transit across public and private networks is encrypted using TLS 1.3 cryptographic protocols with modern cipher suites. All stored database volumes, patient documents, and PACS DICOM images are encrypted at rest using AES-256 standards.',
                    '• Tenant Logical Isolation: Multi-tenant databases enforce strict cryptographic and tenant-ID row-level security isolation to guarantee that no healthcare institution can access or view data belonging to another subscribed facility.',
                    '• Role-Based Access Control (RBAC): Fine-grained granular access rights ensure that clinical staff (doctors, nurses, lab technicians, cashiers) only access the minimum necessary patient information required for their immediate duties.',
                    '• Immutable Audit Trails: Every patient record view, modification, lab status update, and billing transaction is permanently logged with timestamp, user ID, IP address, and workstation terminal identity.'
                ]
            },
            {
                heading: '4. Data Retention, Sovereignty & Cloud Hosting',
                content: [
                    'Customer data is stored within certified enterprise cloud tier-3 datacenters complying with ISO/IEC 27001, SOC 1, SOC 2 Type II, and local data residency statutes.',
                    'Upon termination of a hospital subscription, Saaslink Technologies Ltd provides the Customer with a 60-day migration window to export all patient records, billing ledgers, and clinical data in standardized FHIR/JSON/CSV formats. Following the expiry of this transitional window, all production data is permanently purged and sanitized in accordance with DoD 5220.22-M sanitization standards.'
                ]
            },
            {
                heading: '5. Security Incident Notification Protocols',
                content: [
                    'In the event of a confirmed security incident or unauthorized breach impacting the Customer\'s Protected Health Information, Saaslink Technologies Ltd will notify the Customer\'s designated Data Protection Officer (DPO) without undue delay, and in any event within seventy-two (72) hours of becoming aware of the breach, providing comprehensive remediation telemetry and collaborative assistance.'
                ]
            }
        ]
    },
    cookies: {
        id: 'cookies',
        title: 'Comprehensive Cookies & Telemetry Policy',
        subtitle: 'Transparency Regarding Session Persistence, Security Tokens, and Performance Telemetry',
        lastUpdated: 'September 1, 2026 (Version 2.4)',
        sections: [
            {
                heading: '1. What Are Cookies and Local Web Storage?',
                content: [
                    'This Cookies Policy explains how Saaslink Technologies Ltd utilizes browser cookies, local storage objects (HTML5 localStorage and sessionStorage), and session identifiers when you interact with the RaphaMIS web application, public landing portal, and administrative console.',
                    'Cookies are small alphanumeric text files stored on your workstation, tablet, or smartphone by your internet browser. They allow our systems to recognize your authenticated clinical session, enforce cybersecurity protections, and remember your display configurations.'
                ]
            },
            {
                heading: '2. Zero Patient Tracking Guarantee',
                content: [
                    'CRITICAL PRIVACY GUARANTEE: Saaslink Technologies Ltd DOES NOT utilize any third-party behavioral advertising cookies, ad trackers, or social media pixel trackers that monitor patient medical visits, diagnoses, or healthcare consultations. No Protected Health Information (PHI) is ever exposed, stored in, or transmitted via browser cookies.'
                ]
            },
            {
                heading: '3. Categories of Cookies Deployed by RaphaMIS',
                content: [
                    'We categorize our technical cookies into three distinct functional tiers:',
                    '• Strictly Necessary & Security Cookies (Mandatory): These cookies are essential for the operation of the portal and cannot be disabled. They include authenticated JSON Web Token (JWT) session cookies, Cross-Site Request Forgery (CSRF) tokens, tenant partition keys, and load-balancer sticky session cookies. Disabling these via your browser will render the hospital system inoperable.',
                    '• Functional & Operational Preference Cookies (Configurable): These store user interface preferences, such as selected currency display standards (USD, KES, EUR, GBP), active hospital branch selection, sidebar collapse states, and clinical ward view filters.',
                    '• Aggregated Performance & System Health Telemetry (Configurable): These collect anonymized, non-personally identifiable diagnostic telemetry regarding server response latencies, network packet errors, and browser compatibility crashes, enabling our engineering team to ensure 99.9% clinical system uptime.'
                ]
            },
            {
                heading: '4. Managing and Modifying Your Cookie Preferences',
                content: [
                    'Upon your first visit to the RaphaMIS portal, our interactive Cookie Consent banner permits you to choose whether to accept all performance cookies or restrict operation to strictly essential security cookies.',
                    'You may reconfigure or revoke your consent at any moment by clicking the "Cookie Settings" link in the footer of any RaphaMIS page. Furthermore, most modern browsers permit you to block, inspect, or delete cookies via your browser preferences (e.g., Settings > Privacy & Security > Cookies).'
                ]
            }
        ]
    },
    disclaimer: {
        id: 'disclaimer',
        title: 'Clinical Practice & Statutory Medical Disclaimer',
        subtitle: 'Legal Demarcation of Clinical Responsibility between Software and Medical Practitioners',
        lastUpdated: 'September 1, 2026 (Version 3.1)',
        sections: [
            {
                heading: '1. Primary Statutory Medical Disclaimer',
                content: [
                    'RaphaMIS IS AN ENTERPRISE INFORMATION MANAGEMENT AND HEALTHCARE ADMINISTRATIVE SOFTWARE TOOL DEVELOPED AND OPERATED BY SAASLINK TECHNOLOGIES LTD. IT DOES NOT CONSTITUTE A LICENSED MEDICAL PRACTITIONER, CLINICAL LABORATORY, RADIOLOGY SPECIALIST, OR DISPENSING PHARMACY.',
                    'All software modules—including but not limited to electronic health records (EHR), automated drug interaction warnings, laboratory reference range indicators, clinical decision support prompts, and triage prioritization algorithms—are designed solely as supplementary reference and record-keeping aids for qualified, licensed medical professionals.'
                ]
            },
            {
                heading: '2. Professional Independence of Physicians and Nurses',
                content: [
                    'Nothing contained within the RaphaMIS software, documentation, or user interfaces shall be construed as establishing a doctor-patient relationship between Saaslink Technologies Ltd and any patient treated at a subscribing hospital.',
                    'Licensed medical practitioners (physicians, nurses, clinicians, surgeons, pharmacists) must exercise their independent, qualified medical and clinical judgment when diagnosing conditions, selecting dosages, interpreting laboratory assays, reviewing DICOM imaging, and prescribing therapeutics. Medical practitioners must independently verify all drug dosages, contraindications, and clinical pathways against current official pharmacopeias and patient allergy histories.'
                ]
            },
            {
                heading: '3. Release of Liability for Clinical Outcomes',
                content: [
                    'TO THE FULLEST EXTENT ALLOWED BY LAW, SAASLINK TECHNOLOGIES LTD, ITS DIRECTORS, EMPLOYEES, AND SOFTWARE ARCHITECTS EXPLICITLY DISCLAIM ALL LIABILITY FOR ANY INJURY, ILLNESS, COMPLICATION, DISABILITY, ADVERSE DRUG EVENT, WRONGFUL DEATH, OR FINANCIAL LOSS RESULTING DIRECTLY OR INDIRECTLY FROM THE USE OF RAPHAPMIS BY HEALTHCARE PRACTITIONERS, HOSPITAL STAFF, OR PATIENTS.',
                    'The subscribing healthcare institution agrees that it shall maintain comprehensive medical malpractice and professional indemnity insurance coverage adequate to protect against all clinical risks, and shall never seek contribution or indemnity from Saaslink Technologies Ltd for any clinical malpractice claim.'
                ]
            }
        ]
    },
    baa: {
        id: 'baa',
        title: 'Business Associate Agreement (BAA) Summary & Compliance Addendum',
        subtitle: 'Statutory Health Data Protection Obligations under HIPAA, MOH & Data Protection Regulations',
        lastUpdated: 'September 1, 2026 (Version 2.9)',
        sections: [
            {
                heading: '1. Purpose and Incorporation into Master Agreement',
                content: [
                    'This Business Associate Agreement ("BAA Addendum") is entered into by Saaslink Technologies Ltd and Customer to satisfy the requirements of statutory health data privacy regulations, including the Health Insurance Portability and Accountability Act (HIPAA), Health Information Technology for Economic and Clinical Health (HITECH) Act, and the General Data Protection Regulation (GDPR).',
                    'This BAA applies whenever Saaslink Technologies Ltd creates, receives, maintains, transmits, or processes Protected Health Information (PHI) on behalf of the hospital Customer in the course of providing the RaphaMIS SaaS platform.'
                ]
            },
            {
                heading: '2. Permitted Uses and Disclosures of PHI by Saaslink',
                content: [
                    'Saaslink Technologies Ltd agrees not to use or disclose Protected Health Information other than as permitted or required by this Agreement, as authorized by the Customer in writing, or as strictly required by applicable statutory law.',
                    'Saaslink Technologies Ltd may use PHI solely: (a) for the proper management and administration of the RaphaMIS multi-tenant hosting services; (b) to carry out the legal responsibilities of Saaslink Technologies Ltd; and (c) to provide data aggregation and system performance benchmarking in an entirely de-identified format compliant with Safe Harbor de-identification standards.'
                ]
            },
            {
                heading: '3. Technical Safeguards & Subcontractors',
                content: [
                    'Saaslink Technologies Ltd agrees to implement robust administrative, physical, and technical safeguards that reasonably and appropriately protect the confidentiality, integrity, and availability of electronic Protected Health Information (ePHI).',
                    'Saaslink Technologies Ltd ensures that any subcontractors or cloud infrastructure vendors (e.g., tier-3 cloud hosting providers, database clustering facilities) who receive or have access to ePHI agree to the exact same restrictions, privacy covenants, and security safeguards that apply to Saaslink Technologies Ltd under this BAA.'
                ]
            }
        ]
    }
};
