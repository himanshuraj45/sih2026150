'use client';

import { useState, ChangeEvent } from 'react';
import CryptoJS from 'crypto-js';
import {
  Upload,
  HardDrive,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Database,
  Lock,
  Hash,
  Copy,
} from 'lucide-react';

type AcquisitionStatus = 'READY' | 'SELECTED' | 'MANIFEST READY';

export default function ForensicAcquisition() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AcquisitionStatus>('READY');

  const [acquisitionMethod, setAcquisitionMethod] =
    useState('Forensic Image Intake');

  const [sourceType, setSourceType] = useState('Disk Image');
  const [examiner, setExaminer] = useState('');
  const [caseId, setCaseId] = useState('NX-2026-001');
  const [notes, setNotes] = useState('');

  const [md5, setMd5] = useState('');
  const [sha256, setSha256] = useState('');
  const [hashing, setHashing] = useState(false);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setFile(selected);
    setStatus('SELECTED');
    setMd5('');
    setSha256('');

    await calculateHashes(selected);
  };

  const calculateHashes = async (selectedFile: File) => {
    setHashing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      // MD5
      const wordArray = CryptoJS.lib.WordArray.create(
        new Uint8Array(buffer) as unknown as number[],
      );

      const md5Hash = CryptoJS.MD5(wordArray).toString();

      // SHA-256
      const shaBuffer = await crypto.subtle.digest('SHA-256', buffer);

      const shaArray = Array.from(new Uint8Array(shaBuffer));

      const shaHash = shaArray
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

      setMd5(md5Hash);
      setSha256(shaHash);
    } catch (error) {
      console.error('Hash calculation failed:', error);
    } finally {
      setHashing(false);
    }
  };

  const createManifest = () => {
    if (!file) return;

    setStatus('MANIFEST READY');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  };

  const copyHash = async (value: string) => {
    if (!value) return;

    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
            <HardDrive className="h-5 w-5 text-cyan-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Forensic Image Acquisition
            </h2>

            <p className="text-sm text-slate-400">
              Evidence image intake and acquisition manifest preparation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          READ ONLY
        </div>
      </div>

      {/* Evidence Image Intake */}
      <section className="rounded-xl border border-slate-700 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
            <Database className="h-4 w-4 text-slate-300" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Evidence Image Intake
            </h3>

            <p className="text-xs text-slate-500">
              Select an existing forensic image for read-only analysis.
            </p>
          </div>
        </div>

        <label className="block cursor-pointer rounded-xl border border-dashed border-slate-600 bg-slate-900/50 p-8 text-center transition hover:border-cyan-500/60 hover:bg-slate-900">
          <Upload className="mx-auto mb-3 h-8 w-8 text-cyan-400" />

          <div className="text-sm font-medium text-white">
            Select Forensic Image
          </div>

          <div className="mt-1 text-xs text-slate-500">
            .dd • .img • .raw • .bin
          </div>

          <input
            type="file"
            accept=".dd,.img,.raw,.bin"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      </section>

      {/* Image Information */}
      {file && (
        <section className="rounded-xl border border-slate-700 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Image Information
            </h3>

            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-400">
              {status}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <InfoCard label="FILE" value={file.name} />
            <InfoCard label="SIZE" value={formatBytes(file.size)} />
            <InfoCard
              label="TYPE"
              value={file.type || 'Binary Image'}
            />
            <InfoCard
              label="MODIFIED"
              value={new Date(file.lastModified).toLocaleString()}
            />
          </div>
        </section>
      )}

      {/* Hash Verification */}
      {file && (
        <section className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
              <Hash className="h-4 w-4 text-cyan-400" />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Evidence Integrity Hashes
              </h3>

              <p className="text-xs text-slate-500">
                Cryptographic fingerprints calculated locally from the
                selected evidence image.
              </p>
            </div>
          </div>

          {hashing ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-cyan-400">
              Calculating MD5 and SHA-256...
            </div>
          ) : (
            <div className="space-y-3">
              <HashRow
                label="MD5"
                value={md5}
                onCopy={() => copyHash(md5)}
              />

              <HashRow
                label="SHA-256"
                value={sha256}
                onCopy={() => copyHash(sha256)}
              />
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />

            <span>
              Hashes provide integrity fingerprints for the selected file.
              They do not by themselves prove the complete chain of custody
              or authenticity of the evidence.
            </span>
          </div>
        </section>
      )}

      {/* Acquisition Metadata */}
      <section className="rounded-xl border border-slate-700 bg-slate-950/60 p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-white">
            Acquisition Metadata
          </h3>

          <p className="text-xs text-slate-500">
            Record the declared provenance of the selected evidence image.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="CASE ID"
            value={caseId}
            onChange={setCaseId}
          />

          <Field
            label="EXAMINER"
            value={examiner}
            onChange={setExaminer}
            placeholder="Enter examiner name"
          />

          <SelectField
            label="SOURCE TYPE"
            value={sourceType}
            onChange={setSourceType}
            options={[
              'Disk Image',
              'NVR Storage Image',
              'Forensic Clone',
              'Recovered Image',
            ]}
          />

          <SelectField
            label="ACQUISITION METHOD"
            value={acquisitionMethod}
            onChange={setAcquisitionMethod}
            options={[
              'Forensic Image Intake',
              'Verified Disk Image',
              'Forensic Clone',
              'Logical Evidence Export',
            ]}
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            ACQUISITION NOTES
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record source details, acquisition notes, or verification observations..."
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
          />
        </div>

        <button
          type="button"
          onClick={createManifest}
          disabled={!file || hashing}
          className="mt-5 flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileCheck2 className="h-4 w-4" />
          CREATE ACQUISITION MANIFEST
        </button>
      </section>

      {/* Manifest Ready */}
      {status === 'MANIFEST READY' && file && (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />

            <div>
              <h3 className="font-semibold text-emerald-400">
                Acquisition Manifest Ready
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                The selected image has been registered locally with its
                declared case, acquisition metadata, and calculated
                integrity hashes.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Integrity Notice */}
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />

          <div>
            <h3 className="font-semibold text-amber-400">
              Acquisition Integrity Notice
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              This browser module does not directly acquire data from
              physical storage devices. It registers an existing forensic
              image and calculates integrity hashes locally. Physical
              write-blocked acquisition and validated forensic procedures
              should be used before evidentiary conclusions are made.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Lock className="h-3.5 w-3.5" />
        Source file is not modified by this module.
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <div className="text-[10px] font-medium tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-medium text-white">
        {value}
      </div>
    </div>
  );
}

function HashRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-slate-400">
          {label}
        </span>

        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          className="flex items-center gap-1.5 text-xs text-cyan-400 transition hover:text-cyan-300 disabled:opacity-30"
        >
          <Copy className="h-3.5 w-3.5" />
          COPY
        </button>
      </div>

      <code className="block break-all text-xs leading-5 text-slate-300">
        {value || 'Hash unavailable'}
      </code>
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