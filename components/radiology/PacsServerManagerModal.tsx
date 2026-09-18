import React, { useState, useEffect } from 'react';
import { Server, Activity, CheckCircle, AlertCircle, RefreshCw, X, Plus, Radio, Wifi } from 'lucide-react';
import { PacsServerConfig } from '../../packages/shared/types';
import { getPacsServers, echoPacsServer, savePacsServer } from '../../api/pacsApi';

interface PacsServerManagerModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const PacsServerManagerModal: React.FC<PacsServerManagerModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  const [servers, setServers] = useState<PacsServerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { latency: number; status: string }>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  // New server form state
  const [newServer, setNewServer] = useState<Partial<PacsServerConfig>>({
    name: '',
    type: 'ORTHANC',
    aeTitle: 'ORTHANC',
    host: '127.0.0.1',
    port: 4242,
    dicomwebUrl: 'http://127.0.0.1:8042/dicom-web',
    isDefault: false,
  });

  const loadServers = async () => {
    setLoading(true);
    try {
      const data = await getPacsServers();
      setServers(data);
    } catch (err) {
      console.error('Failed to load PACS servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleEcho = async (serverId: string) => {
    setPingingId(serverId);
    try {
      const result = await echoPacsServer(serverId);
      setPingResults((prev) => ({
        ...prev,
        [serverId]: { latency: result.latencyMs, status: result.status },
      }));
    } catch (err) {
      setPingResults((prev) => ({
        ...prev,
        [serverId]: { latency: -1, status: 'OFFLINE' },
      }));
    } finally {
      setPingingId(null);
    }
  };

  const handleSaveNewServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServer.name || !newServer.host || !newServer.port) return;

    try {
      await savePacsServer(newServer);
      setShowAddForm(false);
      setNewServer({
        name: '',
        type: 'ORTHANC',
        aeTitle: 'ORTHANC',
        host: '127.0.0.1',
        port: 4242,
        dicomwebUrl: '',
        isDefault: false,
      });
      loadServers();
    } catch (err) {
      console.error('Failed to save PACS server:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-neutral-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">PACS & DICOM Routing Gateways</h2>
              <p className="text-xs text-neutral-400">Orthanc, WADO-RS, DCM4CHEE & Hospital AE Entities</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Configured PACS Endpoints</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add PACS Node</span>
            </button>
          </div>

          {/* Add Server Form */}
          {showAddForm && (
            <form onSubmit={handleSaveNewServer} className="p-4 bg-neutral-950 rounded-xl border border-teal-500/30 space-y-3">
              <div className="text-xs font-bold text-teal-400">Register New DICOM Node</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Server Name</label>
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    placeholder="e.g. Siemens Syngo PACS"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Type</label>
                  <select
                    value={newServer.type}
                    onChange={(e) => setNewServer({ ...newServer, type: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ORTHANC">Orthanc Server</option>
                    <option value="DICOMWEB">DICOMweb (WADO-RS / QIDO-RS)</option>
                    <option value="DCM4CHEE">dcm4chee Archive</option>
                    <option value="LOCAL_ARCHIVE">Local Modality SCP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">AE Title</label>
                  <input
                    type="text"
                    value={newServer.aeTitle}
                    onChange={(e) => setNewServer({ ...newServer, aeTitle: e.target.value })}
                    placeholder="e.g. ORTHANC"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Host IP / FQDN</label>
                  <input
                    type="text"
                    value={newServer.host}
                    onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                    placeholder="e.g. 192.168.1.50"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Port</label>
                  <input
                    type="number"
                    value={newServer.port}
                    onChange={(e) => setNewServer({ ...newServer, port: Number(e.target.value) })}
                    placeholder="4242"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">DICOMweb REST URL (Optional)</label>
                <input
                  type="text"
                  value={newServer.dicomwebUrl || ''}
                  onChange={(e) => setNewServer({ ...newServer, dicomwebUrl: e.target.value })}
                  placeholder="http://127.0.0.1:8042/dicom-web"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold">
                  Save Node
                </button>
              </div>
            </form>
          )}

          {/* Servers List */}
          <div className="space-y-3">
            {servers.map((srv) => {
              const ping = pingResults[srv.id];
              return (
                <div
                  key={srv.id}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{srv.name}</span>
                      {srv.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          DEFAULT
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {srv.type}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      AE: <span className="text-teal-300 font-semibold">{srv.aeTitle}</span> | {srv.host}:{srv.port}
                    </div>
                    {srv.dicomwebUrl && (
                      <div className="text-[11px] text-neutral-500 font-mono truncate max-w-sm">
                        DICOMweb: {srv.dicomwebUrl}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {ping ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        {ping.status === 'ONLINE' ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-mono">
                            <CheckCircle className="w-4 h-4" />
                            <span>{ping.latency}ms</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-400 font-mono">
                            <AlertCircle className="w-4 h-4" />
                            <span>Offline</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-neutral-500 text-xs font-mono">
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleEcho(srv.id)}
                      disabled={pingingId === srv.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition disabled:opacity-50"
                      title="DICOM C-ECHO Ping Test"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${pingingId === srv.id ? 'animate-spin text-teal-400' : ''}`} />
                      <span>C-ECHO</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-800 flex justify-end bg-neutral-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
