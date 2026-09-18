import React, { useState, useEffect } from 'react';
import { 
    X, Shield, FileText, Lock, Cookie, AlertTriangle, 
    Printer, CheckCircle2, Download, Search, Building2, ExternalLink 
} from 'lucide-react';
import { LEGAL_DOCUMENTS, LegalDocument } from './legalContent';

interface LegalPoliciesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa';
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
    isOpen,
    onClose,
    initialTab = 'terms'
}) => {
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa'>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedNotification, setCopiedNotification] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setSearchQuery('');
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const currentDoc: LegalDocument = LEGAL_DOCUMENTS[activeTab] || LEGAL_DOCUMENTS.terms;

    const filteredSections = currentDoc.sections.filter(sec => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            sec.heading.toLowerCase().includes(q) ||
            sec.content.some(c => c.toLowerCase().includes(q))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    const handleCopySummary = () => {
        const text = `${currentDoc.title}\nProprietor: Saaslink Technologies Ltd\n${currentDoc.lastUpdated}\n\n` +
            currentDoc.sections.map(s => `${s.heading}\n${s.content.join('\n')}`).join('\n\n');
        navigator.clipboard.writeText(text);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
                
                {/* Header with Enterprise Branding */}
                <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                                    Legal & Compliance Repository
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                    Saaslink Technologies Ltd
                                </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                                RaphaMIS Legal Protections & Governance
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="bg-slate-100/80 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1 sm:gap-2 py-2">
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'terms'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            Terms of Service
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'privacy'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Lock className="w-3.5 h-3.5 text-teal-600" />
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('cookies')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'cookies'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Cookie className="w-3.5 h-3.5 text-teal-600" />
                            Cookies Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('disclaimer')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'disclaimer'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Medical Disclaimer
                        </button>
                        <button
                            onClick={() => setActiveTab('baa')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'baa'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5 text-teal-600" />
                            BAA & HIPAA
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={handleCopySummary}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors flex items-center gap-1 border border-transparent hover:border-slate-200"
                            title="Copy full policy text"
                        >
                            {copiedNotification ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Copy Text</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors flex items-center gap-1 border border-transparent hover:border-slate-200"
                            title="Print this document"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Document Overview */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            {currentDoc.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {currentDoc.subtitle} • <span className="font-medium text-slate-700">{currentDoc.lastUpdated}</span>
                        </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search within policy..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Document Body */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {filteredSections.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            No clauses matched your query "{searchQuery}".
                        </div>
                    ) : (
                        filteredSections.map((sec, idx) => (
                            <div key={idx} className="space-y-2 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-teal-600 rounded-full inline-block"></span>
                                    {sec.heading}
                                </h4>
                                <div className="space-y-2 pl-3.5">
                                    {sec.content.map((paragraph, pIdx) => (
                                        <p 
                                            key={pIdx} 
                                            className={
                                                paragraph.startsWith('IMPORTANT') || 
                                                paragraph.startsWith('TO THE MAXIMUM') || 
                                                paragraph.startsWith('CRITICAL') || 
                                                paragraph.startsWith('IN ALL CIRCUMSTANCES')
                                                    ? 'p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-slate-900 font-medium text-xs leading-normal'
                                                    : 'text-slate-600 text-xs sm:text-sm leading-relaxed'
                                            }
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Disclaimer & Corporation Seal */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>
                            Owned, copyrighted, and operated by <strong className="text-slate-800">Saaslink Technologies Ltd</strong>. All rights reserved worldwide.
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                            Statutory Compliance: HIPAA • GDPR • GDPR
                        </span>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                        >
                            I Understand & Close
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
