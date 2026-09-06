'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  Database,
  Download,
  FileArchive,
  FileVideo,
  Fingerprint,
  HardDrive,
  Info,
  LockKeyhole,
  Play,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Timer,
  X,
} from 'lucide-react';

type RecoveryStatus = 'Simulated Recovery' | 'Signature Found';
type EvidenceFile = {
  name: string;
  format: 'MP4' | 'MOV' | 'AVI' | 'MKV';
  size: string;
  offset: string;
  confidence: number;
  status: RecoveryStatus;
  hash: string;
  accent: string;
  localVideoPath?: string;
};
type CustodyEvent = {
  action: string;
  timestamp: string;
  hash: string;
};

const SAMPLE_IMAGE = {
  filename: 'nexora-training-evidence-01.dd',
  size: '4.00 GB',
  evidenceId: 'EVD-NX-DEMO-0042',
  acquisitionDate: '2026-08-14 09:42 UTC',
  examiner: 'Demo Examiner / NEXORA Lab',
};

const baseFiles: EvidenceFile[] = [
  { name: 'cam02_20260814_0915.mp4', format: 'MP4', size: '86.4 MB', offset: '0x01A4F000', confidence: 98, status: 'Simulated Recovery', hash: '', accent: '#00E5FF', localVideoPath: '/cctv-gate%20cam%203.mp4' },
  { name: 'loading-bay_segment.mov', format: 'MOV', size: '142.8 MB', offset: '0x0C42B800', confidence: 94, status: 'Simulated Recovery', hash: '', accent: '#D4AF37', localVideoPath: '/cctv-gate.mp4' },
  { name: 'archive_fragment_07.avi', format: 'AVI', size: '64.1 MB', offset: '0x1F8C2000', confidence: 88, status: 'Signature Found', hash: '', accent: '#FF9500', localVideoPath: '/cctv-gatewalking.mp4' },
  { name: 'night-shift_telemetry.mkv', format: 'MKV', size: '218.6 MB', offset: '0x2A11D000', confidence: 81, status: 'Signature Found', hash: '', accent: '#00E676' },
];

async function sha256(value: string) {
  if (typeof crypto === 'undefined' || !crypto.subtle) return 'SIMULATED-HASH-DEMO-ONLY';
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function formatElapsed(seconds: number) {
  return `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function ForensicCarvingLab() {
  const [loaded, setLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [imageHash, setImageHash] = useState('GENERATING...');
  const [files, setFiles] = useState(baseFiles);
  const [events, setEvents] = useState<CustodyEvent[]>([]);
  const [previewFile, setPreviewFile] = useState<EvidenceFile | null>(null);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    void sha256(`${SAMPLE_IMAGE.filename}|${SAMPLE_IMAGE.evidenceId}|prepared-demo-image`).then((hash) => {
      if (cancelled) return;
      setImageHash(hash);
      setFiles((current) => current.map((file, index) => ({ ...file, hash: hash.slice(0, 32) + String(index + 1).padStart(2, '0') + hash.slice(34) })));
    });
    return () => { cancelled = true; };
  }, [loaded]);

  useEffect(() => {
    if (!scanning) return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + 2);
        if (next === 100) setScanning(false);
        return next;
      });
      setElapsed((current) => current + 1);
    }, 90);
    return () => window.clearInterval(timer);
  }, [scanning]);

  const sectors = Math.floor(progress * 1048576).toLocaleString();
  const bytes = `${(progress * 40.96).toFixed(2)} MB`;
  const visibleFiles = progress >= 30 ? files.slice(0, 1) : [];
  const displayedFiles = progress >= 75 ? files : visibleFiles;
  const latestEvent = events[events.length - 1];
  const statusLabel = scanning ? 'CARVING SIMULATION ACTIVE' : progress === 100 ? 'SCAN COMPLETE / DEMO RESULTS' : loaded ? 'EVIDENCE READY' : 'AWAITING DEMO EVIDENCE';

  const loadDemo = () => {
    setLoaded(true);
    setProgress(0);
    setElapsed(0);
    setScanning(false);
    setEvents([]);
  };

  const resetDemo = () => {
    setLoaded(false);
    setProgress(0);
    setElapsed(0);
    setImageHash('GENERATING...');
    setFiles(baseFiles);
    setEvents([]);
    setPreviewFile(null);
  };

  const beginScan = async () => {
    if (!loaded || scanning) return;
    const hash = imageHash === 'GENERATING...' ? await sha256(SAMPLE_IMAGE.filename) : imageHash;
    setEvents((current) => [...current, { action: 'Read-only carving simulation started', timestamp: new Date().toISOString(), hash }]);
    setProgress(0);
    setElapsed(0);
    setScanning(true);
  };

  useEffect(() => {
    if (progress !== 100 || latestEvent?.action === 'Simulated signatures recorded') return;
    setEvents((current) => [...current, { action: 'Simulated signatures recorded for review', timestamp: new Date().toISOString(), hash: imageHash }]);
  }, [progress, imageHash, latestEvent?.action]);

  const scanBars = useMemo(() => Array.from({ length: 64 }, (_, index) => {
    const active = progress > (index / 64) * 100;
    return active ? (index % 7 === 0 ? 'bg-[var(--gold-primary)]' : 'bg-[var(--cyan-primary)]') : 'bg-white/[0.07]';
  }), [progress]);

  return (
    <main className="forensic-root min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-[1540px] px-4 py-5 sm:px-8 lg:px-12">
        <header className="border-b border-[var(--border-primary)] pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[9px] font-mono tracking-[0.28em] text-[var(--gold-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--alert-green)] shadow-[0_0_8px_var(--alert-green)]" />
                NEXORA / FORENSIC OPERATIONS / DEMO WORKFLOW
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-bold tracking-[0.12em] text-[var(--text-heading)] sm:text-4xl">FORENSIC CARVING LAB</h1>
                <span className="border border-[var(--alert-orange)]/50 bg-[var(--alert-orange)]/10 px-2 py-1 text-[9px] font-mono font-bold tracking-widest text-[var(--alert-orange)]">DEMO / READ-ONLY</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">A controlled signature-detection walkthrough for prepared sample evidence. Every result on this page is simulated for demonstration.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={loadDemo} className="inline-flex items-center gap-2 bg-[var(--gold-primary)] px-4 py-2.5 text-[10px] font-mono font-bold tracking-widest text-black hover:bg-[var(--gold-light)]"><Database className="h-3.5 w-3.5" /> LOAD DEMO EVIDENCE</button>
              <button type="button" onClick={resetDemo} className="inline-flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-panel)] px-4 py-2.5 text-[10px] font-mono tracking-widest text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]"><RotateCcw className="h-3.5 w-3.5" /> RESET DEMO</button>
              <a href="/forensics" className="inline-flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-panel)] px-4 py-2.5 text-[10px] font-mono tracking-widest text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]"><ArrowLeft className="h-3.5 w-3.5" /> FORENSIC WORKSPACE</a>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 border border-[var(--border-cyan)] bg-[var(--cyan-glow)] p-3 text-xs text-[var(--text-secondary)]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan-primary)]" /><span><strong className="text-[var(--cyan-primary)]">READ-ONLY DEMONSTRATION:</strong> This demonstration uses read-only sample evidence. No real storage device is modified.</span></div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <EvidenceCard loaded={loaded} hash={imageHash} />
          <section className="glass-panel overflow-hidden">
            <PanelHeader icon={<ScanLine />} title="CARVING CONTROL" right={statusLabel} />
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="hud-label">SIMULATION ENGINE</p><p className="mt-1 font-mono text-sm text-[var(--text-heading)]">VIDEO SIGNATURE SCANNER <span className="text-[var(--text-muted)]">/ v0.4 DEMO</span></p></div>
                <span className={`inline-flex w-fit items-center gap-2 border px-2 py-1 text-[9px] font-mono tracking-widest ${scanning ? 'border-[var(--alert-orange)]/50 text-[var(--alert-orange)]' : 'border-[var(--border-secondary)] text-[var(--text-muted)]'}`}><span className={`h-1.5 w-1.5 rounded-full ${scanning ? 'animate-pulse bg-[var(--alert-orange)]' : 'bg-[var(--text-muted)]'}`} />{scanning ? 'RUNNING' : 'IDLE'}</span>
              </div>
              <div className="mt-6 flex items-end justify-between"><div><span className="font-mono text-4xl font-bold tabular-nums text-[var(--gold-primary)]">{progress}%</span><span className="ml-2 text-[10px] font-mono tracking-widest text-[var(--text-muted)]">SECTOR COVERAGE</span></div><span className="font-mono text-xs tabular-nums text-[var(--text-secondary)]">{formatElapsed(elapsed)}</span></div>
              <div className="mt-3 h-2 overflow-hidden bg-white/[0.06]"><div className="h-full bg-[linear-gradient(90deg,var(--cyan-primary),var(--gold-primary))] transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric icon={<HardDrive />} label="SECTORS SCANNED" value={sectors} /><Metric icon={<Database />} label="BYTES PROCESSED" value={bytes} /><Metric icon={<FileVideo />} label="FILES DETECTED" value={String(displayedFiles.length)} /><Metric icon={<Timer />} label="ELAPSED TIME" value={formatElapsed(elapsed)} /></div>
              <div className="mt-6 border border-[var(--border-secondary)] bg-black/20 p-3"><div className="mb-2 flex items-center justify-between"><span className="hud-label">SECTOR TIMELINE / SIMULATED</span><span className="text-[9px] font-mono text-[var(--text-muted)]">0x00000000 — 0xFFFFFFFF</span></div><div className="grid h-14 grid-cols-64 items-end gap-[2px]">{scanBars.map((color, index) => <span key={index} className={`${color} h-full transition-colors duration-300`} style={{ opacity: 0.35 + ((index % 5) * 0.12) }} />)}</div></div>
              <button type="button" onClick={beginScan} disabled={!loaded || scanning} className="mt-6 flex w-full items-center justify-center gap-2 bg-[var(--gold-primary)] px-4 py-3.5 text-[11px] font-mono font-bold tracking-[0.18em] text-black transition-colors hover:bg-[var(--gold-light)] disabled:cursor-not-allowed disabled:opacity-40"><ScanLine className="h-4 w-4" /> {scanning ? 'CARVING SAMPLE EVIDENCE...' : progress === 100 ? 'RESTART FORENSIC CARVING' : 'BEGIN FORENSIC CARVING'}</button>
              <p className="mt-3 text-center text-[9px] font-mono tracking-wider text-[var(--text-muted)]">No raw-drive access / no writes / deterministic demo telemetry only</p>
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <section className="glass-panel overflow-hidden"><PanelHeader icon={<FileArchive />} title="SIGNATURE DETECTION" right={`${displayedFiles.length} CANDIDATES`} /><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-[var(--border-secondary)] text-[9px] font-mono tracking-widest text-[var(--text-muted)]"><th className="px-5 py-3">FILE SIGNATURE</th><th className="px-3 py-3">TYPE</th><th className="px-3 py-3">EST. SIZE</th><th className="px-3 py-3">OFFSET</th><th className="px-3 py-3">CONFIDENCE</th><th className="px-5 py-3 text-right">STATUS</th></tr></thead><tbody>{displayedFiles.length ? displayedFiles.map((file) => <tr key={file.name} className="border-b border-[var(--border-secondary)] last:border-0"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-[var(--border-secondary)]" style={{ color: file.accent }}><FileVideo className="h-4 w-4" /></span><span className="font-mono text-xs text-[var(--text-heading)]">{file.name}</span></div></td><td className="px-3 py-4 font-mono text-[10px] text-[var(--text-secondary)]">{file.format}</td><td className="px-3 py-4 font-mono text-[10px] text-[var(--text-secondary)]">{file.size}</td><td className="px-3 py-4 font-mono text-[10px] text-[var(--text-muted)]">{file.offset}</td><td className="px-3 py-4"><div className="flex items-center gap-2"><div className="h-1 w-16 bg-white/[0.08]"><div className="h-full bg-[var(--alert-green)]" style={{ width: `${file.confidence}%` }} /></div><span className="font-mono text-[10px] text-[var(--alert-green)]">{file.confidence}%</span></div></td><td className="px-5 py-4 text-right"><span className="inline-flex items-center gap-1 border border-[var(--alert-orange)]/40 bg-[var(--alert-orange)]/10 px-2 py-1 text-[8px] font-mono tracking-wider text-[var(--alert-orange)]"><CircleAlert className="h-3 w-3" /> {file.status.toUpperCase()}</span></td></tr>) : <tr><td colSpan={6} className="px-5 py-14 text-center"><ScanLine className="mx-auto h-7 w-7 text-[var(--text-muted)]" /><p className="mt-3 font-mono text-xs tracking-widest text-[var(--text-secondary)]">LOAD DEMO EVIDENCE TO ARM SIGNATURE DETECTION</p></td></tr>}</tbody></table></div></section>
          <CustodyPanel events={events} hash={imageHash} />
        </div>

        <section className="mt-5 glass-panel overflow-hidden"><PanelHeader icon={<FileVideo />} title="RECOVERED EVIDENCE GALLERY" right="PREVIEW ONLY" /><div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">{displayedFiles.map((file, index) => <article key={file.name} className="group overflow-hidden border border-[var(--border-secondary)] bg-black/20"><div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_25%_25%,rgba(0,229,255,0.18),transparent_35%),linear-gradient(135deg,#111827,#05060a)]"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '18px 18px' }} /><span className="absolute left-3 top-3 border border-white/20 bg-black/50 px-2 py-1 text-[8px] font-mono tracking-widest text-white/70">FRAME {String(120 + index * 37).padStart(4, '0')}</span><button type="button" onClick={() => setPreviewFile(file)} className="absolute inset-0 flex items-center justify-center opacity-80 transition-opacity hover:opacity-100" aria-label={`Preview ${file.name}`}><span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur"><Play className="ml-0.5 h-4 w-4 fill-current" /></span></button></div><div className="p-3"><p className="truncate font-mono text-xs text-[var(--text-heading)]">{file.name}</p><div className="mt-2 flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)]"><span>{file.format} / {file.size}</span><span className="text-[var(--alert-orange)]">SIMULATED</span></div><div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono text-[var(--alert-green)]"><BadgeCheck className="h-3.5 w-3.5" /> SIGNATURE MATCH</div><div className="mt-2 flex items-center gap-1 text-[8px] font-mono text-[var(--text-muted)]"><Fingerprint className="h-3 w-3" /> SHA-256 {file.hash ? `${file.hash.slice(0, 12)}...` : 'PENDING'}</div><button type="button" onClick={() => setPreviewFile(file)} className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-[var(--border-secondary)] px-2 py-2 text-[9px] font-mono tracking-widest text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]"><Play className="h-3 w-3" /> PREVIEW EVIDENCE</button></div></article>)}{!displayedFiles.length && <p className="col-span-full py-8 text-center font-mono text-xs tracking-widest text-[var(--text-muted)]">RECOVERED FILES WILL APPEAR AFTER THE SIMULATED SCAN</p>}</div></section>

        <footer className="mt-6 flex flex-col gap-2 border-t border-[var(--border-secondary)] py-4 text-[9px] font-mono tracking-wider text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between"><span>NEXORA FORENSIC CARVING LAB / DEMO BUILD / HUMAN VERIFICATION REQUIRED</span><span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3 w-3" /> READ-ONLY EVIDENCE PATH</span></footer>
      </div>
      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </main>
  );
}

function PanelHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right: string }) {
  return <div className="flex items-center justify-between border-b border-[var(--border-secondary)] px-4 py-3 sm:px-5"><div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.18em] text-[var(--text-heading)]">{icon}<span>{title}</span></div><span className="text-[8px] font-mono tracking-widest text-[var(--text-muted)]">{right}</span></div>;
}

function EvidenceCard({ loaded, hash }: { loaded: boolean; hash: string }) {
  return <section className="glass-panel overflow-hidden"><PanelHeader icon={<ShieldCheck />} title="EVIDENCE IMAGE" right="SOURCE REGISTER" /><div className="p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center border border-[var(--border-active)] bg-[var(--gold-primary)]/10 text-[var(--gold-primary)]"><HardDrive className="h-5 w-5" /></div><div><p className="font-mono text-sm text-[var(--text-heading)]">{loaded ? SAMPLE_IMAGE.filename : 'No demo image loaded'}</p><p className="mt-1 text-[10px] font-mono text-[var(--text-muted)]">{loaded ? 'PREPARED SAMPLE / EVIDENCE IMAGE' : 'Use Load Demo Evidence to begin'}</p></div></div>{loaded && <span className="inline-flex shrink-0 items-center gap-1 border border-[var(--alert-green)]/40 bg-[var(--alert-green)]/10 px-2 py-1 text-[8px] font-mono tracking-widest text-[var(--alert-green)]"><Check className="h-3 w-3" /> READ-ONLY EVIDENCE</span>}</div><div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-[var(--border-secondary)] py-4"><Detail label="EVIDENCE ID" value={loaded ? SAMPLE_IMAGE.evidenceId : '—'} /><Detail label="IMAGE SIZE" value={loaded ? SAMPLE_IMAGE.size : '—'} /><Detail label="ACQUISITION DATE" value={loaded ? SAMPLE_IMAGE.acquisitionDate : '—'} /><Detail label="EXAMINER" value={loaded ? SAMPLE_IMAGE.examiner : '—'} /></div><div className="mt-4"><div className="flex items-center justify-between"><span className="hud-label">SHA-256 / PREPARED MANIFEST</span><Fingerprint className="h-3.5 w-3.5 text-[var(--cyan-primary)]" /></div><p className="mt-2 break-all font-mono text-[10px] leading-5 text-[var(--cyan-primary)]">{loaded ? hash : 'Load demo evidence to generate a browser-side hash'}</p></div></div></section>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="hud-label">{label}</p><p className="mt-1 break-words font-mono text-[11px] text-[var(--text-secondary)]">{value}</p></div>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="border border-[var(--border-secondary)] bg-black/15 p-2.5"><div className="flex items-center gap-1.5 text-[var(--text-muted)]">{icon}<span className="text-[8px] font-mono tracking-wider">{label}</span></div><p className="mt-2 font-mono text-sm tabular-nums text-[var(--text-heading)]">{value}</p></div>; }

function CustodyPanel({ events, hash }: { events: CustodyEvent[]; hash: string }) {
  return <section className="glass-panel overflow-hidden"><PanelHeader icon={<ClipboardIcon />} title="CHAIN OF CUSTODY" right="APPEND-ONLY DEMO LOG" /><div className="p-4 sm:p-5">{events.length ? <div className="space-y-4">{events.map((event) => <div key={`${event.action}-${event.timestamp}`} className="relative border-l border-[var(--border-active)] pl-4"><span className="absolute -left-[4px] top-1 h-1.5 w-1.5 rounded-full bg-[var(--gold-primary)]" /><p className="font-mono text-[10px] text-[var(--text-heading)]">{event.action}</p><p className="mt-1 text-[9px] font-mono text-[var(--text-muted)]">{new Date(event.timestamp).toLocaleString()} / {event.hash.slice(0, 16)}...</p></div>)}</div> : <div className="py-5 text-center"><Clock3 className="mx-auto h-5 w-5 text-[var(--text-muted)]" /><p className="mt-2 text-[10px] font-mono tracking-wider text-[var(--text-muted)]">SCAN EVENTS WILL BE RECORDED HERE</p></div>}<div className="mt-5 border-t border-[var(--border-secondary)] pt-4"><p className="hud-label">EVIDENCE ID</p><p className="mt-1 font-mono text-xs text-[var(--gold-primary)]">{SAMPLE_IMAGE.evidenceId}</p><p className="mt-3 hud-label">CURRENT REGISTER HASH</p><p className="mt-1 break-all font-mono text-[9px] text-[var(--text-muted)]">{hash === 'GENERATING...' ? 'PENDING' : hash}</p></div></div></section>;
}

function ClipboardIcon() { return <Copy className="h-3.5 w-3.5" />; }

function PreviewModal({ file, onClose }: { file: EvidenceFile; onClose: () => void }) {
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label={`Preview ${file.name}`}><div className="glass-panel w-full max-w-3xl overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border-secondary)] px-4 py-3"><div><p className="font-mono text-xs text-[var(--text-heading)]">{file.name}</p><p className="mt-1 text-[9px] font-mono tracking-widest text-[var(--alert-orange)]">SIMULATED RECOVERY / PREVIEW EVIDENCE</p></div><button type="button" onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Close preview"><X className="h-4 w-4" /></button></div><div className="bg-black p-3 sm:p-5">{file.localVideoPath ? <video controls autoPlay muted className="aspect-video w-full bg-[#0b1018]" poster="/dark-matter-style.json"><source src={file.localVideoPath} type="video/mp4" />Your browser does not support the local CCTV video preview.</video> : <div className="flex aspect-video items-center justify-center bg-[#0b1018] text-center"><p className="max-w-sm px-5 font-mono text-xs tracking-wider text-[var(--text-muted)]">NO LOCAL SAMPLE CLIP IS REGISTERED FOR THIS SIMULATED SIGNATURE.</p></div>}</div><div className="flex flex-col gap-2 border-t border-[var(--border-secondary)] px-4 py-3 text-[9px] font-mono text-[var(--text-muted)] sm:flex-row sm:justify-between"><span>Preview uses prepared local CCTV evidence, not recovered raw-drive content.</span><span>{file.format} / {file.size}</span></div></div></div>;
}