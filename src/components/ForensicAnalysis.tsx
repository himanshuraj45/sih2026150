'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  Shield,
  FolderOpen,
  Upload,
  Cpu,
  Search,
  Database,
  HardDrive,
  FileSearch,
  ChevronRight,
  Plus,
  X,
  Video,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Activity,
  Clock3,
  Link2,
  FileText,
  BarChart3,
} from 'lucide-react';

import ProprietaryParser from './ProprietaryParser';
import ForensicAcquisition from './ForensicAcquisition';

type View =
  | 'cases'
  | 'evidence'
  | 'device'
  | 'parser'
  | 'acquisition';

type CaseItem = {
  id: string;
  title: string;
  organization: string;
  location: string;
  status: 'OPEN' | 'IN REVIEW' | 'CLOSED';
  evidence: number;
  updated: string;
};

export default function ForensicAnalysis() {
  const [view, setView] = useState<View>('cases');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <header className="border-b border-slate-800 bg-[#020617]/95">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <div className="text-sm font-bold tracking-[0.25em] text-white">
                NEXORA
              </div>
              <div className="text-[10px] tracking-[0.18em] text-slate-500">
                FORENSIC OPERATIONS
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
              SYSTEM READY
            </div>

            <div className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-500">
              SIH 26150
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="mb-3 px-3 py-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
              FORENSIC WORKSPACE
            </div>

            <NavButton
              active={view === 'cases'}
              icon={<FolderOpen className="h-4 w-4" />}
              label="Case Management"
              onClick={() => setView('cases')}
            />

            <NavButton
              active={view === 'evidence'}
              icon={<Upload className="h-4 w-4" />}
              label="Evidence Intake"
              onClick={() => setView('evidence')}
            />

            <NavButton
              active={view === 'device'}
              icon={<Cpu className="h-4 w-4" />}
              label="Device Identification"
              onClick={() => setView('device')}
            />

            <NavButton
              active={view === 'parser'}
              icon={<FileSearch className="h-4 w-4" />}
              label="Filesystem Parser"
              onClick={() => setView('parser')}
            />

            <NavButton
              active={view === 'acquisition'}
              icon={<HardDrive className="h-4 w-4" />}
              label="Image Acquisition"
              onClick={() => setView('acquisition')}
            />

            <a
              href="/forensics/carving"
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              <Database className="h-4 w-4" />
              <span className="flex-1">Carving Lab</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>

            <div className="my-4 border-t border-slate-800" />

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                Read-only workspace
              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-600">
                Source evidence is not modified by the browser workspace.
              </p>
            </div>
          </aside>

          <section className="min-w-0">
            {view === 'cases' && <CaseManagement />}

            {view === 'evidence' && <EvidenceIntake />}

            {view === 'device' && <DeviceIdentification />}

            {view === 'parser' && <ProprietaryParser />}

            {view === 'acquisition' && <ForensicAcquisition />}
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-[1600px] px-6 pb-8">
        <div className="border-t border-slate-800 pt-5 text-xs text-slate-600">
          NEXORA forensic workspace • Evidence processing tools are intended
          for authorized investigators and controlled forensic environments.
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CASE MANAGEMENT                                                            */
/* -------------------------------------------------------------------------- */

function CaseManagement() {
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: 'NX-2026-001',
      title: 'Warehouse Perimeter Incident',
      organization: 'NEXORA DEMO UNIT',
      location: 'Sector 18 Noida',
      status: 'OPEN',
      evidence: 12,
      updated: '14 Sep 2026',
    },
    {
      id: 'NX-2026-002',
      title: 'Retail Security Review',
      organization: 'NEXORA DEMO UNIT',
      location: 'Bengaluru',
      status: 'IN REVIEW',
      evidence: 7,
      updated: '12 Sep 2026',
    },
  ]);

  const [showNewCase, setShowNewCase] = useState(false);
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('NEXORA DEMO UNIT');
  const [location, setLocation] = useState('');

  const createCase = () => {
    if (!title.trim()) return;

    const newCase: CaseItem = {
      id: `NX-${new Date().getFullYear()}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      title: title.trim(),
      organization: organization.trim() || 'NEXORA DEMO UNIT',
      location: location.trim() || 'Unknown',
      status: 'OPEN',
      evidence: 0,
      updated: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setCases((current) => [newCase, ...current]);
    setTitle('');
    setLocation('');
    setShowNewCase(false);
  };

  const totalEvidence = cases.reduce(
    (sum, item) => sum + item.evidence,
    0
  );

  const openCases = cases.filter(
    (item) => item.status === 'OPEN'
  ).length;

  const reviewCases = cases.filter(
    (item) => item.status === 'IN REVIEW'
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CASE CONTROL"
        title="Case Management"
        description="Create and organize forensic investigations and associated evidence."
        action={
          <ActionButton
            icon={<Plus className="h-4 w-4" />}
            label="NEW CASE"
            onClick={() => setShowNewCase(true)}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="TOTAL CASES"
          value={String(cases.length)}
          icon={<FolderOpen className="h-4 w-4" />}
        />

        <Stat
          label="OPEN CASES"
          value={String(openCases)}
          icon={<Activity className="h-4 w-4" />}
        />

        <Stat
          label="UNDER REVIEW"
          value={String(reviewCases)}
          icon={<Search className="h-4 w-4" />}
        />

        <Stat
          label="EVIDENCE ITEMS"
          value={String(totalEvidence)}
          icon={<Database className="h-4 w-4" />}
        />
      </div>

      {showNewCase && (
        <Panel>
          <div className="mb-5 flex items-center justify-between">
            <PanelTitle
              icon={<Plus className="h-4 w-4" />}
              title="Create New Case"
            />

            <button
              onClick={() => setShowNewCase(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="CASE TITLE"
              value={title}
              onChange={setTitle}
              placeholder="Investigation title"
            />

            <Field
              label="ORGANIZATION"
              value={organization}
              onChange={setOrganization}
            />

            <Field
              label="LOCATION"
              value={location}
              onChange={setLocation}
              placeholder="Location"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <ActionButton
              label="CREATE CASE"
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={createCase}
            />

            <button
              onClick={() => setShowNewCase(false)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              CANCEL
            </button>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle
          icon={<FolderOpen className="h-4 w-4" />}
          title="Active Investigations"
        />

        <div className="mt-4 space-y-3">
          {cases.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400">
                      {item.id}
                    </span>

                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="mt-2 font-semibold text-white">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span>{item.organization}</span>
                    <span>{item.location}</span>
                    <span>{item.evidence} evidence items</span>
                    <span>Updated {item.updated}</span>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400">
                  OPEN CASE
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EVIDENCE INTAKE                                                            */
/* -------------------------------------------------------------------------- */

function EvidenceIntake() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selected);

    if (selected.type.startsWith('video/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EVIDENCE CONTROL"
        title="Evidence Intake"
        description="Register local evidence files for controlled forensic analysis."
      />

      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <PanelTitle
            icon={<Upload className="h-4 w-4" />}
            title="Evidence Registration"
          />

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-400">
            LOCAL SESSION
          </span>
        </div>

        <label className="block cursor-pointer rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center transition hover:border-cyan-500/50">
          <Upload className="mx-auto mb-3 h-8 w-8 text-cyan-400" />

          <div className="font-medium text-white">
            Select Evidence File
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Video • .dd • .img • .raw • .bin • .dav • .264 • .265 • .ts
          </div>

          <input
            type="file"
            accept="video/*,.dd,.img,.raw,.bin,.dav,.264,.265,.ts"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      </Panel>

      {file && (
        <Panel>
          <PanelTitle
            icon={<FileSearch className="h-4 w-4" />}
            title="Selected Evidence"
          />

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Detail label="FILE NAME" value={file.name} />
            <Detail label="SIZE" value={formatBytes(file.size)} />
            <Detail label="MIME TYPE" value={file.type || 'Unknown'} />
            <Detail
              label="LAST MODIFIED"
              value={new Date(file.lastModified).toLocaleString()}
            />
          </div>

          {previewUrl && (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-black">
              <video
                src={previewUrl}
                controls
                className="max-h-[500px] w-full"
              />
            </div>
          )}

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <Shield className="mt-0.5 h-4 w-4 text-emerald-400" />

            <div>
              <div className="text-sm font-medium text-emerald-400">
                Local read-only preview
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                The selected file is previewed in the browser session and is
                not uploaded to a remote server by this module.
              </p>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DEVICE IDENTIFICATION                                                     */
/* -------------------------------------------------------------------------- */

function DeviceIdentification() {
  const [vendor, setVendor] = useState('Hikvision');
  const [model, setModel] = useState('DS-7608NI');
  const [serial, setSerial] = useState('');
  const [firmware, setFirmware] = useState('');
  const [sourceIdentifier, setSourceIdentifier] = useState('');
  const [sourceType, setSourceType] = useState('NVR');
  const [acquisition, setAcquisition] = useState('Logical Export');
  const [file, setFile] = useState<File | null>(null);
  const [identified, setIdentified] = useState(false);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SOURCE ANALYSIS"
        title="Device Identification"
        description="Build a structured source profile from investigator-supplied device metadata."
      />

      <Panel>
        <PanelTitle
          icon={<Cpu className="h-4 w-4" />}
          title="Source Profile"
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="VENDOR"
            value={vendor}
            onChange={setVendor}
            options={[
              'Hikvision',
              'Dahua',
              'CP Plus',
              'Honeywell',
              'TP-Link',
              'Godrej',
              'Uniview',
              'Matrix',
              'Other',
            ]}
          />

          <Field
            label="MODEL"
            value={model}
            onChange={setModel}
          />

          <Field
            label="SERIAL NUMBER"
            value={serial}
            onChange={setSerial}
            placeholder="Optional"
          />

          <Field
            label="FIRMWARE"
            value={firmware}
            onChange={setFirmware}
            placeholder="Optional"
          />

          <Field
            label="SOURCE IDENTIFIER"
            value={sourceIdentifier}
            onChange={setSourceIdentifier}
            placeholder="Device / storage identifier"
          />

          <SelectField
            label="SOURCE TYPE"
            value={sourceType}
            onChange={setSourceType}
            options={[
              'NVR',
              'DVR',
              'Camera',
              'Storage Drive',
              'Export Package',
            ]}
          />

          <SelectField
            label="ACQUISITION METHOD"
            value={acquisition}
            onChange={setAcquisition}
            options={[
              'Logical Export',
              'Forensic Image',
              'Physical Acquisition',
              'Recovered Storage',
            ]}
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            EVIDENCE FILE
          </label>

          <input
            type="file"
            onChange={handleFile}
            className="block w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
          />

          {file && (
            <div className="mt-2 text-xs text-slate-500">
              Selected: {file.name}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIdentified(true)}
          className="mt-5 flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          <Search className="h-4 w-4" />
          IDENTIFY SOURCE
        </button>
      </Panel>

      {identified && (
        <Panel>
          <PanelTitle
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="Identification Assessment"
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AssessmentCard
              title="Vendor Profile"
              value={vendor}
              status="IDENTIFIED"
            />

            <AssessmentCard
              title="Model Profile"
              value={model || 'Not supplied'}
              status="IDENTIFIED"
            />

            <AssessmentCard
              title="Source Type"
              value={sourceType}
              status="IDENTIFIED"
            />

            <AssessmentCard
              title="Acquisition"
              value={acquisition}
              status="DECLARED"
            />
          </div>

          <div className="mt-5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="text-xs font-semibold tracking-wide text-cyan-400">
              PROFILE CONFIDENCE — HIGH
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              This assessment is generated from the metadata supplied by the
              investigator. It does not claim automatic proprietary filesystem
              identification.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED UI                                                                  */
/* -------------------------------------------------------------------------- */

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="text-[10px] font-semibold tracking-[0.2em] text-cyan-400">
          {eyebrow}
        </div>

        <h1 className="mt-1 text-2xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
        active
          ? 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3.5 w-3.5" />}
    </button>
  );
}

function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      {children}
    </section>
  );
}

function PanelTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-cyan-400">{icon}</div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium tracking-wide text-slate-500">
          {label}
        </div>

        <div className="text-slate-600">{icon}</div>
      </div>

      <div className="mt-3 text-2xl font-bold text-white">{value}</div>
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
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <div className="text-[10px] tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 truncate text-sm text-white">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: CaseItem['status'];
}) {
  const classes =
    status === 'OPEN'
      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
      : status === 'IN REVIEW'
        ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
        : 'border-slate-700 bg-slate-900 text-slate-400';

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

function AssessmentCard({
  title,
  value,
  status,
}: {
  title: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-[10px] tracking-wide text-slate-500">
        {title}
      </div>

      <div className="mt-2 truncate text-sm font-semibold text-white">
        {value}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {status}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}