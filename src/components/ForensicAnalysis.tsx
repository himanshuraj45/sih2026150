"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Box,
  Camera,
  ClipboardList,
  Database,
  FileSearch,
  FolderOpen,
  HardDrive,
  ScanSearch,
  ShieldCheck,
  Video,
  Clock3,
} from "lucide-react";

type ForensicView =
  | "cases"
  | "evidence"
  | "device"
  | "parser";

export default function ForensicAnalysis() {
  const [activeView, setActiveView] =
    useState<ForensicView>("cases");

  const navLinks = [
    {
      href: "/forensics/carving",
      label: "Carving Lab",
      icon: FileSearch,
    },
    {
      href: "/timeline-calibration",
      label: "Timeline Calibration",
      icon: Clock3,
    },
    {
      href: "/spatial-reconstruction",
      label: "Spatial Reconstruction",
      icon: Box,
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#080b11]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-[0.2em]">
                  NEXORA
                </h1>

                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Forensic Operations
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  <Icon className="h-4 w-4" />

                  <span>{item.label}</span>

                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* MOBILE NAV */}
        <div className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-6 pb-4 md:hidden">
          {navLinks.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1500px] px-6 py-8">
        {/* TITLE */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Video className="h-4 w-4" />
            Surveillance Evidence Platform
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Forensic Analysis
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
            Unified workflow for CCTV evidence intake, device
            identification, filesystem analysis, recovery and
            forensic investigation.
          </p>
        </div>

        {/* TABS */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveView("cases")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeView === "cases"
                ? "bg-white text-black"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Case Management
          </button>

          <button
            onClick={() => setActiveView("evidence")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeView === "evidence"
                ? "bg-white text-black"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Evidence Intake
          </button>

          <button
            onClick={() => setActiveView("device")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeView === "device"
                ? "bg-white text-black"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <HardDrive className="h-4 w-4" />
            Device Identification
          </button>

          <button
            onClick={() => setActiveView("parser")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeView === "parser"
                ? "bg-white text-black"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <Database className="h-4 w-4" />
            Filesystem Parser
          </button>
        </div>

        {/* CASE MANAGEMENT */}
        {activeView === "cases" && (
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              icon={ClipboardList}
              title="Active Cases"
              value="01"
              description="Current forensic investigations"
            />

            <DashboardCard
              icon={Video}
              title="CCTV Evidence"
              value="03"
              description="Video evidence available"
            />

            <DashboardCard
              icon={HardDrive}
              title="Devices"
              value="04"
              description="Detected evidence sources"
            />

            <DashboardCard
              icon={ShieldCheck}
              title="Integrity"
              value="100%"
              description="Evidence verification status"
            />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:col-span-2 lg:col-span-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Current Investigation
                  </h3>

                  <p className="mt-1 text-xs text-white/40">
                    NEXORA DEMO UNIT
                  </p>
                </div>

                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white/50">
                  Active
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoBox
                  label="Case ID"
                  value="NX-2026-001"
                />

                <InfoBox
                  label="Incident"
                  value="Warehouse Perimeter Incident"
                />

                <InfoBox
                  label="Location"
                  value="Sector 18, Noida"
                />
              </div>
            </div>
          </section>
        )}

        {/* EVIDENCE */}
        {activeView === "evidence" && (
          <section className="space-y-5">
            <Panel
              icon={FolderOpen}
              title="Evidence Intake"
              description="Register CCTV footage and forensic evidence."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <EvidenceCard
                title="CCTV Gate"
                type="MP4"
                status="Available"
              />

              <EvidenceCard
                title="CCTV Gate Camera 3"
                type="MP4"
                status="Available"
              />

              <EvidenceCard
                title="CCTV Walking"
                type="MP4"
                status="Available"
              />
            </div>
          </section>
        )}

        {/* DEVICE */}
        {activeView === "device" && (
          <section>
            <Panel
              icon={HardDrive}
              title="Device Identification"
              description="Identify DVR/NVR vendors and evidence sources."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                "Hikvision",
                "Dahua",
                "CP Plus",
                "Uniview",
                "Honeywell",
                "Matrix",
                "Godrej",
                "TP-Link",
              ].map((vendor) => (
                <div
                  key={vendor}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <Camera className="mb-4 h-5 w-5 text-white/50" />

                  <h3 className="font-medium">
                    {vendor}
                  </h3>

                  <p className="mt-1 text-xs text-white/40">
                    Vendor profile available
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PARSER */}
        {activeView === "parser" && (
          <section>
            <Panel
              icon={Database}
              title="Filesystem Parser"
              description="Analyze proprietary DVR/NVR storage structures and video formats."
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <ScanSearch className="mb-4 h-10 w-10 text-white/30" />

                <h3 className="font-semibold">
                  Parser Console
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                  Select an evidence image or storage source to
                  begin filesystem and video-format analysis.
                </p>

                <button className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80">
                  Open Parser
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TOOLS */}
        <section className="mt-10">
          <div className="mb-4">
            <h3 className="font-semibold">
              Forensic Investigation Tools
            </h3>

            <p className="mt-1 text-xs text-white/40">
              Specialized analysis modules
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ToolCard
              href="/forensics/carving"
              icon={FileSearch}
              title="Carving Lab"
              description="Analyze prepared evidence and recover simulated deleted footage."
            />

            <ToolCard
              href="/timeline-calibration"
              icon={Clock3}
              title="Timeline Calibration"
              description="Calibrate DVR clock offsets and normalize investigation timestamps."
            />

            <ToolCard
              href="/spatial-reconstruction"
              icon={Box}
              title="Spatial Reconstruction"
              description="Interactive 2D-to-3D spatial analysis prototype for CCTV investigation."
            />
          </div>
        </section>

        {/* FOOTER STATUS */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/30">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            NEXORA SYSTEM ONLINE
          </span>

          <span>•</span>

          <span>Local forensic workflow</span>

          <span>•</span>

          <span>Evidence integrity enabled</span>
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function DashboardCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <Icon className="mb-5 h-5 w-5 text-white/40" />

      <div className="text-3xl font-bold">
        {value}
      </div>

      <div className="mt-1 font-medium">
        {title}
      </div>

      <p className="mt-1 text-xs text-white/40">
        {description}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/30">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white/80">
        {value}
      </p>
    </div>
  );
}

function EvidenceCard({
  title,
  type,
  status,
}: {
  title: string;
  type: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <Video className="mb-4 h-5 w-5 text-white/40" />

      <h3 className="font-medium">
        {title}
      </h3>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-white/40">
          {type}
        </span>

        <span className="text-green-400">
          {status}
        </span>
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-sm text-white/40">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/40">
        {description}
      </p>
    </a>
  );
}