'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  ChevronRight,
  ClipboardList,
  FileVideo,
  HardDrive,
  Plus,
  ScanLine,
  ShieldCheck,
  Upload,
  Video,
  X,
} from 'lucide-react';

type View = 'cases' | 'evidence' | 'device';

type CaseStatus =
  | 'Open'
  | 'Under Investigation'
  | 'Evidence Review'
  | 'Report Ready'
  | 'Closed';

type CaseRecord = {
  id: string;
  title: string;
  description: string;
  investigator: string;
  organisation: string;
  location: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  status: CaseStatus;
  evidence: number;
  updated: string;
};

const vendors = [
  'Dahua',
  'CP Plus',
  'Honeywell',
  'Hikvision',
  'TP-Link',
  'Godrej',
  'Uniview',
  'Matrix',
  'Other',
];

const evidenceSources = [
  'DVR/NVR export',
  'Local video file',
  'Forensic image',
  'Backup file',
  'Network capture',
  'Other',
];

const initialCases: CaseRecord[] = [
  {
    id: 'NX-2026-001',
    title: 'Warehouse Perimeter Incident',
    description:
      'Review of a reported movement near the north loading bay.',
    investigator: 'Unassigned',
    organisation: 'NEXORA DEMO UNIT',
    location: 'Sector 18, Noida',
    date: '2026-08-28',
    priority: 'High',
    status: 'Open',
    evidence: 0,
    updated: 'Just now',
  },
];

export default function ForensicAnalysis() {
  const [view, setView] = useState<View>('cases');
  const [cases, setCases] = useState<CaseRecord[]>(initialCases);
  const [activeCaseId, setActiveCaseId] = useState(initialCases[0].id);
  const [showCreate, setShowCreate] = useState(false);

  const activeCase =
    cases.find((item) => item.id === activeCaseId) ?? cases[0];

  const createCase = (record: CaseRecord) => {
    setCases((current) => [record, ...current]);
    setActiveCaseId(record.id);
    setShowCreate(false);
  };

  const openCase = (id: string) => {
    setActiveCaseId(id);
    setView('evidence');
  };

  return (
    <main className="forensic-root min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)]">
      <div className="mx-auto min-h-screen w-full max-w-[1480px] px-4 py-5 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-5 border-b border-[var(--border-primary)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-[var(--gold-primary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--alert-green)] shadow-[0_0_8px_var(--alert-green)]" />
              NEXORA / FORENSIC OPERATIONS / SIH 26150
            </div>

            <h1 className="font-mono text-2xl font-bold tracking-[0.14em] text-[var(--text-heading)] sm:text-4xl">
              FORENSIC WORKSPACE
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
              Vendor-agnostic DVR/NVR evidence intake and investigation control
              surface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-[var(--border-secondary)] px-3 py-2 text-[9px] font-mono tracking-widest text-[var(--text-muted)]">
              PROTOTYPE / HUMAN VERIFICATION REQUIRED
            </span>

            <a
              href="/"
              className="inline-flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-panel)] px-3 py-2 text-[10px] font-mono tracking-[0.16em] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              LIVE GRID
            </a>
          </div>
        </header>

        <nav
          className="my-5 flex max-w-full gap-1 overflow-x-auto border-b border-[var(--border-secondary)] pb-1"
          aria-label="Forensic workspace"
        >
          <NavButton
            active={view === 'cases'}
            icon={<ClipboardList />}
            onClick={() => setView('cases')}
          >
            CASE MANAGEMENT
          </NavButton>

          <NavButton
            active={view === 'evidence'}
            icon={<FileVideo />}
            onClick={() => setView('evidence')}
          >
            EVIDENCE INTAKE
          </NavButton>

          <NavButton
            active={view === 'device'}
            icon={<HardDrive />}
            onClick={() => setView('device')}
          >
            DEVICE IDENTIFICATION
          </NavButton>

          <a
            href="/forensics/carving"
            className="inline-flex shrink-0 items-center gap-2 border border-[var(--border-cyan)] px-3 py-2 text-[10px] font-mono tracking-widest text-[var(--cyan-primary)] hover:bg-[var(--cyan-glow)]"
          >
            <ScanLine className="h-3.5 w-3.5" />
            CARVING LAB
          </a>
        </nav>

        {view === 'cases' && (
          <CaseManagement
            cases={cases}
            activeCaseId={activeCaseId}
            onSelect={(id) => setActiveCaseId(id)}
            onOpen={openCase}
            onCreate={() => setShowCreate(true)}
          />
        )}

        {view === 'evidence' && (
          <EvidenceIntake activeCase={activeCase} />
        )}

        {view === 'device' && <DeviceIdentification />}

        <footer className="mt-8 border-t border-[var(--border-secondary)] py-4 text-[9px] font-mono tracking-wider text-[var(--text-muted)]">
          NEXORA FORENSIC PROTOTYPE / No automatic criminal identification /
          Evidence must be validated by authorised investigators
        </footer>
      </div>

      {showCreate && (
        <CreateCaseDialog
          onClose={() => setShowCreate(false)}
          onCreate={createCase}
        />
      )}
    </main>
  );
}

function CaseManagement({
  cases,
  activeCaseId,
  onSelect,
  onOpen,
  onCreate,
}: {
  cases: CaseRecord[];
  activeCaseId: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="hud-label">ACTIVE INVESTIGATIONS</p>

          <h2 className="mt-1 font-mono text-lg tracking-widest text-[var(--text-heading)]">
            CASE REGISTER
          </h2>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 bg-[var(--gold-primary)] px-4 py-2.5 text-[10px] font-mono font-bold tracking-widest text-black hover:bg-[var(--gold-light)]"
        >
          <Plus className="h-4 w-4" />
          CREATE NEW CASE
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="ACTIVE CASES"
          value={cases
            .filter((item) => item.status !== 'Closed')
            .length.toString()}
        />

        <Stat
          label="REGISTERED EVIDENCE"
          value={cases
            .reduce((sum, item) => sum + item.evidence, 0)
            .toString()}
        />

        <Stat label="PENDING REVIEW" value="0" />

        <Stat label="WORKFLOW" value="PROTOTYPE" tone="cyan" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {cases.map((item) => (
          <article
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`glass-panel cursor-pointer p-4 transition-colors ${
              activeCaseId === item.id
                ? 'border-[var(--border-active)]'
                : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-mono tracking-widest text-[var(--gold-primary)]">
                  {item.id}
                </p>

                <h3 className="mt-2 font-mono text-sm font-bold tracking-wider text-[var(--text-heading)]">
                  {item.title}
                </h3>
              </div>

              <StatusBadge status={item.status} />
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {item.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[var(--border-secondary)] py-3 text-[10px] font-mono">
              <Detail label="LOCATION" value={item.location} />

              <Detail
                label="PRIORITY"
                value={item.priority}
                tone={item.priority === 'High' ? 'red' : undefined}
              />

              <Detail label="INVESTIGATOR" value={item.investigator} />

              <Detail
                label="EVIDENCE"
                value={`${item.evidence} ITEMS`}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={() => onOpen(item.id)}>
                OPEN CASE
                <ChevronRight className="h-3.5 w-3.5" />
              </ActionButton>

              <ActionButton onClick={() => onOpen(item.id)}>
                VIEW EVIDENCE
              </ActionButton>

              <ActionButton onClick={() => onSelect(item.id)}>
                TIMELINE
              </ActionButton>

              <ActionButton onClick={() => onSelect(item.id)}>
                GENERATE REPORT
              </ActionButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvidenceIntake({ activeCase }: { activeCase: CaseRecord }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [source, setSource] = useState(evidenceSources[1]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  return (
    <section>
      <div className="mb-5">
        <p className="hud-label">CASE {activeCase.id}</p>

        <h2 className="mt-1 font-mono text-lg tracking-widest text-[var(--text-heading)]">
          EVIDENCE ACQUISITION
        </h2>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Register source material before analysis. No file is uploaded to a
          server in this prototype.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="glass-panel overflow-hidden">
          <PanelTitle
            icon={<Video />}
            label="EVIDENCE FILE"
            right="LOCAL SESSION"
          />

          <div className="p-4 sm:p-6">
            {preview ? (
              <div className="relative overflow-hidden border border-[var(--border-secondary)] bg-black">
                <video
                  controls
                  className="aspect-video w-full object-contain"
                  src={preview}
                />

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Remove selected video"
                  className="absolute right-3 top-3 bg-black/75 p-2 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex aspect-video w-full flex-col items-center justify-center border border-dashed border-[var(--border-active)] bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(0,229,255,0.03))] px-6 text-center hover:border-[var(--gold-primary)]"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center border border-[var(--border-cyan)] text-[var(--cyan-primary)]">
                  <Upload className="h-5 w-5" />
                </span>

                <span className="font-mono text-xs font-bold tracking-[0.18em] text-[var(--text-heading)]">
                  REGISTER VIDEO EVIDENCE
                </span>

                <span className="mt-2 text-xs text-[var(--text-muted)]">
                  MP4, MOV, AVI, or WEBM / local preview only
                </span>
              </button>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={chooseFile}
              className="hidden"
            />

            {file && (
              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
                <FileVideo className="h-3.5 w-3.5 text-[var(--gold-primary)]" />

                <span className="truncate">{file.name}</span>

                <span className="ml-auto text-[var(--text-muted)]">
                  {(file.size / 1048576).toFixed(1)} MB
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel">
          <PanelTitle
            icon={<ClipboardList />}
            label="EVIDENCE REGISTER"
            right="INTAKE FORM"
          />

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <ReadOnlyField label="CASE ID" value={activeCase.id} />

            <Field label="EVIDENCE ID" placeholder="EVD-NX-0001" />

            <Field label="CAMERA ID" placeholder="CAM-02" />

            <Field
              label="CAMERA LOCATION"
              placeholder="North loading bay"
            />

            <SelectField label="VENDOR" options={vendors} />

            <Field label="DVR / NVR MODEL" placeholder="Model identifier" />

            <SelectField
              label="EVIDENCE SOURCE"
              options={evidenceSources}
              value={source}
              onChange={setSource}
            />

            <Field
              label="INVESTIGATOR"
              placeholder="Authorised investigator"
            />

            <Field label="ACQUISITION DATE" type="datetime-local" />

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[9px] font-mono tracking-[0.2em] text-[var(--text-muted)]">
                INCIDENT DESCRIPTION
              </span>

              <textarea
                rows={3}
                placeholder="Context and investigative purpose..."
                className="field-input w-full resize-y"
              />
            </label>
          </div>
        </section>
      </div>

      <section className="glass-panel mt-5">
        <PanelTitle
          icon={<ShieldCheck />}
          label="ACQUISITION WORKFLOW"
          right="PROTOTYPE STATUS"
        />

        <div className="grid gap-3 p-4 sm:grid-cols-5 sm:p-6">
          {[
            'Evidence registered',
            'File received',
            'Metadata extracted',
            'Hash generated',
            'Ready for analysis',
          ].map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3 sm:block"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border text-[10px] font-mono ${
                  index === 0 && file
                    ? 'border-[var(--alert-green)] text-[var(--alert-green)]'
                    : 'border-[var(--border-secondary)] text-[var(--text-muted)]'
                }`}
              >
                {index === 0 && file ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
              </span>

              <span className="text-[10px] font-mono tracking-wider text-[var(--text-secondary)]">
                {step}
              </span>

              {index < 4 && (
                <ChevronRight className="ml-auto hidden h-3.5 w-3.5 text-[var(--text-muted)] sm:block" />
              )}
            </div>
          ))}
        </div>

        <p className="px-4 pb-4 text-[9px] font-mono tracking-wider text-[var(--text-muted)] sm:px-6">
          Hashing, metadata extraction, validation, and chain-of-custody
          persistence are reserved for later phases.
        </p>
      </section>
    </section>
  );
}

function DeviceIdentification() {
  const [vendor, setVendor] = useState('');
  const [detected, setDetected] = useState(false);

  return (
    <section>
      <div className="mb-5">
        <p className="hud-label">SOURCE ANALYSIS</p>

        <h2 className="mt-1 font-mono text-lg tracking-widest text-[var(--text-heading)]">
          DVR / NVR DEVICE IDENTIFICATION
        </h2>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Capture device context before evidence acquisition. Direct network
          discovery is not connected in this prototype.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="glass-panel">
          <PanelTitle
            icon={<HardDrive />}
            label="DEVICE PROFILE"
            right="MANUAL / DEMO"
          />

          <div className="space-y-4 p-4 sm:p-6">
            <SelectField
              label="VENDOR"
              options={['Select vendor', ...vendors]}
              value={vendor || 'Select vendor'}
              onChange={(value) => {
                setVendor(value === 'Select vendor' ? '' : value);
                setDetected(false);
              }}
            />

            <Field label="DEVICE MODEL" placeholder="Model or series" />

            <Field label="SERIAL NUMBER" placeholder="Serial number" />

            <Field
              label="FIRMWARE VERSION"
              placeholder="Firmware version"
            />

            <Field
              label="DEVICE IP / SOURCE IDENTIFIER"
              placeholder="IP, export path, or evidence ID"
            />

            <SelectField
              label="EVIDENCE SOURCE TYPE"
              options={[
                'DVR/NVR export',
                'Forensic image',
                'Backup file',
                'Network capture',
              ]}
            />

            <SelectField
              label="ACQUISITION METHOD"
              options={[
                'Manual export',
                'Forensic copy',
                'Source image',
                'To be determined',
              ]}
            />

            <button
              type="button"
              onClick={() => setDetected(true)}
              className="flex w-full items-center justify-center gap-2 bg-[var(--gold-primary)] px-4 py-3 text-[10px] font-mono font-bold tracking-[0.2em] text-black hover:bg-[var(--gold-light)]"
            >
              <Camera className="h-3.5 w-3.5" />
              DETECT DEVICE
              <span className="text-[8px] opacity-60">DEMO</span>
            </button>
          </div>
        </section>

        <section className="glass-panel">
          <PanelTitle
            icon={<Building2 />}
            label="COMPATIBILITY ASSESSMENT"
            right={detected ? 'DEMO RESULT' : 'AWAITING INPUT'}
          />

          {detected ? (
            <div className="space-y-3 p-4 sm:p-6">
              <div className="border border-[var(--border-cyan)] bg-[var(--cyan-glow)] p-4">
                <p className="text-[9px] font-mono tracking-widest text-[var(--cyan-primary)]">
                  DEMO DEVICE PROFILE
                </p>

                <p className="mt-2 font-mono text-sm text-[var(--text-heading)]">
                  {vendor || 'UNSPECIFIED'} / MODEL PENDING
                </p>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  This result is a prototype compatibility assessment, not a
                  live device connection.
                </p>
              </div>

              <Compatibility
                label="Supported workflow"
                value="Evidence export intake"
                tone="green"
              />

              <Compatibility
                label="Metadata extraction"
                value="Planned / format dependent"
              />

              <Compatibility
                label="Video analysis"
                value="Planned / human verified"
              />

              <Compatibility
                label="Recovery support"
                value="Prototype only"
                tone="gold"
              />

              <Compatibility
                label="Direct device acquisition"
                value="Not connected"
                tone="red"
              />
            </div>
          ) : (
            <EmptyState
              icon={<HardDrive />}
              title="NO DEVICE PROFILE"
              description="Select a vendor and record source identifiers to generate a clearly labelled prototype assessment."
            />
          )}
        </section>
      </div>
    </section>
  );
}

function CreateCaseDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (record: CaseRecord) => void;
}) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [investigator, setInvestigator] = useState('');
  const [priority, setPriority] =
    useState<CaseRecord['priority']>('Medium');

  const submitCase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      id: `NX-2026-${String(Date.now()).slice(-3)}`,
      title: title || 'Untitled Investigation',
      description: 'New investigation case awaiting intake details.',
      investigator: investigator || 'Unassigned',
      organisation: 'NEXORA INVESTIGATION UNIT',
      location: location || 'To be determined',
      date: new Date().toISOString().slice(0, 10),
      priority,
      status: 'Open',
      evidence: 0,
      updated: 'Just now',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-xl">
        <PanelTitle
          icon={<Plus />}
          label="CREATE INVESTIGATION CASE"
          right="NEW REGISTER"
        />

        <form onSubmit={submitCase} className="space-y-4 p-4 sm:p-6">
          <Field
            label="CASE TITLE"
            placeholder="Investigation title"
            value={title}
            onChange={setTitle}
          />

          <Field
            label="LOCATION"
            placeholder="Incident location"
            value={location}
            onChange={setLocation}
          />

          <Field
            label="INVESTIGATOR"
            placeholder="Authorised investigator"
            value={investigator}
            onChange={setInvestigator}
          />

          <SelectField
            label="CASE PRIORITY"
            options={['Low', 'Medium', 'High']}
            value={priority}
            onChange={(value) =>
              setPriority(value as CaseRecord['priority'])
            }
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--border-secondary)] px-4 py-2 text-[10px] font-mono tracking-widest text-[var(--text-secondary)]"
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="bg-[var(--gold-primary)] px-4 py-2 text-[10px] font-mono font-bold tracking-widest text-black"
            >
              CREATE CASE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NavButton({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[9px] font-mono tracking-[0.16em] ${
        active
          ? 'border-[var(--gold-primary)] text-[var(--gold-primary)]'
          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function PanelTitle({
  icon,
  label,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  right: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[var(--text-heading)]">
        <span className="text-[var(--cyan-primary)]">{icon}</span>
        {label}
      </div>

      <span className="text-[9px] font-mono tracking-widest text-[var(--text-muted)]">
        {right}
      </span>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-mono tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={
          onChange
            ? (event) => onChange(event.target.value)
            : undefined
        }
        placeholder={placeholder}
        className="field-input w-full"
      />
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-[9px] font-mono tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </span>

      <div className="field-input w-full text-[var(--cyan-primary)]">
        {value}
      </div>
    </div>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-mono tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </span>

      <select
        value={value}
        onChange={
          onChange
            ? (event) => onChange(event.target.value)
            : undefined
        }
        className="field-input w-full"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'cyan';
}) {
  return (
    <div className="glass-panel-sm p-3">
      <p className="hud-label">{label}</p>

      <p
        className={`mt-2 font-mono text-lg font-bold ${
          tone === 'cyan'
            ? 'text-[var(--cyan-primary)]'
            : 'text-[var(--gold-primary)]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'red';
}) {
  return (
    <div>
      <p className="text-[8px] tracking-widest text-[var(--text-muted)]">
        {label}
      </p>

      <p
        className={`mt-1 truncate ${
          tone === 'red'
            ? 'text-[var(--alert-red)]'
            : 'text-[var(--text-secondary)]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className="border border-[var(--border-active)] px-2 py-1 text-[8px] font-mono tracking-widest text-[var(--gold-primary)]">
      {status.toUpperCase()}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className="inline-flex items-center gap-1 border border-[var(--border-secondary)] px-2.5 py-1.5 text-[8px] font-mono tracking-wider text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]"
    >
      {children}
    </button>
  );
}

function Compatibility({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'gold' | 'red';
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border-secondary)] py-3 text-[10px] font-mono">
      <span className="text-[var(--text-muted)]">{label}</span>

      <span
        className={
          tone === 'green'
            ? 'text-[var(--alert-green)]'
            : tone === 'red'
              ? 'text-[var(--alert-red)]'
              : tone === 'gold'
                ? 'text-[var(--gold-primary)]'
                : 'text-[var(--text-secondary)]'
        }
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center px-8 text-center">
      <span className="mb-4 text-[var(--text-muted)]">{icon}</span>

      <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--text-secondary)]">
        {title}
      </p>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--text-muted)]">
        {description}
      </p>
    </div>
  );
}