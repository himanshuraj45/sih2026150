'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Binary,
  CheckCircle2,
  ChevronRight,
  Database,
  FileArchive,
  FileCheck2,
  FileSearch,
  FolderOpen,
  HardDrive,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Upload,
  Video,
  X,
  XCircle,
} from 'lucide-react';

import ProprietaryParser from './ProprietaryParser';
import ForensicAcquisition from './ForensicAcquisition';

type View = 'cases' | 'evidence' | 'device' | 'parser';

type CaseStatus = 'OPEN' | 'IN REVIEW' | 'CLOSED';

type CaseRecord = {
  id: string;
  title: string;
  organization: string;
  location: string;
  status: CaseStatus;
  evidence: number;
  updated: string;
};

type EvidenceFile = {
  file: File;
  url?: string;
};

const initialCases: CaseRecord[] = [
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
];

export default function ForensicAnalysis() {
  const [view, setView] = useState<View>('cases');
  const [cases, setCases] = useState<CaseRecord[]>(initialCases);
  const [showCreateCase, setShowCreateCase] = useState(false);

  const [selectedCase, setSelectedCase] =
    useState<CaseRecord | null>(initialCases[0]);

  const handleCaseCreated = (newCase: CaseRecord) => {
    setCases((current) => [newCase, ...current]);
    setSelectedCase(newCase);
    setShowCreateCase(false);
    setView('cases');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-cyan-400">
                  NEXORA / FORENSIC OPERATIONS
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  FORENSIC WORKSPACE
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Evidence intake, device profiling, filesystem analysis and
              forensic workspace management.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">
              FORENSIC WORKSPACE ONLINE
            </span>
          </div>
        </header>

        {/* NAVIGATION */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="flex min-w-max p-1.5">

            <NavButton
              active={view === 'cases'}
              onClick={() => setView('cases')}
              icon={<FolderOpen className="h-4 w-4" />}
            >
              Case Management
            </NavButton>

            <NavButton
              active={view === 'evidence'}
              onClick={() => setView('evidence')}
              icon={<FileArchive className="h-4 w-4" />}
            >
              Evidence Intake
            </NavButton>

            <NavButton
              active={view === 'device'}
              onClick={() => setView('device')}
              icon={<HardDrive className="h-4 w-4" />}
            >
              Device Identification
            </NavButton>

            <NavButton
              active={view === 'parser'}
              onClick={() => setView('parser')}
              icon={<Binary className="h-4 w-4" />}
            >
              Filesystem Parser
            </NavButton>

            <a
              href="/forensics/carving"
              className="ml-auto flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <FileSearch className="h-4 w-4" />
              Carving Lab
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* MAIN CONTENT */}
        {view === 'cases' && (
          <CaseManagement
            cases={cases}
            selectedCase={selectedCase}
            onSelectCase={setSelectedCase}
            onCreateCase={() => setShowCreateCase(true)}
            onOpenEvidence={() => setView('evidence')}
            onOpenDevice={() => setView('device')}
          />
        )}

        {view === 'evidence' && (
          <EvidenceIntake selectedCase={selectedCase} />
        )}

        {view === 'device' && (
          <DeviceIdentification selectedCase={selectedCase} />
        )}

        {view === 'parser' && (
          <ProprietaryParser />
        )}

        {/* FOOTER */}
        <footer className="mt-8 border-t border-slate-800 pt-5">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              NEXORA FORENSIC OPERATIONS • Authorized investigation workspace
            </span>

            <span>
              No automatic criminal identification • No unsupported evidence claims
            </span>
          </div>
        </footer>
      </div>

      {/* CREATE CASE */}
      {showCreateCase && (
        <CreateCaseDialog
          onClose={() => setShowCreateCase(false)}
          onCreate={handleCaseCreated}
        />
      )}
    </div>
  );
}

/* =========================================================
   CASE MANAGEMENT
========================================================= */

function CaseManagement({
  cases,
  selectedCase,
  onSelectCase,
  onCreateCase,
  onOpenEvidence,
  onOpenDevice,
}: {
  cases: CaseRecord[];
  selectedCase: CaseRecord | null;
  onSelectCase: (item: CaseRecord) => void;
  onCreateCase: () => void;
  onOpenEvidence: () => void;
  onOpenDevice: () => void;
}) {
  const openCases = cases.filter((item) => item.status === 'OPEN').length;

  const reviewCases = cases.filter(
    (item) => item.status === 'IN REVIEW'
  ).length;

  const totalEvidence = cases.reduce(
    (total, item) => total + item.evidence,
    0
  );

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PanelTitle
          icon={<FolderOpen className="h-5 w-5" />}
          title="Case Management"
          subtitle="Create, review and organize forensic investigations."
        />

        <button
          onClick={onCreateCase}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          NEW CASE
        </button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Cases"
          value={cases.length}
          icon={<FolderOpen className="h-5 w-5" />}
        />

        <Stat
          label="Open Cases"
          value={openCases}
          icon={<Activity className="h-5 w-5" />}
        />

        <Stat
          label="Under Review"
          value={reviewCases}
          icon={<Search className="h-5 w-5" />}
        />

        <Stat
          label="Evidence Items"
          value={totalEvidence}
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

        {/* CASE LIST */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">
              Investigation Cases
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a case to view its workspace.
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {cases.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectCase(item)}
                className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition ${
                  selectedCase?.id === item.id
                    ? 'bg-cyan-500/5'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-cyan-400">
                      {item.id}
                    </span>

                    <StatusBadge status={item.status} />
                  </div>

                  <p className="mt-2 truncate font-medium text-slate-200">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.organization} • {item.location}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {item.evidence} evidence
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CASE OVERVIEW */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          {selectedCase ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-cyan-400">
                    {selectedCase.id}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {selectedCase.title}
                  </h2>
                </div>

                <StatusBadge status={selectedCase.status} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Organization"
                  value={selectedCase.organization}
                />

                <Detail
                  label="Location"
                  value={selectedCase.location}
                />

                <Detail
                  label="Evidence Items"
                  value={String(selectedCase.evidence)}
                />

                <Detail
                  label="Last Updated"
                  value={selectedCase.updated}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ActionButton
                  icon={<FileArchive className="h-4 w-4" />}
                  onClick={onOpenEvidence}
                >
                  Evidence Intake
                </ActionButton>

                <ActionButton
                  icon={<HardDrive className="h-4 w-4" />}
                  onClick={onOpenDevice}
                >
                  Device Identification
                </ActionButton>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<FolderOpen className="h-7 w-7" />}
              title="No case selected"
              description="Select an investigation case from the list."
            />
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   EVIDENCE INTAKE
========================================================= */

function EvidenceIntake({
  selectedCase,
}: {
  selectedCase: CaseRecord | null;
}) {
  const [evidence, setEvidence] = useState<EvidenceFile | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (evidence?.url) {
        URL.revokeObjectURL(evidence.url);
      }
    };
  }, [evidence]);

  const processFile = (file: File) => {
    if (evidence?.url) {
      URL.revokeObjectURL(evidence.url);
    }

    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|avi|mkv|mov|webm|ts|m4v)$/i.test(file.name);

    setEvidence({
      file,
      url: isVideo ? URL.createObjectURL(file) : undefined,
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-6">

      <PanelTitle
        icon={<FileArchive className="h-5 w-5" />}
        title="Evidence Intake"
        subtitle={
          selectedCase
            ? `Adding evidence to ${selectedCase.id} • ${selectedCase.title}`
            : 'Select a case before adding evidence.'
        }
      />

      {!selectedCase ? (
        <EmptyState
          icon={<FolderOpen className="h-7 w-7" />}
          title="No case selected"
          description="Return to Case Management and select an investigation."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Stat
              label="Case"
              value={selectedCase.id}
              icon={<FolderOpen className="h-5 w-5" />}
            />

            <Stat
              label="Current Evidence"
              value={selectedCase.evidence}
              icon={<Database className="h-5 w-5" />}
            />

            <Stat
              label="Intake Mode"
              value="LOCAL"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
          </div>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-5">
              <h2 className="font-semibold text-white">
                Evidence Source
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select a DVR/NVR export, forensic image or video file.
              </p>
            </div>

            <label
              className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition ${
                dragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-950/50 hover:border-cyan-500/50'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);

                const file = event.dataTransfer.files?.[0];

                if (file) {
                  processFile(file);
                }
              }}
            >
              <Upload className="mb-3 h-8 w-8 text-slate-500" />

              <span className="text-sm font-semibold text-slate-200">
                Select or drop evidence
              </span>

              <span className="mt-2 text-xs text-slate-500">
                Video, .dd, .img, .raw, .bin and related evidence files
              </span>

              <input
                type="file"
                className="hidden"
                accept="video/*,.dd,.img,.raw,.bin,.dav,.264,.265,.ts"
                onChange={handleChange}
              />
            </label>
          </section>

          {evidence && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex flex-col gap-5 lg:flex-row">

                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>
                      <p className="font-medium text-white">
                        Evidence loaded
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-400">
                        {evidence.file.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <Detail
                      label="File Size"
                      value={formatBytes(evidence.file.size)}
                    />

                    <Detail
                      label="MIME Type"
                      value={
                        evidence.file.type ||
                        'application/octet-stream'
                      }
                    />

                    <Detail
                      label="Last Modified"
                      value={new Date(
                        evidence.file.lastModified
                      ).toLocaleString()}
                    />
                  </div>
                </div>

                {evidence.url && (
                  <div className="w-full overflow-hidden rounded-lg border border-slate-800 bg-black lg:w-[420px]">
                    <video
                      src={evidence.url}
                      controls
                      className="aspect-video h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <div>
                <p className="text-sm font-medium text-amber-200">
                  Evidence handling notice
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  A browser-selected file is only a local preview in this
                  prototype. It does not by itself establish forensic
                  chain of custody, acquisition integrity or evidentiary
                  authenticity.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   DEVICE IDENTIFICATION
========================================================= */

function DeviceIdentification({
  selectedCase,
}: {
  selectedCase: CaseRecord | null;
}) {
  const [vendor, setVendor] = useState('Hikvision');
  const [model, setModel] = useState('DS-7608NI');
  const [serial, setSerial] = useState('');
  const [firmware, setFirmware] = useState('');
  const [sourceIdentifier, setSourceIdentifier] = useState('');
  const [sourceType, setSourceType] = useState('NVR');
  const [acquisitionMethod, setAcquisitionMethod] =
    useState('Logical Export');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [identified, setIdentified] = useState(false);

  const vendors = [
    'Hikvision',
    'Dahua',
    'CP Plus',
    'Honeywell',
    'TP-Link',
    'Godrej',
    'Uniview',
    'Matrix',
    'Unknown / Other',
  ];

  const handleEvidenceFile = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setEvidenceFile(file);
  };

  const identify = () => {
    setIdentified(true);
  };

  return (
    <div className="space-y-6">

      <PanelTitle
        icon={<HardDrive className="h-5 w-5" />}
        title="Device Identification"
        subtitle={
          selectedCase
            ? `Device assessment for ${selectedCase.id}`
            : 'Create a structured device profile from supplied evidence metadata.'
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Vendor Profile"
          value={identified ? 'IDENTIFIED' : 'PENDING'}
          icon={<HardDrive className="h-5 w-5" />}
        />

        <Stat
          label="Model Profile"
          value={identified ? 'IDENTIFIED' : 'PENDING'}
          icon={<Database className="h-5 w-5" />}
        />

        <Stat
          label="Source Type"
          value={identified ? 'IDENTIFIED' : 'PENDING'}
          icon={<Video className="h-5 w-5" />}
        />

        <Stat
          label="Acquisition"
          value={identified ? 'DECLARED' : 'PENDING'}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* PROFILE FORM */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-white">
              Device / Source Profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter the metadata available from the investigator or
              evidence source.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            <SelectField
              label="Vendor"
              value={vendor}
              onChange={setVendor}
              options={vendors}
            />

            <Field
              label="Model"
              value={model}
              onChange={setModel}
              placeholder="e.g. DS-7608NI"
            />

            <Field
              label="Serial Number"
              value={serial}
              onChange={setSerial}
              placeholder="Device serial number"
            />

            <Field
              label="Firmware Version"
              value={firmware}
              onChange={setFirmware}
              placeholder="e.g. V4.75.000"
            />

            <Field
              label="Source Identifier"
              value={sourceIdentifier}
              onChange={setSourceIdentifier}
              placeholder="Camera / NVR identifier"
            />

            <SelectField
              label="Evidence Source"
              value={sourceType}
              onChange={setSourceType}
              options={[
                'NVR',
                'DVR',
                'Camera',
                'Forensic Image',
                'Exported Media',
                'Unknown',
              ]}
            />

            <SelectField
              label="Acquisition Method"
              value={acquisitionMethod}
              onChange={setAcquisitionMethod}
              options={[
                'Logical Export',
                'Forensic Image',
                'Physical Acquisition',
                'Manual Export',
                'Unknown',
              ]}
            />

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Evidence File
              </label>

              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-400 hover:border-slate-600">
                <Upload className="h-4 w-4" />

                <span className="truncate">
                  {evidenceFile
                    ? evidenceFile.name
                    : 'Choose evidence file'}
                </span>

                <input
                  type="file"
                  className="hidden"
                  accept=".dd,.img,.raw,.bin,.dav,.264,.265,video/*"
                  onChange={handleEvidenceFile}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={identify}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              <FileCheck2 className="h-4 w-4" />
              IDENTIFY SOURCE
            </button>
          </div>
        </section>

        {/* ASSESSMENT */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Identification Assessment
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current profile confidence
              </p>
            </div>

            <ShieldCheck className="h-5 w-5 text-slate-500" />
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-center">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${
                identified
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-900'
              }`}
            >
              {identified ? (
                <CheckCircle2 className="h-9 w-9 text-emerald-400" />
              ) : (
                <HardDrive className="h-9 w-9 text-slate-500" />
              )}
            </div>

            <p className="mt-4 text-xs uppercase tracking-widest text-slate-500">
              Profile Confidence
            </p>

            <p
              className={`mt-2 text-xl font-bold ${
                identified
                  ? 'text-emerald-300'
                  : 'text-slate-400'
              }`}
            >
              {identified ? 'HIGH' : 'NOT ASSESSED'}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <MiniModule
              label="Vendor Profile"
              value={identified ? vendor : 'PENDING'}
              ready={identified}
            />

            <MiniModule
              label="Model Profile"
              value={identified ? model : 'PENDING'}
              ready={identified}
            />

            <MiniModule
              label="Source Type"
              value={identified ? sourceType : 'PENDING'}
              ready={identified}
            />

            <MiniModule
              label="Acquisition"
              value={identified ? acquisitionMethod : 'PENDING'}
              ready={identified}
            />
          </div>
        </section>
      </div>

      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex gap-3">
          <FileSearch className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

          <div>
            <p className="text-sm font-medium text-cyan-200">
              Identification scope
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              This module creates a structured assessment from supplied
              device metadata. It does not claim automatic proprietary
              filesystem identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CREATE CASE DIALOG
========================================================= */

function CreateCaseDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: CaseRecord) => void;
}) {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] =
    useState('NEXORA DEMO UNIT');
  const [location, setLocation] = useState('');

  const create = () => {
    if (!title.trim()) return;

    const newCase: CaseRecord = {
      id: `NX-${new Date().getFullYear()}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      title: title.trim(),
      organization:
        organization.trim() || 'NEXORA DEMO UNIT',
      location: location.trim() || 'Unknown',
      status: 'OPEN',
      evidence: 0,
      updated: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    onCreate(newCase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">
              Create New Case
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Start a new forensic investigation workspace.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">

          <Field
            label="Case Title"
            value={title}
            onChange={setTitle}
            placeholder="e.g. Warehouse Camera Incident"
          />

          <Field
            label="Organization"
            value={organization}
            onChange={setOrganization}
            placeholder="Organization"
          />

          <Field
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Location"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              onClick={create}
              disabled={!title.trim()}
              className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function NavButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
        active
          ? 'bg-cyan-500 text-slate-950'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function PanelTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-cyan-400">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <span className="text-slate-600">{icon}</span>
      </div>

      <p className="mt-3 break-words text-lg font-bold text-slate-200">
        {value}
      </p>
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
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-300">
        {value}
      </p>
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none placeholder:text-slate-700 focus:border-cyan-500/60"
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
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
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

function StatusBadge({
  status,
}: {
  status: CaseStatus;
}) {
  const styles: Record<CaseStatus, string> = {
    OPEN:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    'IN REVIEW':
      'border-amber-500/20 bg-amber-500/10 text-amber-300',
    CLOSED:
      'border-slate-600 bg-slate-800 text-slate-400',
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[9px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ActionButton({
  icon,
  onClick,
  children,
}: {
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
    >
      {icon}
      {children}
    </button>
  );
}

function MiniModule({
  label,
  value,
  ready,
}: {
  label: string;
  value: string;
  ready: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={`text-xs font-semibold ${
          ready
            ? 'text-emerald-300'
            : 'text-slate-600'
        }`}
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
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
      <div className="rounded-xl bg-slate-900 p-3 text-slate-600">
        {icon}
      </div>

      <h3 className="mt-4 font-medium text-slate-300">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-600">
        {description}
      </p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}