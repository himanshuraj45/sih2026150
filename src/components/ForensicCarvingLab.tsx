'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Database,
  FileCheck2,
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

type Status =
  | 'SIGNATURE FOUND'
  | 'SIMULATED RECOVERY'
  | 'VALIDATED';

type Candidate = {
  name: string;
  type: string;
  size: string;
  offset: string;
  confidence: number;
  status: Status;
  hash: string;
  preview?: string;
};

type Event = {
  action: string;
  time: string;
  hash: string;
};

const DEMO_IMAGE = {
  name: 'nexora-training-evidence-01.dd',
  id: 'EVD-NX-DEMO-0042',
  size: '4.00 GB',
  date: '2026-08-14 09:42 UTC',
  examiner: 'Demo Examiner / NEXORA Lab',
};

const INITIAL_CANDIDATES: Candidate[] = [
  {
    name: 'cam02_20260814_0915.mp4',
    type: 'MP4',
    size: '86.4 MB',
    offset: '0x01A4F000',
    confidence: 98,
    status: 'SIMULATED RECOVERY',
    hash: '',
    preview: '/cctv-gate%20cam%203.mp4',
  },
  {
    name: 'loading-bay_segment.mov',
    type: 'MOV',
    size: '142.8 MB',
    offset: '0x0C42B800',
    confidence: 94,
    status: 'SIMULATED RECOVERY',
    hash: '',
    preview: '/cctv-gate.mp4',
  },
  {
    name: 'archive_fragment_07.avi',
    type: 'AVI',
    size: '64.1 MB',
    offset: '0x1F8C2000',
    confidence: 88,
    status: 'SIGNATURE FOUND',
    hash: '',
    preview: '/cctv-gatewalking.mp4',
  },
  {
    name: 'night-shift_telemetry.mkv',
    type: 'MKV',
    size: '218.6 MB',
    offset: '0x2A11D000',
    confidence: 81,
    status: 'SIGNATURE FOUND',
    hash: '',
  },
];

async function makeHash(text: string) {
  if (!window.crypto?.subtle) {
    return 'DEMO-HASH-ONLY';
  }

  const data = new TextEncoder().encode(text);

  const result = await window.crypto.subtle.digest(
    'SHA-256',
    data,
  );

  return Array.from(new Uint8Array(result))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

function timeText(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `00:${String(minutes).padStart(2, '0')}:${String(
    secs,
  ).padStart(2, '0')}`;
}

export default function ForensicCarvingLab() {
  const [loaded, setLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [imageHash, setImageHash] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>(
    INITIAL_CANDIDATES,
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [preview, setPreview] = useState<Candidate | null>(
    null,
  );

  const completionAdded = useRef(false);

  /* Generate demo evidence hash */
  useEffect(() => {
    if (!loaded) return;

    makeHash(
      `${DEMO_IMAGE.name}-${DEMO_IMAGE.id}-NEXORA-DEMO`,
    ).then((hash) => {
      setImageHash(hash);

      setCandidates((old) =>
        old.map((candidate, index) => ({
          ...candidate,
          hash:
            hash.slice(0, 48) +
            String(index + 1) +
            hash.slice(49),
        })),
      );
    });
  }, [loaded]);

  /* Scan progress */
  useEffect(() => {
    if (!scanning) return;

    const interval = window.setInterval(() => {
      setProgress((old) => {
        const next = Math.min(old + 2, 100);

        if (next === 100) {
          setScanning(false);
        }

        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [scanning]);

  /* Scan timer */
  useEffect(() => {
    if (!scanning) return;

    const interval = window.setInterval(() => {
      setElapsed((old) => old + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [scanning]);

  /* Add completion event only once */
  useEffect(() => {
    if (
      !loaded ||
      progress !== 100 ||
      completionAdded.current
    ) {
      return;
    }

    completionAdded.current = true;

    setEvents((old) => [
      ...old,
      {
        action:
          'Simulated video signatures recorded for review',
        time: new Date().toISOString(),
        hash: imageHash,
      },
    ]);
  }, [loaded, progress, imageHash]);

  const loadEvidence = () => {
    completionAdded.current = false;

    setLoaded(true);
    setScanning(false);
    setProgress(0);
    setElapsed(0);
    setEvents([]);
    setPreview(null);
    setCandidates(INITIAL_CANDIDATES);
    setImageHash('');
  };

  const reset = () => {
    completionAdded.current = false;

    setLoaded(false);
    setScanning(false);
    setProgress(0);
    setElapsed(0);
    setEvents([]);
    setPreview(null);
    setCandidates(INITIAL_CANDIDATES);
    setImageHash('');
  };

  const startScan = () => {
    if (!loaded || scanning) return;

    if (progress === 100) {
      completionAdded.current = false;
      setProgress(0);
      setElapsed(0);
    }

    setEvents((old) => [
      ...old,
      {
        action: 'Read-only carving simulation started',
        time: new Date().toISOString(),
        hash: imageHash || 'PENDING',
      },
    ]);

    completionAdded.current = false;
    setProgress(0);
    setElapsed(0);
    setScanning(true);
  };

  const validate = (name: string) => {
    const candidate = candidates.find(
      (item) => item.name === name,
    );

    if (!candidate || candidate.status === 'VALIDATED') {
      return;
    }

    setCandidates((old) =>
      old.map((item) =>
        item.name === name
          ? {
              ...item,
              status: 'VALIDATED',
            }
          : item,
      ),
    );

    setEvents((old) => [
      ...old,
      {
        action: `Candidate validated: ${name}`,
        time: new Date().toISOString(),
        hash: candidate.hash || imageHash,
      },
    ]);
  };

  const detected =
    progress >= 75 ? candidates : progress >= 30
      ? candidates.slice(0, 1)
      : [];

  const validated = candidates.filter(
    (item) => item.status === 'VALIDATED',
  ).length;

  const statusText = scanning
    ? 'CARVING SIMULATION ACTIVE'
    : progress === 100
      ? 'SCAN COMPLETE / DEMO RESULTS'
      : loaded
        ? 'EVIDENCE READY'
        : 'AWAITING DEMO EVIDENCE';

  return (
    <main className="forensic-root min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-8">

        {/* HEADER */}
        <header className="border-b border-[var(--border-primary)] pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-[9px] font-mono tracking-[0.25em] text-[var(--gold-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--alert-green)]" />
                NEXORA / FORENSIC OPERATIONS / DEMO WORKFLOW
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-bold tracking-[0.12em] text-[var(--text-heading)] sm:text-4xl">
                  FORENSIC CARVING LAB
                </h1>

                <span className="border border-[var(--alert-orange)]/50 bg-[var(--alert-orange)]/10 px-2 py-1 text-[9px] font-mono font-bold tracking-widest text-[var(--alert-orange)]">
                  DEMO / READ-ONLY
                </span>
              </div>

              <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
                Controlled signature-detection walkthrough for
                prepared sample evidence.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadEvidence}
                className="inline-flex items-center gap-2 bg-[var(--gold-primary)] px-4 py-2.5 text-[10px] font-mono font-bold tracking-widest text-black"
              >
                <Database className="h-3.5 w-3.5" />
                LOAD DEMO EVIDENCE
              </button>

              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-panel)] px-4 py-2.5 text-[10px] font-mono tracking-widest text-[var(--text-secondary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                RESET DEMO
              </button>

              <a
                href="/forensics"
                className="inline-flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-panel)] px-4 py-2.5 text-[10px] font-mono tracking-widest text-[var(--text-secondary)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                FORENSIC WORKSPACE
              </a>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 border border-[var(--border-cyan)] bg-[var(--cyan-glow)] p-3 text-xs text-[var(--text-secondary)]">
            <Info className="mt-0.5 h-4 w-4 text-[var(--cyan-primary)]" />

            <span>
              <strong className="text-[var(--cyan-primary)]">
                READ-ONLY DEMONSTRATION:
              </strong>{' '}
              No physical storage device is accessed or modified.
            </span>
          </div>
        </header>

        {/* TOP */}
        <div className="mt-5 grid gap-5 xl:grid-cols-2">

          {/* EVIDENCE */}
          <section className="glass-panel overflow-hidden">
            <PanelHeader
              icon={<ShieldCheck />}
              title="EVIDENCE IMAGE"
              right="SOURCE REGISTER"
            />

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-[var(--border-active)] bg-[var(--gold-primary)]/10 text-[var(--gold-primary)]">
                  <HardDrive className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-mono text-sm text-[var(--text-heading)]">
                    {loaded
                      ? DEMO_IMAGE.name
                      : 'No demo image loaded'}
                  </p>

                  <p className="mt-1 text-[10px] font-mono text-[var(--text-muted)]">
                    {loaded
                      ? 'PREPARED SAMPLE / EVIDENCE IMAGE'
                      : 'Load demo evidence to begin'}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[var(--border-secondary)] py-4">
                <Detail
                  label="EVIDENCE ID"
                  value={loaded ? DEMO_IMAGE.id : '—'}
                />

                <Detail
                  label="IMAGE SIZE"
                  value={loaded ? DEMO_IMAGE.size : '—'}
                />

                <Detail
                  label="ACQUISITION DATE"
                  value={loaded ? DEMO_IMAGE.date : '—'}
                />

                <Detail
                  label="EXAMINER"
                  value={loaded ? DEMO_IMAGE.examiner : '—'}
                />
              </div>

              <div className="mt-5">
                <p className="hud-label">
                  SHA-256 / PREPARED MANIFEST
                </p>

                <p className="mt-2 break-all font-mono text-[10px] leading-5 text-[var(--cyan-primary)]">
                  {loaded
                    ? imageHash || 'GENERATING...'
                    : '—'}
                </p>
              </div>
            </div>
          </section>

          {/* CONTROL */}
          <section className="glass-panel overflow-hidden">
            <PanelHeader
              icon={<ScanLine />}
              title="CARVING CONTROL"
              right={statusText}
            />

            <div className="p-5">

              <div className="flex items-center justify-between">
                <div>
                  <p className="hud-label">
                    SIMULATION ENGINE
                  </p>

                  <p className="mt-1 font-mono text-sm text-[var(--text-heading)]">
                    VIDEO SIGNATURE SCANNER
                    <span className="text-[var(--text-muted)]">
                      {' '}
                      / v0.5 DEMO
                    </span>
                  </p>
                </div>

                <span className="text-[9px] font-mono text-[var(--text-muted)]">
                  {scanning ? 'RUNNING' : 'IDLE'}
                </span>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <span className="font-mono text-4xl font-bold text-[var(--gold-primary)]">
                  {progress}%
                </span>

                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {timeText(elapsed)}
                </span>
              </div>

              <div className="mt-3 h-2 bg-white/[0.06]">
                <div
                  className="h-full bg-[linear-gradient(90deg,var(--cyan-primary),var(--gold-primary))] transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric
                  label="SECTORS"
                  value={Math.floor(
                    (progress / 100) * 104857600,
                  ).toLocaleString()}
                />

                <Metric
                  label="BYTES"
                  value={`${(
                    (progress / 100) *
                    4096
                  ).toFixed(2)} MB`}
                />

                <Metric
                  label="DETECTED"
                  value={String(detected.length)}
                />

                <Metric
                  label="TIME"
                  value={timeText(elapsed)}
                />
              </div>

              <button
                type="button"
                onClick={startScan}
                disabled={!loaded || scanning}
                className="mt-6 flex w-full items-center justify-center gap-2 bg-[var(--gold-primary)] px-4 py-3.5 text-[11px] font-mono font-bold tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ScanLine className="h-4 w-4" />

                {scanning
                  ? 'CARVING SAMPLE EVIDENCE...'
                  : progress === 100
                    ? 'RESTART FORENSIC CARVING'
                    : 'BEGIN FORENSIC CARVING'}
              </button>

              <p className="mt-3 text-center text-[9px] font-mono text-[var(--text-muted)]">
                No raw-drive access / no writes / demo telemetry only
              </p>
            </div>
          </section>
        </div>

        {/* DETECTION */}
        <section className="mt-5 glass-panel overflow-hidden">
          <PanelHeader
            icon={<FileVideo />}
            title="SIGNATURE DETECTION"
            right={`${detected.length} CANDIDATES`}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-[var(--border-secondary)] text-[9px] font-mono tracking-widest text-[var(--text-muted)]">
                  <th className="px-5 py-3">
                    FILE SIGNATURE
                  </th>
                  <th className="px-3 py-3">TYPE</th>
                  <th className="px-3 py-3">SIZE</th>
                  <th className="px-3 py-3">OFFSET</th>
                  <th className="px-3 py-3">
                    CONFIDENCE
                  </th>
                  <th className="px-3 py-3">STATUS</th>
                  <th className="px-5 py-3 text-right">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>
                {detected.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <ScanLine className="mx-auto h-7 w-7 text-[var(--text-muted)]" />

                      <p className="mt-3 font-mono text-xs tracking-widest text-[var(--text-muted)]">
                        LOAD EVIDENCE AND START THE SCAN
                      </p>
                    </td>
                  </tr>
                ) : (
                  detected.map((candidate) => (
                    <tr
                      key={candidate.name}
                      className="border-b border-[var(--border-secondary)]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FileVideo className="h-4 w-4 text-[var(--cyan-primary)]" />

                          <span className="font-mono text-xs text-[var(--text-heading)]">
                            {candidate.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4 font-mono text-[10px] text-[var(--text-secondary)]">
                        {candidate.type}
                      </td>

                      <td className="px-3 py-4 font-mono text-[10px] text-[var(--text-secondary)]">
                        {candidate.size}
                      </td>

                      <td className="px-3 py-4 font-mono text-[10px] text-[var(--text-muted)]">
                        {candidate.offset}
                      </td>

                      <td className="px-3 py-4">
                        <span className="font-mono text-[10px] text-[var(--alert-green)]">
                          {candidate.confidence}%
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <Status status={candidate.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={
                            candidate.status ===
                            'VALIDATED'
                          }
                          onClick={() =>
                            validate(candidate.name)
                          }
                          className="inline-flex items-center gap-1.5 border border-[var(--border-secondary)] px-3 py-2 text-[8px] font-mono tracking-widest text-[var(--text-secondary)] disabled:opacity-40"
                        >
                          {candidate.status ===
                          'VALIDATED' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              VALIDATED
                            </>
                          ) : (
                            <>
                              <FileCheck2 className="h-3 w-3" />
                              VALIDATE
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CUSTODY */}
        <section className="mt-5 glass-panel overflow-hidden">
          <PanelHeader
            icon={<Fingerprint />}
            title="CHAIN OF CUSTODY"
            right="APPEND-ONLY DEMO LOG"
          />

          <div className="p-5">
            {events.length === 0 ? (
              <div className="py-5 text-center">
                <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                  SCAN EVENTS WILL APPEAR HERE
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div
                    key={`${event.action}-${index}`}
                    className="border-l border-[var(--border-active)] pl-4"
                  >
                    <p className="font-mono text-[10px] text-[var(--text-heading)]">
                      {event.action}
                    </p>

                    <p className="mt-1 font-mono text-[9px] text-[var(--text-muted)]">
                      {new Date(
                        event.time,
                      ).toLocaleString()}
                      {' / '}
                      {event.hash.slice(0, 16)}...
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border-secondary)] pt-4">
              <div>
                <p className="hud-label">
                  EVIDENCE ID
                </p>

                <p className="mt-1 font-mono text-xs text-[var(--gold-primary)]">
                  {loaded ? DEMO_IMAGE.id : '—'}
                </p>
              </div>

              <div>
                <p className="hud-label">
                  VALIDATED
                </p>

                <p className="mt-1 font-mono text-xs text-[var(--alert-green)]">
                  {validated} / {candidates.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="mt-5 glass-panel overflow-hidden">
          <PanelHeader
            icon={<FileVideo />}
            title="RECOVERED EVIDENCE GALLERY"
            right="PREVIEW ONLY"
          />

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {detected.map((candidate, index) => (
              <article
                key={candidate.name}
                className="overflow-hidden border border-[var(--border-secondary)] bg-black/20"
              >
                <div className="relative aspect-video bg-[#0b1018]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:18px_18px]" />

                  <span className="absolute left-3 top-3 border border-white/20 bg-black/50 px-2 py-1 text-[8px] font-mono text-white/70">
                    FRAME{' '}
                    {String(
                      120 + index * 37,
                    ).padStart(4, '0')}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPreview(candidate)
                    }
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white">
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </button>
                </div>

                <div className="p-3">
                  <p className="truncate font-mono text-xs text-[var(--text-heading)]">
                    {candidate.name}
                  </p>

                  <p className="mt-2 font-mono text-[9px] text-[var(--text-muted)]">
                    {candidate.type} / {candidate.size}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono text-[var(--alert-green)]">
                    <Check className="h-3 w-3" />
                    {candidate.status ===
                    'VALIDATED'
                      ? 'VALIDATED CANDIDATE'
                      : 'SIGNATURE MATCH'}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreview(candidate)
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 border border-[var(--border-secondary)] px-2 py-2 text-[9px] font-mono tracking-widest text-[var(--text-secondary)]"
                  >
                    <Play className="h-3 w-3" />
                    PREVIEW EVIDENCE
                  </button>
                </div>
              </article>
            ))}

            {detected.length === 0 && (
              <p className="col-span-full py-8 text-center font-mono text-xs text-[var(--text-muted)]">
                RECOVERED CANDIDATES WILL APPEAR AFTER SCANNING
              </p>
            )}
          </div>
        </section>

        {/* WORKFLOW */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Workflow
            number="01"
            title="SIGNATURE DETECTION"
            text="Prepared sample sectors are scanned for simulated CCTV video signatures."
          />

          <Workflow
            number="02"
            title="RECOVERY CANDIDATE"
            text="Detected signatures become review candidates with confidence and offset metadata."
          />

          <Workflow
            number="03"
            title="VALIDATION"
            text="A human reviewer can validate a candidate in the demonstration workflow."
          />
        </div>

        <footer className="mt-6 flex items-center justify-between border-t border-[var(--border-secondary)] py-4 text-[9px] font-mono text-[var(--text-muted)]">
          <span>
            NEXORA FORENSIC CARVING LAB / DEMO BUILD
          </span>

          <span className="flex items-center gap-1.5">
            <LockKeyhole className="h-3 w-3" />
            READ-ONLY
          </span>
        </footer>
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="glass-panel w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-secondary)] p-4">
              <div>
                <p className="font-mono text-xs text-[var(--text-heading)]">
                  {preview.name}
                </p>

                <p className="mt-1 text-[9px] font-mono text-[var(--alert-orange)]">
                  SIMULATED RECOVERY / PREVIEW ONLY
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-[var(--text-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-black p-4">
              {preview.preview ? (
                <video
                  controls
                  autoPlay
                  muted
                  className="aspect-video w-full"
                >
                  <source
                    src={preview.preview}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <p className="font-mono text-xs text-[var(--text-muted)]">
                    NO LOCAL SAMPLE VIDEO REGISTERED
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function PanelHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-secondary)] px-5 py-3">
      <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest">
        {icon}
        {title}
      </div>

      <span className="text-[8px] font-mono text-[var(--text-muted)]">
        {right}
      </span>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="hud-label">{label}</p>

      <p className="mt-1 break-words font-mono text-[10px] text-[var(--text-secondary)]">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-[var(--border-secondary)] p-3">
      <p className="text-[8px] font-mono text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 font-mono text-sm text-[var(--text-heading)]">
        {value}
      </p>
    </div>
  );
}

function Status({
  status,
}: {
  status: Status;
}) {
  const isValid = status === 'VALIDATED';
  const isRecovery =
    status === 'SIMULATED RECOVERY';

  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-1 text-[8px] font-mono tracking-wider ${
        isValid
          ? 'border-[var(--alert-green)]/40 text-[var(--alert-green)]'
          : isRecovery
            ? 'border-[var(--alert-orange)]/40 text-[var(--alert-orange)]'
            : 'border-[var(--cyan-primary)]/40 text-[var(--cyan-primary)]'
      }`}
    >
      {isValid ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <ScanLine className="h-3 w-3" />
      )}

      {status}
    </span>
  );
}

function Workflow({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <section className="glass-panel p-4">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 items-center justify-center border border-[var(--border-active)] text-[var(--cyan-primary)]">
          <span className="font-mono text-[9px]">
            {number}
          </span>
        </div>

        <div>
          <h3 className="font-mono text-[10px] font-bold tracking-widest text-[var(--text-heading)]">
            {title}
          </h3>

          <p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}