import React, { useState } from 'react';
import {
    X,
    FileText,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Wand2,
    FileCheck,
} from 'lucide-react';
import { RadiologyStudy } from '../../packages/shared/types';

interface RadiologyReportEntryModalProps {
    study: RadiologyStudy | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmitReport: (
        studyId: string,
        reportData: {
            techniqueDescription?: string;
            findings: string;
            impression: string;
            recommendations?: string;
            radiologistName: string;
            criticalFindingAlert?: boolean;
        }
    ) => Promise<void>;
}

export const RadiologyReportEntryModal: React.FC<RadiologyReportEntryModalProps> = ({
    study,
    isOpen,
    onClose,
    onSubmitReport,
}) => {
    if (!isOpen || !study) return null;

    const [technique, setTechnique] = useState(
        study.techniqueDescription ||
            `Standard multiplanar ${study.modality} examination of the ${study.bodyRegion} performed in accordance with institutional radiological protocols.`
    );
    const [findings, setFindings] = useState(study.findings || '');
    const [impression, setImpression] = useState(study.impression || '');
    const [recommendations, setRecommendations] = useState(study.recommendations || '');
    const [radiologistName, setRadiologistName] = useState(
        study.radiologistName || 'Dr. David Aris, MD (Board Certified Radiologist)'
    );
    const [isCritical, setIsCritical] = useState(study.criticalFindingAlert || false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clinical Standard Report Templates
    const applyTemplate = (templateType: 'normal_cxr' | 'normal_brain' | 'pe' | 'pneumonia' | 'normal_us') => {
        switch (templateType) {
            case 'normal_cxr':
                setTechnique('PA and lateral chest radiographs obtained in full inspiration.');
                setFindings(
                    'LUNGS: The lungs are clear bilaterally without focal consolidation, pneumothorax, or large pleural effusion. Vascularity is normal.\n\nHEART: Cardiothoracic ratio is normal (< 0.50). Normal mediastinal and hilar contours.\n\nBONES & SOFT TISSUES: Intact bony thorax without acute fracture.'
                );
                setImpression('1. NO ACUTE CARDIOPULMONARY DISEASE.\n2. CLEAR LUNGS.');
                setRecommendations('Routine clinical follow-up as indicated.');
                setIsCritical(false);
                break;
            case 'normal_brain':
                setTechnique('Multiplanar, multisequence noncontrast brain MRI including axial T1, T2, FLAIR, and DWI/ADC.');
                setFindings(
                    'BRAIN PARENCHYMA: Normal signal intensity throughout the cerebral hemispheres, cerebellum, and brainstem. No acute restricted diffusion on DWI to suggest acute territorial infarction.\n\nVENTRICLES: Normal ventricular size and configuration. Basal cisterns are patent.\n\nEXTRA-AXIAL: No intracranial hemorrhage or subdural collection.'
                );
                setImpression('1. UNREMARKABLE BRAIN MRI.\n2. NO EVIDENCE OF ACUTE ISCHEMIA OR INTRACRANIAL MASS.');
                setRecommendations('No imaging follow-up required.');
                setIsCritical(false);
                break;
            case 'pe':
                setTechnique('Axial helical multidetector CT angiography of the chest performed with 85 mL IV non-ionic contrast timed to pulmonary arterial phase.');
                setFindings(
                    'VASCULAR: Occlusive filling defects noted within the main pulmonary artery bifurcation and descending lower lobe branches. Evidence of acute right ventricular strain with RV/LV ratio > 1.2.\n\nLUNGS: Subsegmental peripheral wedge-shaped opacity consistent with early infarction.\n\nPLEURA: Trace bilateral pleural fluid.'
                );
                setImpression('1. ACUTE PULMONARY EMBOLISM (CRITICAL FINDING).\n2. SIGNS OF RIGHT VENTRICULAR STRAIN.');
                setRecommendations('Immediate PERT notification and clinical anticoagulation protocol.');
                setIsCritical(true);
                break;
            case 'pneumonia':
                setTechnique('Posteroanterior and lateral projections of the chest.');
                setFindings(
                    'LUNGS: Dense focal airspace consolidation with air bronchograms in the right lower lobe, partially silhouetting the right diaphragmatic dome. Left lung is aerated and clear.\n\nHEART: Heart size is normal. Normal mediastinal contours.\n\nPLEURA: Mild blunting of the right lateral costophrenic angle.'
                );
                setImpression('1. RIGHT LOWER LOBE AIRSPACE CONSOLIDATION CONSISTENT WITH ACUTE BACTERIAL PNEUMONIA.\n2. ASSOCIATED SMALL REACTIVE PARAPNEUMONIC EFFUSION.');
                setRecommendations('Clinical correlation with infectious markers and follow-up radiograph in 6 weeks.');
                setIsCritical(false);
                break;
            case 'normal_us':
                setTechnique('Real-time gray-scale and color Doppler sonography of the complete abdomen.');
                setFindings(
                    'LIVER: Normal size and echotexture without focal mass.\n\nGALLBLADDER: Normal distension without gallstones, wall thickening, or pericholecystic fluid. Common bile duct measures 4 mm (normal).\n\nKIDNEYS & SPLEEN: Normal bilateral cortical thickness without hydronephrosis.'
                );
                setImpression('1. NORMAL ABDOMINAL ULTRASOUND.\n2. NO EVIDENCE OF CHOLELITHIASIS OR BILIARY DUCTAL DILATATION.');
                setRecommendations('None.');
                setIsCritical(false);
                break;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmitReport(study.id, {
                techniqueDescription: technique,
                findings,
                impression,
                recommendations,
                radiologistName,
                criticalFindingAlert: isCritical,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-3xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral">
                                Radiologist Reporting Terminal: {study.accessionNumber}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {study.procedureName} • Patient: {study.patientName} (MRN: {study.patientMRN})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {/* Rapid Clinical Templates Bar */}
                        <div className="bg-teal-50/70 p-3 rounded-lg border border-teal-100 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                                    <Wand2 className="h-3.5 w-3.5 text-teal-600" />
                                    Rapid Structured Report Templates:
                                </span>
                                <span className="text-[11px] text-teal-700">Click to populate fields</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('normal_cxr')}
                                    className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-medium shadow-2xs transition"
                                >
                                    Normal Chest X-Ray
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('normal_brain')}
                                    className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-medium shadow-2xs transition"
                                >
                                    Normal Brain MRI/CT
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('pneumonia')}
                                    className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-medium shadow-2xs transition"
                                >
                                    Acute Pneumonia
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('pe')}
                                    className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded text-xs font-medium shadow-2xs transition"
                                >
                                    Pulmonary Embolism (STAT)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('normal_us')}
                                    className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-medium shadow-2xs transition"
                                >
                                    Normal Abdomen US
                                </button>
                            </div>
                        </div>

                        {/* Critical Finding Flag Checkbox */}
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className={`h-5 w-5 ${isCritical ? 'text-red-600' : 'text-gray-400'}`} />
                                <div>
                                    <span className="text-xs font-bold text-gray-800">
                                        Flag as Critical Radiological Panic Finding
                                    </span>
                                    <p className="text-[11px] text-gray-500">
                                        Initiates mandatory urgent telephone provider readback alert in accordance with ACR practice guidelines.
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={isCritical}
                                onChange={(e) => setIsCritical(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                        </div>

                        {/* Technique */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Scan Technique & Protocol Description
                            </label>
                            <input
                                type="text"
                                value={technique}
                                onChange={(e) => setTechnique(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Findings */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Anatomical Findings (Narrative)
                            </label>
                            <textarea
                                rows={5}
                                required
                                value={findings}
                                onChange={(e) => setFindings(e.target.value)}
                                placeholder="Describe parenchymal, vascular, bony, and soft tissue findings in detail..."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 font-sans"
                            />
                        </div>

                        {/* Impression */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Clinical Impression (Numbered Conclusion)
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={impression}
                                onChange={(e) => setImpression(e.target.value)}
                                placeholder="1. PRIMARY RADIOLOGICAL DIAGNOSIS..."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500 font-medium"
                            />
                        </div>

                        {/* Recommendations */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Recommendations / Follow-Up Guidance (Optional)
                            </label>
                            <input
                                type="text"
                                value={recommendations}
                                onChange={(e) => setRecommendations(e.target.value)}
                                placeholder="e.g. Recommend follow-up noncontrast chest CT in 6-8 weeks."
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Interpreting Radiologist */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Radiologist Digital Signature
                            </label>
                            <input
                                type="text"
                                required
                                value={radiologistName}
                                onChange={(e) => setRadiologistName(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition flex items-center gap-1.5 ${
                                isCritical
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                        >
                            <FileCheck className="h-4 w-4" />
                            {isSubmitting ? 'Signing & Releasing...' : 'Sign & Finalize Diagnostic Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
