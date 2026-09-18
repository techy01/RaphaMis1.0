import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Shield, FileText, Lock, Cookie, AlertTriangle, 
    ArrowLeft, Printer, Download, CheckCircle2, Search, Building2 
} from 'lucide-react';
import { LEGAL_DOCUMENTS, LegalDocument } from '../legal/legalContent';

interface LegalPoliciesViewProps {
    initialTab?: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa';
}

export const LegalPoliciesView: React.FC<LegalPoliciesViewProps> = ({ initialTab = 'terms' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa'>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedNotification, setCopiedNotification] = useState(false);

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

    const handleCopy = () => {
        const text = `${currentDoc.title}\nProprietor: Saaslink Technologies Ltd\n${currentDoc.lastUpdated}\n\n` +
            currentDoc.sections.map(s => `${s.heading}\n${s.content.join('\n')}`).join('\n\n');
        navigator.clipboard.writeText(text);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2500);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            
            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/" 
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Landing Page</span>
                        </Link>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-bold text-slate-900">RaphaMIS</span>
                            <span>•</span>
                            <span>Legal & Regulatory Framework</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            {copiedNotification ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                            <span>{copiedNotification ? 'Copied' : 'Copy Text'}</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Document Container */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                
                {/* Header Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800">
                            Official Statutory Policy
                        </span>
                        <span className="text-xs text-slate-400">
                            Corporate Proprietor: Saaslink Technologies Ltd
                        </span>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {currentDoc.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">
                            {currentDoc.subtitle}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
                        <span>Version: {currentDoc.lastUpdated}</span>
                        <span>•</span>
                        <span>Governing Entity: Saaslink Technologies Ltd</span>
                        <span>•</span>
                        <span>Enforceable Globally</span>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 mb-8">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'terms' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Terms of Service
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'privacy' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            <Lock className="w-3.5 h-3.5" />
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('cookies')}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'cookies' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            <Cookie className="w-3.5 h-3.5" />
                            Cookies Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('disclaimer')}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'disclaimer' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Medical Disclaimer
                        </button>
                        <button
                            onClick={() => setActiveTab('baa')}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === 'baa' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            BAA Addendum
                        </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter sections..."
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                        />
                    </div>
                </div>

                {/* Document Body */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
                    {filteredSections.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            No clauses matched your query "{searchQuery}".
                        </div>
                    ) : (
                        filteredSections.map((sec, idx) => (
                            <div key={idx} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                    <span className="w-2 h-5 bg-teal-600 rounded-full inline-block"></span>
                                    {sec.heading}
                                </h2>
                                <div className="space-y-3 pl-4">
                                    {sec.content.map((p, pIdx) => (
                                        <p
                                            key={pIdx}
                                            className={
                                                p.startsWith('IMPORTANT') ||
                                                p.startsWith('TO THE MAXIMUM') ||
                                                p.startsWith('CRITICAL') ||
                                                p.startsWith('IN ALL CIRCUMSTANCES')
                                                    ? 'p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-900 font-medium text-xs sm:text-sm leading-relaxed'
                                                    : 'text-slate-700 text-xs sm:text-sm leading-relaxed'
                                            }
                                        >
                                            {p}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Seal */}
                <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>
                            Owned and operated by <strong className="text-slate-800">Saaslink Technologies Ltd</strong>. All rights reserved.
                        </span>
                    </div>
                    <Link to="/" className="text-teal-700 font-bold hover:underline">
                        Back to RaphaMIS Landing Page →
                    </Link>
                </div>

            </main>

        </div>
    );
};
