'use client';

import { useState } from 'react';
import {
  Upload,
  FileSearch,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Binary,
} from 'lucide-react';

type Detection = {
  name: string;
  type: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
};

type AnalysisResult = {
  fileName: string;
  extension: string;
  size: number;
  mimeType: string;
  detections: Detection[];
  hexPreview: string;
};

const toHex = (bytes: Uint8Array, start = 0, length = 64) =>
  Array.from(bytes.slice(start, start + length))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  Array.from(bytes.slice(start, start + length))
    .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
    .join('');

const hasBytes = (
  bytes: Uint8Array,
  offset: number,
  signature: number[]
) =>
  signature.every(
    (value, index) => bytes[offset + index] === value
  );

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export default function ProprietaryParser() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyzeFile = async (file: File) => {
    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      // Read only the beginning of the evidence file.
      // The original file is never modified.
      const sampleSize = Math.min(file.size, 4096);
      const buffer = await file.slice(0, sampleSize).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const detections: Detection[] = [];

      // -----------------------------
      // NTFS
      // -----------------------------
      if (
        bytes.length >= 11 &&
        ascii(bytes, 3, 8) === 'NTFS    '
      ) {
        detections.push({
          name: 'NTFS',
          type: 'Filesystem',
          confidence: 'HIGH',
          detail: 'NTFS boot-sector signature detected at offset 0x03.',
        });
      }

      // -----------------------------
      // exFAT
      // -----------------------------
      if (
        bytes.length >= 11 &&
        ascii(bytes, 3, 8) === 'EXFAT   '
      ) {
        detections.push({
          name: 'exFAT',
          type: 'Filesystem',
          confidence: 'HIGH',
          detail: 'exFAT filesystem signature detected.',
        });
      }

      // -----------------------------
      // FAT / FAT32
      // -----------------------------
      const bootSignature =
        bytes.length >= 512 &&
        bytes[510] === 0x55 &&
        bytes[511] === 0xaa;

      const fatText =
        bytes.length >= 62 &&
        (
          ascii(bytes, 54, 5) === 'FAT12' ||
          ascii(bytes, 54, 5) === 'FAT16' ||
          ascii(bytes, 82, 5) === 'FAT32'
        );

      if (bootSignature && fatText) {
        detections.push({
          name: 'FAT',
          type: 'Filesystem',
          confidence: 'HIGH',
          detail:
            'FAT filesystem indicators and valid boot-sector signature detected.',
        });
      }

      // -----------------------------
      // ext2 / ext3 / ext4
      // Magic: 0xEF53 at offset 0x438
      // -----------------------------
      if (
        bytes.length >= 0x43a &&
        bytes[0x438] === 0x53 &&
        bytes[0x439] === 0xef
      ) {
        detections.push({
          name: 'EXT2 / EXT3 / EXT4',
          type: 'Filesystem',
          confidence: 'HIGH',
          detail:
            'Linux EXT filesystem magic value 0xEF53 detected at offset 0x438.',
        });
      }

      // -----------------------------
      // APFS
      // -----------------------------
      if (
        bytes.length >= 36 &&
        ascii(bytes, 32, 4) === 'NXSB'
      ) {
        detections.push({
          name: 'APFS',
          type: 'Filesystem',
          confidence: 'HIGH',
          detail: 'APFS container superblock signature detected.',
        });
      }

      // -----------------------------
      // ISO 9660
      // -----------------------------
      if (
        bytes.length >= 0x8006 &&
        ascii(bytes, 0x8001, 5) === 'CD001'
      ) {
        detections.push({
          name: 'ISO 9660',
          type: 'Filesystem / Disc Image',
          confidence: 'HIGH',
          detail: 'ISO 9660 volume descriptor detected.',
        });
      }

      // -----------------------------
      // QCOW2
      // -----------------------------
      if (
        bytes.length >= 4 &&
        hasBytes(bytes, 0, [0x51, 0x46, 0x49, 0xfb])
      ) {
        detections.push({
          name: 'QCOW2',
          type: 'Disk Image',
          confidence: 'HIGH',
          detail: 'QEMU QCOW2 disk-image signature detected.',
        });
      }

      // -----------------------------
      // MP4 / ISO Base Media
      // -----------------------------
      if (
        bytes.length >= 8 &&
        ascii(bytes, 4, 4) === 'ftyp'
      ) {
        detections.push({
          name: 'MP4 / ISO Base Media',
          type: 'Video Container',
          confidence: 'HIGH',
          detail: 'ftyp media-container signature detected at offset 0x04.',
        });
      }

      // -----------------------------
      // AVI
      // -----------------------------
      if (
        bytes.length >= 12 &&
        ascii(bytes, 0, 4) === 'RIFF' &&
        ascii(bytes, 8, 4) === 'AVI '
      ) {
        detections.push({
          name: 'AVI',
          type: 'Video Container',
          confidence: 'HIGH',
          detail: 'RIFF/AVI container signature detected.',
        });
      }

      // -----------------------------
      // Matroska / WebM
      // -----------------------------
      if (
        bytes.length >= 4 &&
        hasBytes(bytes, 0, [0x1a, 0x45, 0xdf, 0xa3])
      ) {
        detections.push({
          name: 'Matroska / WebM',
          type: 'Video Container',
          confidence: 'HIGH',
          detail: 'EBML container signature detected.',
        });
      }

      // -----------------------------
      // MPEG Transport Stream
      // -----------------------------
      if (bytes.length >= 188) {
        const tsSync =
          bytes[0] === 0x47 &&
          bytes[188] === 0x47;

        if (tsSync) {
          detections.push({
            name: 'MPEG Transport Stream',
            type: 'Video Container',
            confidence: 'MEDIUM',
            detail:
              'Repeated MPEG-TS synchronization bytes detected.',
          });
        }
      }

      // -----------------------------
      // Generic boot sector
      // -----------------------------
      if (
        detections.length === 0 &&
        bootSignature
      ) {
        detections.push({
          name: 'Boot Sector / Disk Structure',
          type: 'Unknown Filesystem',
          confidence: 'LOW',
          detail:
            'A valid 0x55AA boot-sector signature was detected, but no known filesystem was confirmed.',
        });
      }

      // -----------------------------
      // Unknown / proprietary
      // -----------------------------
      if (detections.length === 0) {
        detections.push({
          name: 'Unknown / Vendor-Specific',
          type: 'Proprietary Candidate',
          confidence: 'LOW',
          detail:
            'No supported public signature was detected. This may require a vendor-specific parser or a larger forensic image analysis.',
        });
      }

      const extension =
        file.name.includes('.')
          ? file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
          : 'UNKNOWN';

      setResult({
        fileName: file.name,
        extension,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        detections,
        hexPreview: toHex(bytes, 0, 128),
      });
    } catch {
      setError('Unable to analyze the selected file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    void analyzeFile(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2">
              <Binary className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Proprietary File-System Parser
              </h2>

              <p className="text-sm text-slate-400">
                Read-only signature and container analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          READ ONLY
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-slate-800 p-2">
            <HardDrive className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h3 className="font-medium text-white">
              Evidence Container Analysis
            </h3>

            <p className="text-xs text-slate-500">
              Analyze a forensic image, DVR/NVR export, or media file.
            </p>
          </div>
        </div>

        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-950/60 px-6 text-center transition hover:border-cyan-500/50 hover:bg-slate-950">
          <Upload className="mb-3 h-8 w-8 text-slate-400" />

          <span className="text-sm font-medium text-slate-200">
            Select Evidence File
          </span>

          <span className="mt-1 text-xs text-slate-500">
            .dd • .img • .raw • .bin • .dav • .mp4 • .avi • .mkv • .ts
          </span>

          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {analyzing && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <FileSearch className="h-5 w-5 animate-pulse text-cyan-400" />
            <div>
              <p className="text-sm text-cyan-300">
                Analyzing file structure...
              </p>
              <p className="text-xs text-slate-500">
                Reading only the initial file signature.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <>
          {/* File information */}
          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard
              label="Evidence File"
              value={result.fileName}
            />

            <InfoCard
              label="File Size"
              value={formatBytes(result.size)}
            />

            <InfoCard
              label="Extension"
              value={result.extension}
            />

            <InfoCard
              label="MIME Type"
              value={result.mimeType}
            />
          </div>

          {/* Detection */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">
                  Structure Detection
                </h3>

                <p className="text-xs text-slate-500">
                  Results are based on recognized file signatures.
                </p>
              </div>

              <Database className="h-5 w-5 text-slate-500" />
            </div>

            <div className="space-y-3">
              {result.detections.map((detection, index) => (
                <div
                  key={`${detection.name}-${index}`}
                  className="rounded-lg border border-slate-700 bg-slate-950/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {detection.confidence === 'HIGH' ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
                      )}

                      <div>
                        <p className="font-medium text-white">
                          {detection.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {detection.type}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          {detection.detail}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        detection.confidence === 'HIGH'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {detection.confidence} CONFIDENCE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hex preview */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Binary className="h-5 w-5 text-slate-400" />

              <div>
                <h3 className="font-medium text-white">
                  Binary Header Preview
                </h3>

                <p className="text-xs text-slate-500">
                  First 128 bytes • hexadecimal representation
                </p>
              </div>
            </div>

            <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-black/50 p-4 font-mono text-xs leading-6 text-slate-400">
              {result.hexPreview}
            </pre>
          </div>

          {/* Parser status */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 text-amber-400" />

              <div>
                <p className="font-medium text-amber-200">
                  Vendor-Specific Parser Status
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Signature detection is available. Full decoding of
                  proprietary DVR/NVR filesystems requires a verified
                  vendor-specific format specification or parser and is
                  not claimed by this browser module.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Safety / integrity note */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
        <p className="text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-400">
            Analysis note:
          </span>{' '}
          This module performs read-only client-side inspection of the
          selected file. It does not modify the source file. Browser
          upload and analysis alone should not be treated as establishing
          forensic chain of custody or evidence integrity.
        </p>
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
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}