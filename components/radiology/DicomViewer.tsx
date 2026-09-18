import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Sun,
  Contrast,
  Sliders,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Move,
  Ruler,
  Compass,
  Square,
  Circle,
  FileText,
  Download,
  Info,
  RefreshCw,
  Layers,
  X,
  Eye,
  Check,
  Tag,
} from 'lucide-react';
import { DicomStudy, DicomSeries, DicomInstance, DicomMeasurement } from '../../packages/shared/types';

interface DicomViewerProps {
  study: DicomStudy;
  initialSeriesIndex?: number;
  initialInstanceIndex?: number;
  onClose?: () => void;
  onSaveSnapshotToReport?: (dataUrl: string, measurementNotes: string) => void;
}

export type ActiveTool = 'PAN' | 'ZOOM' | 'WL' | 'RULER' | 'ANGLE' | 'ROI_RECT' | 'ROI_ELLIPSE';

export const DicomViewer: React.FC<DicomViewerProps> = ({
  study,
  initialSeriesIndex = 0,
  initialInstanceIndex = 0,
  onClose,
  onSaveSnapshotToReport,
}) => {
  // Active Series and Instance
  const [selectedSeriesIdx, setSelectedSeriesIdx] = useState(initialSeriesIndex);
  const [selectedInstanceIdx, setSelectedInstanceIdx] = useState(initialInstanceIndex);

  const seriesList = study.series || [];
  const currentSeries: DicomSeries | undefined = seriesList[selectedSeriesIdx] || seriesList[0];
  const instanceList = currentSeries?.instances || [];
  const currentInstance: DicomInstance | undefined = instanceList[selectedInstanceIdx] || instanceList[0];

  // Tool selection
  const [activeTool, setActiveTool] = useState<ActiveTool>('PAN');

  // Interactive Transformations
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [isFlippedH, setIsFlippedH] = useState(false);
  const [isFlippedV, setIsFlippedV] = useState(false);

  // Window / Level (Contrast & Brightness)
  const [windowCenter, setWindowCenter] = useState<number>(currentInstance?.windowCenter ?? 40);
  const [windowWidth, setWindowWidth] = useState<number>(currentInstance?.windowWidth ?? 400);

  // Measurements
  const [measurements, setMeasurements] = useState<DicomMeasurement[]>([]);
  const [currentDraftPoints, setCurrentDraftPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Cine Playback
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [cineFps, setCineFps] = useState(10);

  // Modals & Drawers
  const [showTagInspector, setShowTagInspector] = useState(false);
  const [showSeriesDrawer, setShowSeriesDrawer] = useState(false);

  // Viewport Container Ref
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Pixel Spacing (mm per pixel)
  const pixelSpacing = currentInstance?.pixelSpacing || [0.5, 0.5];

  // Reset transforms on series change
  useEffect(() => {
    setSelectedInstanceIdx(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsInverted(false);
    if (currentInstance?.windowCenter !== undefined) {
      setWindowCenter(currentInstance.windowCenter);
    }
    if (currentInstance?.windowWidth !== undefined) {
      setWindowWidth(currentInstance.windowWidth);
    }
  }, [selectedSeriesIdx]);

  // Cine loop effect
  useEffect(() => {
    let interval: any;
    if (isPlayingCine && instanceList.length > 1) {
      interval = setInterval(() => {
        setSelectedInstanceIdx((prev) => (prev + 1) % instanceList.length);
      }, 1000 / cineFps);
    }
    return () => clearInterval(interval);
  }, [isPlayingCine, cineFps, instanceList.length]);

  // Handle Mouse Down on Viewport
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 2) return; // Left or Right click
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (activeTool === 'RULER' || activeTool === 'ROI_RECT' || activeTool === 'ROI_ELLIPSE') {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentDraftPoints([{ x, y }]);
      }
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (activeTool === 'PAN' || e.buttons === 4) {
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (activeTool === 'ZOOM') {
      const zoomFactor = deltaY > 0 ? 0.98 : 1.02;
      setZoom((z) => Math.max(0.2, Math.min(5, z * zoomFactor)));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (activeTool === 'WL' || e.button === 2) {
      setWindowWidth((w) => Math.max(1, w + deltaX * 2));
      setWindowCenter((c) => c - deltaY * 2);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (currentDraftPoints.length > 0) {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (currentDraftPoints.length === 1) {
          setCurrentDraftPoints([currentDraftPoints[0], { x, y }]);
        } else {
          setCurrentDraftPoints([currentDraftPoints[0], { x, y }]);
        }
      }
    }
  };

  // Handle Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (currentDraftPoints.length === 2) {
      const p1 = currentDraftPoints[0];
      const p2 = currentDraftPoints[1];
      const dxPx = (p2.x - p1.x) / zoom;
      const dyPx = (p2.y - p1.y) / zoom;
      const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);

      if (activeTool === 'RULER') {
        const distMm = distPx * pixelSpacing[0];
        const newMeas: DicomMeasurement = {
          id: `meas_${Date.now()}`,
          type: 'RULER',
          points: [p1, p2],
          label: 'Distance',
          value: `${distMm.toFixed(1)} mm`,
          color: '#38bdf8',
          unit: 'mm',
        };
        setMeasurements((prev) => [...prev, newMeas]);
      } else if (activeTool === 'ROI_RECT' || activeTool === 'ROI_ELLIPSE') {
        const widthMm = Math.abs(dxPx * pixelSpacing[0]);
        const heightMm = Math.abs(dyPx * pixelSpacing[1]);
        const areaMm2 = activeTool === 'ROI_RECT' ? widthMm * heightMm : (Math.PI * widthMm * heightMm) / 4;
        const newMeas: DicomMeasurement = {
          id: `meas_${Date.now()}`,
          type: activeTool === 'ROI_RECT' ? 'RECT_ROI' : 'ELLIPSE_ROI',
          points: [p1, p2],
          label: activeTool === 'ROI_RECT' ? 'Rect ROI' : 'Ellipse ROI',
          value: `${(areaMm2 / 100).toFixed(2)} cm²`,
          color: '#f59e0b',
          unit: 'cm²',
        };
        setMeasurements((prev) => [...prev, newMeas]);
      }
      setCurrentDraftPoints([]);
    }
  };

  // Wheel to scrub slices or zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((z) => Math.max(0.2, Math.min(5, z * factor)));
    } else {
      // Scrub series slices
      if (instanceList.length > 1) {
        if (e.deltaY > 0) {
          setSelectedInstanceIdx((i) => Math.min(instanceList.length - 1, i + 1));
        } else {
          setSelectedInstanceIdx((i) => Math.max(0, i - 1));
        }
      }
    }
  };

  // Window/Level Presets
  const applyPreset = (preset: 'LUNG' | 'BONE' | 'SOFT_TISSUE' | 'BRAIN' | 'DEFAULT') => {
    switch (preset) {
      case 'LUNG':
        setWindowCenter(-600);
        setWindowWidth(1500);
        break;
      case 'BONE':
        setWindowCenter(400);
        setWindowWidth(2000);
        break;
      case 'SOFT_TISSUE':
        setWindowCenter(40);
        setWindowWidth(400);
        break;
      case 'BRAIN':
        setWindowCenter(40);
        setWindowWidth(80);
        break;
      case 'DEFAULT':
        setWindowCenter(currentInstance?.windowCenter ?? 40);
        setWindowWidth(currentInstance?.windowWidth ?? 400);
        break;
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsInverted(false);
    setIsFlippedH(false);
    setIsFlippedV(false);
    applyPreset('DEFAULT');
  };

  // Calculate CSS Filter for Window/Level simulation
  // Standard CSS contrast/brightness approximations
  const baseContrast = Math.max(0.2, Math.min(3, 400 / Math.max(1, windowWidth)));
  const baseBrightness = Math.max(0.3, Math.min(2.5, 1 + (windowCenter - 40) / 500));

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none overflow-hidden font-sans">
      {/* Top Diagnostic PACS Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs gap-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSeriesDrawer(!showSeriesDrawer)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            title="Toggle Series Selector"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold">Series ({seriesList.length})</span>
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Primary Viewport Tools */}
          <div className="flex items-center bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => setActiveTool('PAN')}
              className={`p-1.5 rounded transition ${activeTool === 'PAN' ? 'bg-teal-600 text-white' : 'text-neutral-300 hover:text-white'}`}
              title="Pan Viewport (Move image)"
            >
              <Move className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('ZOOM')}
              className={`p-1.5 rounded transition ${activeTool === 'ZOOM' ? 'bg-teal-600 text-white' : 'text-neutral-300 hover:text-white'}`}
              title="Interactive Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('WL')}
              className={`p-1.5 rounded transition ${activeTool === 'WL' ? 'bg-teal-600 text-white' : 'text-neutral-300 hover:text-white'}`}
              title="Window / Level (Drag left/right for Width, up/down for Center)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('RULER')}
              className={`p-1.5 rounded transition ${activeTool === 'RULER' ? 'bg-teal-600 text-white' : 'text-neutral-300 hover:text-white'}`}
              title="Calibrated Distance Ruler (mm)"
            >
              <Ruler className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('ROI_RECT')}
              className={`p-1.5 rounded transition ${activeTool === 'ROI_RECT' ? 'bg-teal-600 text-white' : 'text-neutral-300 hover:text-white'}`}
              title="Rectangular ROI Area (cm²)"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('ROI_ELLIPSE')}
              className={`p-1.5 rounded transition ${activeTool === 'ROI_ELLIPSE' ? 'bg-teal-600 text-white' : 'text-neutral-300 hover:text-white'}`}
              title="Elliptical ROI Area (cm²)"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Preset Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => applyPreset('LUNG')}
              className="px-2 py-1 rounded text-[11px] font-medium hover:bg-neutral-700 text-neutral-300 hover:text-white"
            >
              Lung
            </button>
            <button
              onClick={() => applyPreset('BONE')}
              className="px-2 py-1 rounded text-[11px] font-medium hover:bg-neutral-700 text-neutral-300 hover:text-white"
            >
              Bone
            </button>
            <button
              onClick={() => applyPreset('SOFT_TISSUE')}
              className="px-2 py-1 rounded text-[11px] font-medium hover:bg-neutral-700 text-neutral-300 hover:text-white"
            >
              Soft
            </button>
            <button
              onClick={() => applyPreset('BRAIN')}
              className="px-2 py-1 rounded text-[11px] font-medium hover:bg-neutral-700 text-neutral-300 hover:text-white"
            >
              Brain
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Quick Transform Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsInverted(!isInverted)}
              className={`p-1.5 rounded-lg transition ${isInverted ? 'bg-teal-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'}`}
              title="Invert Grayscale (Photometric Interpretation)"
            >
              <Contrast className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
              title="Reset View Transforms"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2">
          {measurements.length > 0 && (
            <button
              onClick={() => setMeasurements([])}
              className="text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30"
            >
              Clear Annotations ({measurements.length})
            </button>
          )}

          <button
            onClick={() => setShowTagInspector(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs"
            title="Inspect DICOM Header Tags"
          >
            <Tag className="w-3.5 h-3.5 text-teal-400" />
            <span>DICOM Header</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
              title="Close PACS Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Workspace */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Series Selector Sidebar Drawer */}
        {showSeriesDrawer && (
          <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-3 flex flex-col gap-2 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Series Thumbnails</span>
              <button onClick={() => setShowSeriesDrawer(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {seriesList.map((ser, sIdx) => (
              <div
                key={ser.id || ser.seriesInstanceUid}
                onClick={() => {
                  setSelectedSeriesIdx(sIdx);
                  setShowSeriesDrawer(false);
                }}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  selectedSeriesIdx === sIdx
                    ? 'border-teal-500 bg-teal-950/40 text-teal-200'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-850 text-neutral-300'
                }`}
              >
                <div className="text-xs font-bold truncate">{ser.seriesDescription || `Series ${ser.seriesNumber}`}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center justify-between">
                  <span>Modality: {ser.modality}</span>
                  <span>{ser.instances?.length || ser.numberOfInstances || 1} imgs</span>
                </div>
                {ser.instances?.[0]?.imageUrl && (
                  <div className="mt-2 h-24 w-full bg-black rounded overflow-hidden flex items-center justify-center border border-neutral-800">
                    <img
                      src={ser.instances[0].imageUrl}
                      alt={ser.seriesDescription}
                      className="h-full object-contain pointer-events-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Viewport Canvas Area */}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className="relative flex-1 bg-black flex items-center justify-center overflow-hidden cursor-crosshair"
        >
          {/* Top-Left Patient Dossier DICOM Overlay */}
          <div className="absolute top-3 left-3 text-[11px] font-mono text-cyan-300 pointer-events-none drop-shadow-md space-y-0.5 z-10">
            <div className="font-bold text-white text-xs">{study.patientName}</div>
            <div>MRN: {study.patientMRN}</div>
            <div>DOB: {study.patientBirthDate || 'N/A'} ({study.patientSex || 'U'})</div>
            <div>Study: {study.studyDate} {study.studyTime || ''}</div>
            <div>Acc: {study.accessionNumber}</div>
          </div>

          {/* Top-Right Equipment & Institution Overlay */}
          <div className="absolute top-3 right-3 text-[11px] font-mono text-cyan-300 pointer-events-none drop-shadow-md text-right space-y-0.5 z-10">
            <div className="font-bold text-white text-xs">{study.institutionName || 'RaphaMIS Healthcare'}</div>
            <div>Modality: {currentSeries?.modality || study.modality}</div>
            <div>{currentSeries?.seriesDescription || 'Diagnostic Series'}</div>
            <div>Thick: {currentInstance?.sliceThickness ? `${currentInstance.sliceThickness}mm` : 'N/A'}</div>
          </div>

          {/* Bottom-Left Window / Level & Zoom Info */}
          <div className="absolute bottom-3 left-3 text-[11px] font-mono text-cyan-300 pointer-events-none drop-shadow-md space-y-0.5 z-10">
            <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
            <div>W: {windowWidth.toFixed(0)} L: {windowCenter.toFixed(0)}</div>
            <div>Spacing: {pixelSpacing[0].toFixed(2)}x{pixelSpacing[1].toFixed(2)}mm</div>
          </div>

          {/* Bottom-Right Frame / Slice Indicator */}
          <div className="absolute bottom-3 right-3 text-[11px] font-mono text-cyan-300 pointer-events-none drop-shadow-md text-right space-y-0.5 z-10">
            <div>Series {selectedSeriesIdx + 1} of {seriesList.length}</div>
            <div className="font-bold text-white">Img {selectedInstanceIdx + 1} / {instanceList.length || 1}</div>
            <div>UID: {currentInstance?.sopInstanceUid ? currentInstance.sopInstanceUid.slice(-8) : '0000'}</div>
          </div>

          {/* Diagnostic Medical Image Display */}
          <div
            className="transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1}) scaleY(${isFlippedV ? -1 : 1})`,
              filter: `contrast(${baseContrast}) brightness(${baseBrightness}) ${isInverted ? 'invert(1)' : ''}`,
            }}
          >
            {currentInstance?.imageUrl ? (
              <img
                src={currentInstance.imageUrl}
                alt="DICOM Frame"
                className="max-h-[75vh] max-w-[75vw] object-contain select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="h-96 w-96 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 font-mono text-xs">
                No Pixel Data Available
              </div>
            )}
          </div>

          {/* Vector Annotations & Measurements Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {measurements.map((m) => {
              if (m.type === 'RULER' && m.points.length === 2) {
                const [p1, p2] = m.points;
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                return (
                  <g key={m.id}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={m.color} strokeWidth={2} strokeDasharray="3 3" />
                    <circle cx={p1.x} cy={p1.y} r={3} fill={m.color} />
                    <circle cx={p2.x} cy={p2.y} r={3} fill={m.color} />
                    <rect x={midX - 35} y={midY - 14} width={70} height={18} rx={3} fill="rgba(0,0,0,0.75)" />
                    <text x={midX} y={midY} fill={m.color} fontSize={11} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
                      {m.value}
                    </text>
                  </g>
                );
              }
              if (m.type === 'RECT_ROI' && m.points.length === 2) {
                const [p1, p2] = m.points;
                const x = Math.min(p1.x, p2.x);
                const y = Math.min(p1.y, p2.y);
                const w = Math.abs(p2.x - p1.x);
                const h = Math.abs(p2.y - p1.y);
                return (
                  <g key={m.id}>
                    <rect x={x} y={y} width={w} height={h} fill="rgba(245, 158, 11, 0.15)" stroke={m.color} strokeWidth={1.5} />
                    <rect x={x} y={y - 18} width={80} height={16} rx={3} fill="rgba(0,0,0,0.8)" />
                    <text x={x + 4} y={y - 6} fill={m.color} fontSize={10} fontFamily="monospace">
                      {m.value}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Current Active Drafting Measurement */}
            {currentDraftPoints.length === 2 && activeTool === 'RULER' && (
              <g>
                <line
                  x1={currentDraftPoints[0].x}
                  y1={currentDraftPoints[0].y}
                  x2={currentDraftPoints[1].x}
                  y2={currentDraftPoints[1].y}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Bottom Cine Scrubber & Instance Controls */}
      {instanceList.length > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-t border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingCine(!isPlayingCine)}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold transition ${
                isPlayingCine ? 'bg-amber-600 text-white' : 'bg-teal-600 text-white hover:bg-teal-500'
              }`}
            >
              {isPlayingCine ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingCine ? 'Pause' : 'Cine Loop'}</span>
            </button>

            <button
              onClick={() => setSelectedInstanceIdx((i) => Math.max(0, i - 1))}
              disabled={selectedInstanceIdx === 0}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedInstanceIdx((i) => Math.min(instanceList.length - 1, i + 1))}
              disabled={selectedInstanceIdx === instanceList.length - 1}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 ml-2 text-neutral-400">
              <span>FPS:</span>
              <select
                value={cineFps}
                onChange={(e) => setCineFps(Number(e.target.value))}
                className="bg-neutral-800 text-white rounded px-1.5 py-0.5 border border-neutral-700 text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={24}>24</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <input
              type="range"
              min={0}
              max={instanceList.length - 1}
              value={selectedInstanceIdx}
              onChange={(e) => setSelectedInstanceIdx(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          <div className="text-neutral-400 font-mono text-xs">
            Slice: {selectedInstanceIdx + 1} of {instanceList.length}
          </div>
        </div>
      )}

      {/* DICOM Header Tag Inspector Modal */}
      {showTagInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden text-neutral-200">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm text-white">DICOM Header Metadata Inspector</h3>
              </div>
              <button onClick={() => setShowTagInspector(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px]">Patient Identification (0010,xxxx)</div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-1">
                  <div>(0010,0010) Patient Name: <span className="text-white font-semibold">{study.patientName}</span></div>
                  <div>(0010,0020) Patient ID: <span className="text-white">{study.patientMRN}</span></div>
                  <div>(0010,0030) Patient Birth Date: <span className="text-white">{study.patientBirthDate || 'N/A'}</span></div>
                  <div>(0010,0040) Patient Sex: <span className="text-white">{study.patientSex || 'N/A'}</span></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px]">Study & Acquisition Info (0008,xxxx / 0020,xxxx)</div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-1">
                  <div>(0020,000D) Study Instance UID: <span className="text-amber-300 break-all">{study.studyInstanceUid}</span></div>
                  <div>(0008,0050) Accession Number: <span className="text-white">{study.accessionNumber}</span></div>
                  <div>(0008,0020) Study Date: <span className="text-white">{study.studyDate}</span></div>
                  <div>(0008,0030) Study Time: <span className="text-white">{study.studyTime || 'N/A'}</span></div>
                  <div>(0008,1030) Study Description: <span className="text-white">{study.studyDescription}</span></div>
                  <div>(0008,0060) Modality: <span className="text-teal-300 font-bold">{currentSeries?.modality || study.modality}</span></div>
                  <div>(0008,0080) Institution Name: <span className="text-white">{study.institutionName || 'RaphaMIS'}</span></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px]">Image Geometry & Radiometry (0028,xxxx)</div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-1">
                  <div>(0028,0010) Rows: <span className="text-white">{currentInstance?.rows || 512}</span></div>
                  <div>(0028,0011) Columns: <span className="text-white">{currentInstance?.columns || 512}</span></div>
                  <div>(0028,0100) Bits Allocated: <span className="text-white">{currentInstance?.bitsAllocated || 16}</span></div>
                  <div>(0028,1050) Window Center: <span className="text-white">{windowCenter}</span></div>
                  <div>(0028,1051) Window Width: <span className="text-white">{windowWidth}</span></div>
                  <div>(0028,0030) Pixel Spacing: <span className="text-white">{pixelSpacing.join(', ')} mm</span></div>
                  <div>(0018,0050) Slice Thickness: <span className="text-white">{currentInstance?.sliceThickness || 'N/A'} mm</span></div>
                </div>
              </div>

              {currentInstance?.metadataTags && Object.keys(currentInstance.metadataTags).length > 0 && (
                <div className="space-y-1">
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px]">Extended Element Tags</div>
                  <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-1">
                    {Object.entries(currentInstance.metadataTags).map(([tag, val]) => (
                      <div key={tag}>
                        ({tag}): <span className="text-neutral-300">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-800 flex justify-end bg-neutral-950">
              <button
                onClick={() => setShowTagInspector(false)}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
