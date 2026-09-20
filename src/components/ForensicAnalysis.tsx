"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Box,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Database,
  FileSearch,
  FolderOpen,
  HardDrive,
  MapPin,
  Menu,
  ScanSearch,
  Search,
  Server,
  ShieldCheck,
  Video,
  X,
  Zap,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";

type ForensicView = "cases" | "evidence" | "device" | "parser";

type CaseRecord = {
  id: string;
  incident: string;
  location: string;
  description: string;
  status: "ACTIVE" | "UNDER REVIEW";
  createdAt: string;
};

type EvidenceRecord = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  addedAt: string;
};

const emptyCaseForm = {
  incident: "",
  location: "",
  description: "",
};

export default function ForensicAnalysis() {
  const [activeView, setActiveView] = useState<ForensicView>("cases");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [caseForm, setCaseForm] = useState(emptyCaseForm);

  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<File | null>(null);
  const [evidenceMessage, setEvidenceMessage] = useState("");

  const [deviceForm, setDeviceForm] = useState({
    vendor: "",
    model: "",
    serial: "",
    firmware: "",
    sourceType: "",
    acquisitionMethod: "",
  });
  const [deviceResult, setDeviceResult] = useState<string | null>(null);

  const [parserFile, setParserFile] = useState<File | null>(null);
  const [parserResult, setParserResult] = useState<string | null>(null);

  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const parserInputRef = useRef<HTMLInputElement>(null);

  const selectedCase =
    cases.find((item) => item.id === selectedCaseId) ?? null;

  const selectedCaseEvidence = evidence.filter((e) =>
    selectedCase ? e.id.startsWith(selectedCase.id + "-") : false
  );

  const totalEvidence = evidence.length;

  const navLinks = [
    { href: "/forensics/carving", label: "Carving Lab", icon: FileSearch },
    { href: "/timeline-calibration", label: "Timeline Calibration", icon: Clock3 },
    { href: "/spatial-reconstruction", label: "Spatial Reconstruction", icon: Box },
  ];

  const workspaceTabs = [
    { id: "cases" as ForensicView, label: "Case Management", icon: ClipboardList },
    { id: "evidence" as ForensicView, label: "Evidence Intake", icon: FolderOpen },
    { id: "device" as ForensicView, label: "Device Identification", icon: HardDrive },
    { id: "parser" as ForensicView, label: "Filesystem Parser", icon: Database },
  ];

  function createCase() {
    const incident = caseForm.incident.trim();
    const location = caseForm.location.trim();

    if (!incident || !location) return;

    const id = `NX-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, "0")}`;

    const newCase: CaseRecord = {
      id,
      incident,
      location,
      description: caseForm.description.trim(),
      status: "ACTIVE",
      createdAt: new Date().toLocaleString(),
    };

    setCases((prev) => [...prev, newCase]);
    setSelectedCaseId(id);
    setCaseForm(emptyCaseForm);
    setShowCreateCase(false);
  }

  function chooseEvidence(file: File | null) {
    setSelectedEvidence(file);
    setEvidenceMessage(file ? `Selected: ${file.name}` : "");
  }

  function registerEvidence() {
    if (!selectedCase) {
      setEvidenceMessage("Create or select a case first.");
      return;
    }

    if (!selectedEvidence) {
      setEvidenceMessage("Choose a file first.");
      return;
    }

    const record: EvidenceRecord = {
      id: `${selectedCase.id}-${Date.now()}`,
      name: selectedEvidence.name,
      type: selectedEvidence.type || "Unknown",
      size: selectedEvidence.size,
      file: selectedEvidence,
      addedAt: new Date().toLocaleString(),
    };

    setEvidence((prev) => [...prev, record]);
    setEvidenceMessage(`REGISTERED: ${selectedEvidence.name}`);
    setSelectedEvidence(null);

    if (evidenceInputRef.current) evidenceInputRef.current.value = "";
  }

  function removeEvidence(id: string) {
    setEvidence((prev) => prev.filter((item) => item.id !== id));
  }

  function analyzeDevice() {
    const values = Object.values(deviceForm).map((v) => v.trim());
    const filled = values.filter(Boolean).length;

    if (!deviceForm.vendor.trim() || !deviceForm.model.trim()) {
      setDeviceResult("INCOMPLETE · Vendor and model are required.");
      return;
    }

    if (filled === values.length) {
      setDeviceResult("PROFILE COMPLETE · All device fields supplied.");
    } else {
      setDeviceResult(
        `PROFILE PARTIAL · ${filled}/${values.length} fields supplied.`
      );
    }
  }

  function chooseParserFile(file: File | null) {
    setParserFile(file);
    setParserResult(null);
  }

  function analyzeParserFile() {
    if (!parserFile) {
      setParserResult("NO FILE SELECTED");
      return;
    }

    const ext =
      parserFile.name.includes(".")
        ? parserFile.name.split(".").pop()?.toUpperCase()
        : "UNKNOWN";

    setParserResult(
      `INPUT READY · ${ext} · ${(parserFile.size / 1024 / 1024).toFixed(2)} MB`
    );
  }

  const activeCaseEvidence = useMemo(
    () => (selectedCase ? evidence.filter((e) => e.id.startsWith(selectedCase.id + "-")) : []),
    [evidence, selectedCase]
  );

  return (
    <div className="min-h-screen bg-[#030509] text-white selection:bg-cyan-400/20 selection:text-cyan-100">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-[0.035]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070b]/90 backdrop-blur-xl">
        <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] shadow-[0_0_25px_rgba(34,211,238,0.08)]">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-[15px] font-bold tracking-[0.25em]">NEXORA</div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                Forensic Operations
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <StatusIndicator label="SYSTEM ONLINE" />
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2">
              <Activity className="h-3.5 w-3.5 text-cyan-300" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                Forensic Workspace
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2">
              <span className="font-mono text-[10px] text-white/40">CASE</span>
              <span className="font-mono text-[10px] font-semibold text-white/80">
                {selectedCase?.id ?? "NO ACTIVE CASE"}
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-cyan-400/25 hover:bg-cyan-400/[0.05] hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 text-white/40 transition group-hover:text-cyan-300" />
                  {item.label}
                  <ArrowRight className="h-3 w-3 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </a>
              );
            })}
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-[72px] z-40 border-b border-white/10 bg-[#070a0f]/95 p-4 backdrop-blur-xl lg:hidden">
          <div className="grid gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <Icon className="h-4 w-4 text-cyan-300" />
                  {item.label}
                  <ArrowRight className="ml-auto h-4 w-4 text-white/25" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative mx-auto flex max-w-[1700px]">
        <aside className="hidden w-[235px] shrink-0 border-r border-white/[0.07] lg:block">
          <div className="sticky top-[72px] p-5">
            <div className="mb-7">
              <div className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
                Investigation
              </div>
              <div className="space-y-1">
                {workspaceTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition-all duration-200 ${
                        active
                          ? "border border-cyan-400/20 bg-cyan-400/[0.08] text-white shadow-[0_0_25px_rgba(34,211,238,0.04)]"
                          : "border border-transparent text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 h-5 w-[2px] rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,.8)]" />
                      )}
                      <Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-white/30"}`} />
                      <span>{tab.label}</span>
                      {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-cyan-300/60" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-7">
              <div className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
                Analysis Modules
              </div>
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs text-white/40 transition hover:bg-white/[0.04] hover:text-white/80"
                    >
                      <Icon className="h-4 w-4 text-white/25" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,.8)]" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  System Ready
                </span>
              </div>
              <div className="space-y-2 text-[10px] text-white/35">
                <div className="flex justify-between"><span>Evidence Engine</span><span className="text-emerald-400">READY</span></div>
                <div className="flex justify-between"><span>Integrity Layer</span><span className="text-emerald-400">ACTIVE</span></div>
                <div className="flex justify-between"><span>Local Processing</span><span className="text-cyan-300">ONLINE</span></div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-7 lg:px-8 lg:py-9">
          <section className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                <Video className="h-3 w-3" />
                Surveillance Evidence Platform
              </span>
              <span className="text-white/15">/</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/25">
                Local Forensic Node
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Forensic Command Center</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                  Unified investigation workspace for CCTV evidence intake, device identification,
                  filesystem analysis, recovery and forensic reconstruction.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/30">Evidence Integrity</div>
                  <div className="mt-0.5 text-xs font-semibold text-emerald-400">
                    {totalEvidence ? "LOCAL RECORDS ACTIVE" : "WAITING FOR EVIDENCE"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mb-7 grid grid-cols-2 gap-2 border-b border-white/[0.07] pb-5 md:grid-cols-4 lg:hidden">
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[11px] font-semibold transition ${
                    active
                      ? "bg-cyan-300 text-black shadow-[0_0_25px_rgba(34,211,238,.08)]"
                      : "border border-white/[0.08] bg-white/[0.025] text-white/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeView === "cases" && (
            <section className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateCase(true)}
                  className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-cyan-200"
                >
                  <Plus className="h-4 w-4" />
                  New Case
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard icon={ClipboardList} title="Active Cases" value={String(cases.length).padStart(2, "0")} description="Current forensic investigations" accent="cyan" />
                <DashboardCard icon={Video} title="CCTV Evidence" value={String(totalEvidence).padStart(2, "0")} description="User-registered evidence" accent="blue" />
                <DashboardCard icon={HardDrive} title="Evidence Devices" value={deviceForm.vendor ? "01" : "00"} description="Profiles entered by investigator" accent="violet" />
                <DashboardCard icon={ShieldCheck} title="Integrity" value={totalEvidence ? "READY" : "WAIT"} description="Local evidence registry state" accent="green" />
              </div>

              {selectedCase ? (
                <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                  <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                    <div className="border-b border-white/[0.07] px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                            <h2 className="text-sm font-semibold">Current Investigation</h2>
                          </div>
                          <p className="mt-1 font-mono text-[10px] text-white/30">USER CREATED · ACTIVE CASE</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                          {selectedCase.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-3">
                      <InfoBox label="Case ID" value={selectedCase.id} icon={ClipboardList} />
                      <InfoBox label="Incident" value={selectedCase.incident} icon={Camera} />
                      <InfoBox label="Location" value={selectedCase.location} icon={MapPin} />
                    </div>

                    {selectedCase.description && (
                      <div className="border-t border-white/[0.07] px-5 py-4">
                        <p className="text-xs leading-5 text-white/40">{selectedCase.description}</p>
                      </div>
                    )}

                    <div className="border-t border-white/[0.07] px-5 py-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <MiniMetric label="Evidence Items" value={String(activeCaseEvidence.length).padStart(2, "0")} />
                        <MiniMetric label="Video Sources" value={String(activeCaseEvidence.filter((e) => e.type.startsWith("video")).length).padStart(2, "0")} />
                        <MiniMetric label="Created" value={selectedCase.createdAt.split(",")[0]} />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                    <SectionHeader icon={Activity} title="Case Intelligence" subtitle="Live analysis state" />
                    <div className="mt-5 space-y-3">
                      <ActivityRow icon={CheckCircle2} title="Case profile created" meta={selectedCase.id} status="READY" />
                      <ActivityRow icon={Server} title="Evidence registered" meta={`${activeCaseEvidence.length} items`} status={activeCaseEvidence.length ? "READY" : "WAITING"} />
                      <ActivityRow icon={Clock3} title="Timeline analysis" meta="Open module" status="READY" />
                      <ActivityRow icon={Box} title="Spatial analysis" meta="Open module" status="READY" />
                    </div>
                  </section>
                </div>
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  title="No investigation created"
                  description="Create your first case. Nothing is preloaded."
                  action="CREATE FIRST CASE"
                  onClick={() => setShowCreateCase(true)}
                />
              )}

              {cases.length > 0 && (
                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <SectionHeader icon={ClipboardList} title="Your Cases" subtitle="Select an investigation to work on" />
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {cases.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedCaseId(item.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          item.id === selectedCaseId
                            ? "border-cyan-400/30 bg-cyan-400/[0.05]"
                            : "border-white/[0.07] bg-black/10 hover:border-cyan-400/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-cyan-300/70">{item.id}</span>
                          <span className="text-[8px] uppercase tracking-wider text-emerald-400">{item.status}</span>
                        </div>
                        <h3 className="mt-3 text-sm font-semibold">{item.incident}</h3>
                        <p className="mt-1 text-[10px] text-white/30">{item.location}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <SectionHeader icon={Activity} title="Investigation Activity" subtitle="Live forensic operations" />
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <ActivityCard number="01" title="Evidence Intake" description="Register your own CCTV evidence." status={totalEvidence ? "ACTIVE" : "READY"} />
                  <ActivityCard number="02" title="Device Identification" description="Enter the actual device profile." status={deviceForm.vendor ? "ACTIVE" : "READY"} />
                  <ActivityCard number="03" title="Filesystem Analysis" description="Select a real storage/evidence file." status={parserFile ? "ACTIVE" : "READY"} />
                </div>
              </section>
            </section>
          )}

          {activeView === "evidence" && (
            <section className="space-y-5">
              <Panel icon={FolderOpen} title="Evidence Intake" description="Select and register your own CCTV footage inside the active investigation." />

              <div className="rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.02] p-8 text-center">
                <input
                  ref={evidenceInputRef}
                  type="file"
                  accept="video/*,.raw,.dav,.bin,.264,.265"
                  className="hidden"
                  onChange={(e) => chooseEvidence(e.target.files?.[0] ?? null)}
                />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05]">
                  <Upload className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">Choose Evidence File</h3>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/35">
                  Nothing is preloaded. Select a CCTV video or forensic evidence file from your computer.
                </p>
                <button
                  onClick={() => evidenceInputRef.current?.click()}
                  className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                >
                  SELECT FILE
                </button>
                {selectedEvidence && (
                  <div className="mx-auto mt-5 max-w-xl rounded-xl border border-white/[0.08] bg-black/20 p-4 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold">{selectedEvidence.name}</div>
                        <div className="mt-1 text-[10px] text-white/30">
                          {selectedEvidence.type || "unknown"} · {(selectedEvidence.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button onClick={() => chooseEvidence(null)} className="text-white/30 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={registerEvidence}
                  disabled={!selectedEvidence || !selectedCase}
                  className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  REGISTER EVIDENCE
                </button>
                {evidenceMessage && <div className="mt-3 font-mono text-[9px] text-cyan-300">{evidenceMessage}</div>}
              </div>

              {selectedCase && (
                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <SectionHeader icon={Video} title={`Registered Evidence · ${selectedCase.id}`} subtitle="Files registered to the selected case" />
                  <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {activeCaseEvidence.length === 0 ? (
                      <div className="text-xs text-white/30">No evidence registered for this case yet.</div>
                    ) : (
                      activeCaseEvidence.map((item) => (
                        <div key={item.id} className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <Video className="h-4 w-4 shrink-0 text-cyan-300" />
                            <button onClick={() => removeEvidence(item.id)} className="text-white/20 hover:text-red-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="mt-4 truncate text-xs font-semibold">{item.name}</div>
                          <div className="mt-2 text-[9px] text-white/30">
                            {item.type || "unknown"} · {(item.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
            </section>
          )}

          {activeView === "device" && (
            <section className="space-y-5">
              <Panel icon={HardDrive} title="Device Identification" description="Enter the actual DVR/NVR/device information. Fields are intentionally blank." />

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["vendor", "Vendor", "e.g. Hikvision"],
                    ["model", "Model", "e.g. DS-7608NI"],
                    ["serial", "Serial Number", "Enter serial number"],
                    ["firmware", "Firmware", "Enter firmware version"],
                    ["sourceType", "Source Type", "e.g. DVR / NVR / Camera"],
                    ["acquisitionMethod", "Acquisition Method", "e.g. Logical Export"],
                  ].map(([key, label, placeholder]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">{label}</span>
                      <input
                        value={deviceForm[key as keyof typeof deviceForm]}
                        onChange={(e) => {
                          setDeviceForm((prev) => ({ ...prev, [key]: e.target.value }));
                          setDeviceResult(null);
                        }}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3 text-xs text-white outline-none placeholder:text-white/15 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={analyzeDevice}
                    className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                  >
                    <ScanSearch className="h-4 w-4" />
                    ANALYZE INPUT
                  </button>
                  <button
                    onClick={() => {
                      setDeviceForm({ vendor: "", model: "", serial: "", firmware: "", sourceType: "", acquisitionMethod: "" });
                      setDeviceResult(null);
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
                  >
                    RESET
                  </button>
                </div>

                {deviceResult && (
                  <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-300/60">Analysis Result</div>
                    <div className="mt-2 text-sm font-semibold text-cyan-200">{deviceResult}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeView === "parser" && (
            <section className="space-y-5">
              <Panel icon={Database} title="Filesystem Parser" description="Select a real evidence image or storage file before analysis." />

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-10">
                <input
                  ref={parserInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => chooseParserFile(e.target.files?.[0] ?? null)}
                />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-3xl" />
                <div className="relative flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05]">
                    <ScanSearch className="h-7 w-7 text-cyan-300" />
                  </div>
                  <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/50">Parser Console</div>
                  <h3 className="mt-2 text-xl font-semibold">Filesystem Analysis</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
                    Select an evidence image or storage source. The browser will only inspect the selected file metadata here; proprietary filesystem parsing requires the backend parser.
                  </p>
                  <button
                    onClick={() => parserInputRef.current?.click()}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                  >
                    <Search className="h-4 w-4" />
                    SELECT EVIDENCE FILE
                  </button>
                  {parserFile && (
                    <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/20 px-5 py-4 text-left">
                      <div className="text-xs font-semibold">{parserFile.name}</div>
                      <div className="mt-1 text-[9px] text-white/30">{(parserFile.size / 1024 / 1024).toFixed(2)} MB · {parserFile.type || "unknown type"}</div>
                    </div>
                  )}
                  <button
                    onClick={analyzeParserFile}
                    className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400"
                  >
                    ANALYZE SELECTED INPUT
                  </button>
                  {parserResult && <div className="mt-3 font-mono text-[9px] text-cyan-300">{parserResult}</div>}
                </div>
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-300" />
                  <h2 className="text-sm font-semibold">Forensic Investigation Tools</h2>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/25">Specialized analysis modules</p>
              </div>
              <span className="hidden font-mono text-[9px] text-white/20 sm:block">03 MODULES AVAILABLE</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <ToolCard href="/forensics/carving" icon={FileSearch} title="Carving Lab" description="Analyze prepared evidence and recover simulated deleted footage." />
              <ToolCard href="/timeline-calibration" icon={Clock3} title="Timeline Calibration" description="Calibrate DVR clock offsets and normalize investigation timestamps." />
              <ToolCard href="/spatial-reconstruction" icon={Box} title="Spatial Reconstruction" description="Interactive 2D-to-3D spatial analysis prototype for CCTV investigation." />
            </div>
          </section>

          <footer className="mt-10 border-t border-white/[0.07] pt-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-wider text-white/20">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.6)]" />NEXORA System Online</span>
              <span>Local forensic workflow</span>
              <span>User-driven evidence intake</span>
              <span>No unsupported evidence claims</span>
            </div>
          </footer>
        </main>
      </div>

      {showCreateCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-400/15 bg-[#080d14] p-6 shadow-[0_0_60px_rgba(34,211,238,.08)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/60">NEXORA CASE CREATION</div>
                <h2 className="mt-2 text-xl font-semibold">Create Investigation</h2>
                <p className="mt-1 text-xs text-white/30">Enter your own investigation details.</p>
              </div>
              <button onClick={() => setShowCreateCase(false)} className="text-white/30 hover:text-white"><X /></button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-wider text-white/30">Incident / Case Name *</span>
                <input
                  autoFocus
                  value={caseForm.incident}
                  onChange={(e) => setCaseForm((p) => ({ ...p, incident: e.target.value }))}
                  placeholder="Enter incident name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-wider text-white/30">Location *</span>
                <input
                  value={caseForm.location}
                  onChange={(e) => setCaseForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Enter incident location"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-wider text-white/30">Description</span>
                <textarea
                  rows={4}
                  value={caseForm.description}
                  onChange={(e) => setCaseForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional investigation notes"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreateCase(false)} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white">CANCEL</button>
              <button
                onClick={createCase}
                disabled={!caseForm.incident.trim() || !caseForm.location.trim()}
                className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black disabled:cursor-not-allowed disabled:opacity-30"
              >
                CREATE CASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.03] px-3 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">{label}</span>
    </div>
  );
}

function DashboardCard({ icon: Icon, title, value, description, accent }: {
  icon: React.ElementType; title: string; value: string; description: string;
  accent: "cyan" | "blue" | "violet" | "green";
}) {
  const accentClasses = {
    cyan: "text-cyan-300 bg-cyan-300/[0.07] border-cyan-300/10",
    blue: "text-blue-300 bg-blue-300/[0.07] border-blue-300/10",
    violet: "text-violet-300 bg-violet-300/[0.07] border-violet-300/10",
    green: "text-emerald-300 bg-emerald-300/[0.07] border-emerald-300/10",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.14]">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/[0.025] blur-2xl transition group-hover:bg-cyan-400/[0.06]" />
      <div className="relative">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accentClasses[accent]}`}><Icon className="h-4 w-4" /></div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="font-mono text-3xl font-bold tracking-tight">{value}</div>
            <div className="mt-1 text-xs font-semibold text-white/80">{title}</div>
            <p className="mt-1 text-[10px] text-white/30">{description}</p>
          </div>
          <Activity className="h-4 w-4 text-white/10" />
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-cyan-400/15">
      <div className="flex items-center justify-between"><p className="text-[9px] uppercase tracking-[0.18em] text-white/25">{label}</p><Icon className="h-3.5 w-3.5 text-white/20" /></div>
      <p className="mt-3 text-sm font-semibold leading-5 text-white/85">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div><div className="font-mono text-lg font-semibold text-white/85">{value}</div><div className="mt-1 text-[9px] uppercase tracking-wider text-white/25">{label}</div></div>;
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]"><Icon className="h-4 w-4 text-cyan-300/80" /></div>
      <div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-0.5 text-[10px] text-white/25">{subtitle}</p></div>
    </div>
  );
}

function ActivityRow({ icon: Icon, title, meta, status }: { icon: React.ElementType; title: string; meta: string; status: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]"><Icon className="h-3.5 w-3.5 text-cyan-300/70" /></div>
      <div className="min-w-0 flex-1"><div className="truncate text-xs font-medium text-white/75">{title}</div><div className="mt-0.5 text-[9px] text-white/25">{meta}</div></div>
      <span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-400">{status}</span>
    </div>
  );
}

function ActivityCard({ number, title, description, status }: { number: string; title: string; description: string; status: string }) {
  return (
    <div className="group rounded-xl border border-white/[0.07] bg-black/10 p-4 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.02]">
      <div className="flex items-center justify-between"><span className="font-mono text-[10px] text-cyan-300/50">OP-{number}</span><span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-400">{status}</span></div>
      <h3 className="mt-4 text-xs font-semibold">{title}</h3>
      <p className="mt-2 text-[10px] leading-5 text-white/30">{description}</p>
      <div className="mt-4 h-px w-full bg-white/[0.06]" />
    </div>
  );
}

function Panel({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]"><Icon className="h-5 w-5 text-cyan-300" /></div>
        <div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-white/30">{description}</p></div>
      </div>
    </div>
  );
}

function ToolCard({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string }) {
  return (
    <a href={href} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-cyan-400/[0.025]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/[0.025] blur-2xl transition group-hover:bg-cyan-400/[0.07]" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]"><Icon className="h-4 w-4 text-cyan-300" /></div>
          <ArrowRight className="h-4 w-4 text-white/20 transition duration-200 group-hover:translate-x-1 group-hover:text-cyan-300" />
        </div>
        <h3 className="mt-5 text-sm font-semibold">{title}</h3>
        <p className="mt-2 text-xs leading-5 text-white/30">{description}</p>
        <div className="mt-5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-white/25 transition group-hover:text-cyan-300/70">Open module<ChevronRight className="h-3 w-3" /></div>
      </div>
    </a>
  );
}

function EmptyState({ icon: Icon, title, description, action, onClick }: {
  icon: React.ElementType; title: string; description: string; action: string; onClick: () => void;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-cyan-400/15 bg-cyan-400/[0.02] p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04]"><Icon className="h-6 w-6 text-cyan-300" /></div>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-xs text-white/30">{description}</p>
      <button onClick={onClick} className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200">{action}</button>
    </section>
  );
}
