import React, { useState } from 'react';
import { Upload, FileUp, X, CheckCircle, AlertCircle, RefreshCw, HardDrive, User, Calendar, Stethoscope } from 'lucide-react';
import { uploadDicomInstance } from '../../api/pacsApi';

interface PacsUploadModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  initialPatientMRN?: string;
  initialPatientName?: string;
}

export const PacsUploadModal: React.FC<PacsUploadModalProps> = ({
  isOpen = true,
  onClose,
  onUploadSuccess,
  initialPatientMRN = '',
  initialPatientName = '',
}) => {
  if (!isOpen) return null;

  const [patientMRN, setPatientMRN] = useState(initialPatientMRN);
  const [patientName, setPatientName] = useState(initialPatientName);
  const [modality, setModality] = useState('CR');
  const [studyDescription, setStudyDescription] = useState('Chest X-Ray Digital Ingest');
  const [seriesDescription, setSeriesDescription] = useState('PA Upright');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!studyDescription) {
        setStudyDescription(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientMRN || !patientName) {
      setErrorMsg('Patient MRN and Name are required for DICOM archive association.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await uploadDicomInstance({
        fileName: selectedFileName || 'study.dcm',
        patientMRN,
        patientName,
        modality,
        studyDescription,
        seriesDescription,
      });

      setUploadSuccess(true);
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to ingest DICOM into PACS archive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-neutral-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingest DICOM / PACS File</h2>
              <p className="text-xs text-neutral-400">Direct upload to RaphaMIS Orthanc / PACS Archive</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>DICOM instance successfully indexed and matched to patient!</span>
            </div>
          )}

          {/* File Dropzone */}
          <div className="border-2 border-dashed border-neutral-700 hover:border-teal-500/50 rounded-xl p-6 text-center transition cursor-pointer bg-neutral-950/40 relative">
            <input
              type="file"
              accept=".dcm,.dicom,application/dicom,image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileUp className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-neutral-200">
              {selectedFileName ? (
                <span className="text-teal-400 font-bold">{selectedFileName}</span>
              ) : (
                'Drop .DCM file here, or click to browse'
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Supports standard DICOM Part 10 formats (.dcm, .dicom)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Patient MRN</label>
              <input
                type="text"
                value={patientMRN}
                onChange={(e) => setPatientMRN(e.target.value)}
                placeholder="e.g. MRN-98421"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Kipchoge, Samuel"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Modality</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="CR">CR - Computed Radiography (X-Ray)</option>
                <option value="CT">CT - Computed Tomography</option>
                <option value="MR">MR - Magnetic Resonance</option>
                <option value="US">US - Ultrasound</option>
                <option value="DX">DX - Digital Radiography</option>
                <option value="XA">XA - X-Ray Angiography</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Series Description</label>
              <input
                type="text"
                value={seriesDescription}
                onChange={(e) => setSeriesDescription(e.target.value)}
                placeholder="e.g. Axial Angio 1.25mm"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Study Description</label>
            <input
              type="text"
              value={studyDescription}
              onChange={(e) => setStudyDescription(e.target.value)}
              placeholder="e.g. CT Chest PE Protocol"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Ingest to PACS Archive</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
