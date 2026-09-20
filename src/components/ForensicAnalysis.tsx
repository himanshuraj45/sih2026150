"use client";

import React, { useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
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
  Menu,
  ScanSearch,
  Search,
  ShieldCheck,
  Video,
  X,
  Zap,
  Plus,
  Upload,
  Trash2,
  FileText,
  Download,
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

const emptyDevice = {
  vendor: "",
  model: "",
  serial: "",
  firmware: "",
  sourceType: "",
  acquisitionMethod: "",
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${
    units[index]
  }`;
}

function getExtension(name: string) {
  if (!name.includes(".")) return "UNKNOWN";
  return name.split(".").pop()?.toUpperCase() || "UNKNOWN";
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

async function fileToDataUrl(file: File): Promise<string | null> {
  if (!isImageFile(file)) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : null);
    };

    reader.onerror = () => resolve(null);

    reader.readAsDataURL(file);
  });
}

async function videoToDataUrl(file: File): Promise<string | null> {
  if (!isVideoFile(file)) return null;

  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration)
        ? video.duration
        : 0;

      video.currentTime = Math.min(1, Math.max(0, duration / 2));
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const result = canvas.toDataURL("image/jpeg", 0.82);

        URL.revokeObjectURL(url);
        resolve(result);
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
}

export default function ForensicAnalysis() {
  const [activeView, setActiveView] =
    useState<ForensicView>("cases");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] =
    useState<string | null>(null);

  const [showCreateCase, setShowCreateCase] =
    useState(false);

  const [caseForm, setCaseForm] =
    useState(emptyCaseForm);

  const [evidence, setEvidence] =
    useState<EvidenceRecord[]>([]);

  const [selectedEvidence, setSelectedEvidence] =
    useState<File | null>(null);

  const [evidenceMessage, setEvidenceMessage] =
    useState("");

  const [deviceForm, setDeviceForm] =
    useState(emptyDevice);

  const [deviceResult, setDeviceResult] =
    useState<string | null>(null);

  const [parserFile, setParserFile] =
    useState<File | null>(null);

  const [parserResult, setParserResult] =
    useState<string | null>(null);

  const [reportMessage, setReportMessage] =
    useState("");

  const evidenceInputRef =
    useRef<HTMLInputElement>(null);

  const parserInputRef =
    useRef<HTMLInputElement>(null);

  const selectedCase =
    cases.find((item) => item.id === selectedCaseId) ??
    null;

  const selectedCaseEvidence = useMemo(
    () =>
      selectedCase
        ? evidence.filter((item) =>
            item.id.startsWith(`${selectedCase.id}-`)
          )
        : [],
    [evidence, selectedCase]
  );

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

  const workspaceTabs = [
    {
      id: "cases" as ForensicView,
      label: "Case Management",
      icon: ClipboardList,
    },
    {
      id: "evidence" as ForensicView,
      label: "Evidence Intake",
      icon: FolderOpen,
    },
    {
      id: "device" as ForensicView,
      label: "Device Identification",
      icon: HardDrive,
    },
    {
      id: "parser" as ForensicView,
      label: "Filesystem Parser",
      icon: Database,
    },
  ];

  function createCase() {
    const incident = caseForm.incident.trim();
    const location = caseForm.location.trim();

    if (!incident || !location) return;

    const id =
      `NX-${new Date().getFullYear()}-` +
      `${String(cases.length + 1).padStart(3, "0")}`;

    const newCase: CaseRecord = {
      id,
      incident,
      location,
      description: caseForm.description.trim(),
      status: "ACTIVE",
      createdAt: new Date().toLocaleString(),
    };

    setCases((previous) => [
      ...previous,
      newCase,
    ]);

    setSelectedCaseId(id);
    setCaseForm(emptyCaseForm);
    setShowCreateCase(false);
    setActiveView("cases");
  }

  function chooseEvidence(file: File | null) {
    setSelectedEvidence(file);

    if (file) {
      setEvidenceMessage(
        `SELECTED · ${file.name}`
      );
    } else {
      setEvidenceMessage("");
    }
  }

  function registerEvidence() {
    if (!selectedCase) {
      setEvidenceMessage(
        "CREATE OR SELECT A CASE FIRST."
      );
      return;
    }

    if (!selectedEvidence) {
      setEvidenceMessage(
        "CHOOSE AN EVIDENCE FILE FIRST."
      );
      return;
    }

    const record: EvidenceRecord = {
      id:
        `${selectedCase.id}-${Date.now()}`,
      name: selectedEvidence.name,
      type:
        selectedEvidence.type ||
        "application/octet-stream",
      size: selectedEvidence.size,
      file: selectedEvidence,
      addedAt: new Date().toLocaleString(),
    };

    setEvidence((previous) => [
      ...previous,
      record,
    ]);

    setEvidenceMessage(
      `REGISTERED · ${selectedEvidence.name}`
    );

    setSelectedEvidence(null);

    if (evidenceInputRef.current) {
      evidenceInputRef.current.value = "";
    }
  }

  function removeEvidence(id: string) {
    setEvidence((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    setEvidenceMessage("EVIDENCE REMOVED.");
  }

  function analyzeDevice() {
    const values = Object.values(deviceForm);
    const filled = values.filter(
      (value) => value.trim()
    ).length;

    if (
      !deviceForm.vendor.trim() ||
      !deviceForm.model.trim()
    ) {
      setDeviceResult(
        "INCOMPLETE · Vendor and model are required."
      );
      return;
    }

    if (filled === values.length) {
      setDeviceResult(
        "PROFILE COMPLETE · All device fields supplied."
      );
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
      setParserResult("NO FILE SELECTED.");
      return;
    }

    setParserResult(
      `INPUT READY · ${getExtension(
        parserFile.name
      )} · ${formatBytes(parserFile.size)}`
    );
  }

  async function generateForensicReport() {
    if (!selectedCase) {
      setReportMessage(
        "CREATE OR SELECT A CASE BEFORE GENERATING THE REPORT."
      );
      return;
    }

    try {
      setReportMessage(
        "BUILDING FORENSIC REPORT..."
      );

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 16;

      let y = 20;

      const cyan: [number, number, number] =
        [20, 210, 235];

      const dark: [number, number, number] =
        [5, 8, 13];

      const gray: [number, number, number] =
        [110, 120, 130];

      const green: [number, number, number] =
        [50, 200, 120];

      pdf.setFillColor(...dark);
      pdf.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
      );

      function newPage(title = "NEXORA FORENSIC REPORT") {
        pdf.addPage();

        pdf.setFillColor(...dark);
        pdf.rect(
          0,
          0,
          pageWidth,
          pageHeight,
          "F"
        );

        pdf.setTextColor(...cyan);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");

        pdf.text(
          title.toUpperCase(),
          margin,
          13
        );

        pdf.setDrawColor(25, 50, 60);

        pdf.line(
          margin,
          17,
          pageWidth - margin,
          17
        );

        y = 26;
      }

      function ensureSpace(height = 20) {
        if (y + height > pageHeight - 20) {
          newPage();
        }
      }

      function title(text: string) {
        ensureSpace(15);

        pdf.setTextColor(...cyan);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);

        pdf.text(
          text,
          margin,
          y
        );

        y += 9;

        pdf.setDrawColor(20, 70, 80);

        pdf.line(
          margin,
          y,
          pageWidth - margin,
          y
        );

        y += 8;
      }

      function labelValue(
        label: string,
        value: string
      ) {
        ensureSpace(13);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(...gray);

        pdf.text(
          label.toUpperCase(),
          margin,
          y
        );

        y += 4.5;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(
          225,
          230,
          235
        );

        const lines =
          pdf.splitTextToSize(
            value || "NOT PROVIDED",
            pageWidth - margin * 2
          );

        pdf.text(
          lines,
          margin,
          y
        );

        y +=
          Math.max(
            6,
            lines.length * 4.5
          ) + 3;
      }

      function paragraph(text: string) {
        ensureSpace(20);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(
          200,
          205,
          210
        );

        const lines =
          pdf.splitTextToSize(
            text,
            pageWidth - margin * 2
          );

        pdf.text(
          lines,
          margin,
          y
        );

        y +=
          lines.length * 4.5 + 5;
      }

      function badge(
        text: string,
        x: number,
        yy: number
      ) {
        pdf.setFillColor(
          12,
          28,
          35
        );

        pdf.roundedRect(
          x,
          yy - 5,
          42,
          8,
          2,
          2,
          "F"
        );

        pdf.setTextColor(...cyan);
        pdf.setFontSize(7);
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          text,
          x + 4,
          yy
        );
      }

      function footer() {
        pdf.setTextColor(
          80,
          90,
          100
        );

        pdf.setFontSize(7);

        pdf.text(
          "NEXORA · FORENSIC OPERATIONS · USER-GENERATED REPORT",
          margin,
          pageHeight - 9
        );

        pdf.text(
          `PAGE ${pdf.getCurrentPageInfo().pageNumber}`,
          pageWidth - margin,
          pageHeight - 9,
          { align: "right" }
        );
      }

      /* COVER */

      pdf.setFillColor(
        3,
        5,
        9
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
      );

      pdf.setTextColor(...cyan);
      pdf.setFont(
        "helvetica",
        "bold"
      );
      pdf.setFontSize(11);

      pdf.text(
        "NEXORA / FORENSIC OPERATIONS",
        margin,
        32
      );

      pdf.setTextColor(
        240,
        245,
        248
      );

      pdf.setFontSize(29);

      pdf.text(
        "FORENSIC",
        margin,
        65
      );

      pdf.text(
        "INVESTIGATION REPORT",
        margin,
        77
      );

      pdf.setTextColor(...gray);
      pdf.setFontSize(10);

      pdf.text(
        "CCTV / DVR / NVR EVIDENCE WORKSPACE",
        margin,
        90
      );

      pdf.setDrawColor(
        ...cyan
      );

      pdf.line(
        margin,
        101,
        pageWidth - margin,
        101
      );

      pdf.setTextColor(
        230,
        235,
        240
      );

      pdf.setFontSize(10);

      pdf.text(
        "CASE IDENTIFIER",
        margin,
        122
      );

      pdf.setFontSize(18);
      pdf.setTextColor(...cyan);

      pdf.text(
        selectedCase.id,
        margin,
        133
      );

      pdf.setTextColor(
        210,
        215,
        220
      );

      pdf.setFontSize(10);

      pdf.text(
        selectedCase.incident,
        margin,
        146
      );

      pdf.setTextColor(...gray);
      pdf.setFontSize(8);

      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        margin,
        161
      );

      pdf.text(
        `Evidence records: ${selectedCaseEvidence.length}`,
        margin,
        168
      );

      pdf.text(
        "LOCAL INVESTIGATION WORKSPACE",
        margin,
        pageHeight - 25
      );

      pdf.setTextColor(
        70,
        80,
        90
      );

      pdf.setFontSize(7);

      pdf.text(
        "This report contains information entered or selected by the investigator.",
        margin,
        pageHeight - 17
      );

      /* CASE */

      newPage("Case Summary");

      title("Case Summary");

      labelValue(
        "Case ID",
        selectedCase.id
      );

      labelValue(
        "Incident",
        selectedCase.incident
      );

      labelValue(
        "Location",
        selectedCase.location
      );

      labelValue(
        "Status",
        selectedCase.status
      );

      labelValue(
        "Created",
        selectedCase.createdAt
      );

      labelValue(
        "Description",
        selectedCase.description ||
          "No description supplied."
      );

      /* OVERVIEW */

      title("Investigation Overview");

      labelValue(
        "Evidence Records",
        String(selectedCaseEvidence.length)
      );

      labelValue(
        "Device Profile",
        deviceForm.vendor &&
          deviceForm.model
          ? "DEVICE DATA ENTERED"
          : "NOT ENTERED"
      );

      labelValue(
        "Filesystem Input",
        parserFile
          ? parserFile.name
          : "NO FILE SELECTED"
      );

      labelValue(
        "Timeline Calibration",
        "Module available separately; no timeline result is stored in this workspace state."
      );

      labelValue(
        "Spatial Reconstruction",
        "Module available separately; no spatial result is stored in this workspace state."
      );

      /* EVIDENCE */

      newPage("Evidence Register");

      title("Evidence Register");

      if (!selectedCaseEvidence.length) {
        paragraph(
          "No evidence records have been registered for this case."
        );
      }

      for (
        let i = 0;
        i < selectedCaseEvidence.length;
        i++
      ) {
        const item =
          selectedCaseEvidence[i];

        ensureSpace(42);

        pdf.setFillColor(
          10,
          16,
          23
        );

        pdf.roundedRect(
          margin,
          y - 5,
          pageWidth - margin * 2,
          34,
          3,
          3,
          "F"
        );

        pdf.setTextColor(...cyan);
        pdf.setFontSize(8);
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          `EVIDENCE ${String(i + 1).padStart(2, "0")}`,
          margin + 5,
          y + 2
        );

        pdf.setTextColor(
          230,
          235,
          240
        );

        pdf.setFontSize(10);

        pdf.text(
          item.name,
          margin + 5,
          y + 9
        );

        pdf.setTextColor(...gray);
        pdf.setFontSize(8);

        pdf.text(
          `TYPE: ${item.type || "UNKNOWN"}`,
          margin + 5,
          y + 15
        );

        pdf.text(
          `SIZE: ${formatBytes(item.size)}`,
          margin + 5,
          y + 21
        );

        pdf.text(
          `REGISTERED: ${item.addedAt}`,
          margin + 5,
          y + 27
        );

        y += 40;
      }

      /* EVIDENCE PREVIEWS */

      if (selectedCaseEvidence.length) {
        newPage("Evidence Preview");

        title("Evidence Pictures / Preview Frames");

        for (
          const item of selectedCaseEvidence
        ) {
          ensureSpace(85);

          pdf.setTextColor(
            225,
            230,
            235
          );

          pdf.setFontSize(9);

          pdf.text(
            item.name,
            margin,
            y
          );

          y += 6;

          let preview: string | null =
            null;

          if (isImageFile(item.file)) {
            preview =
              await fileToDataUrl(
                item.file
              );
          } else if (
            isVideoFile(item.file)
          ) {
            preview =
              await videoToDataUrl(
                item.file
              );
          }

          if (preview) {
            try {
              pdf.addImage(
                preview,
                "JPEG",
                margin,
                y,
                pageWidth - margin * 2,
                62,
                undefined,
                "MEDIUM"
              );

              y += 68;
            } catch {
              paragraph(
                "Preview could not be embedded."
              );
            }
          } else {
            pdf.setFillColor(
              12,
              18,
              24
            );

            pdf.roundedRect(
              margin,
              y,
              pageWidth - margin * 2,
              35,
              3,
              3,
              "F"
            );

            pdf.setTextColor(...gray);
            pdf.setFontSize(8);

            pdf.text(
              "NO IMAGE PREVIEW AVAILABLE",
              pageWidth / 2,
              y + 19,
              {
                align: "center",
              }
            );

            y += 43;
          }
        }
      }

      /* DEVICE */

      newPage("Device Identification");

      title("Device Identification");

      labelValue(
        "Vendor",
        deviceForm.vendor
      );

      labelValue(
        "Model",
        deviceForm.model
      );

      labelValue(
        "Serial Number",
        deviceForm.serial
      );

      labelValue(
        "Firmware",
        deviceForm.firmware
      );

      labelValue(
        "Source Type",
        deviceForm.sourceType
      );

      labelValue(
        "Acquisition Method",
        deviceForm.acquisitionMethod
      );

      labelValue(
        "Analysis Result",
        deviceResult ||
          "Device analysis has not been executed."
      );

      /* PARSER */

      title("Filesystem Analysis");

      labelValue(
        "Selected Input",
        parserFile
          ? parserFile.name
          : "No parser input selected."
      );

      if (parserFile) {
        labelValue(
          "Input Type",
          parserFile.type ||
            "Unknown MIME type"
        );

        labelValue(
          "Input Size",
          formatBytes(parserFile.size)
        );

        labelValue(
          "Extension",
          getExtension(
            parserFile.name
          )
        );
      }

      labelValue(
        "Parser Result",
        parserResult ||
          "Filesystem analysis has not been executed."
      );

      /* WORKFLOW */

      newPage("Investigation Workflow");

      title("Evidence Workflow");

      const boxWidth =
        (pageWidth -
          margin * 2 -
          20) /
        3;

      const boxes = [
        {
          x: margin,
          label: "CASE",
          value: selectedCase.id,
        },
        {
          x: margin + boxWidth + 10,
          label: "EVIDENCE",
          value: `${selectedCaseEvidence.length} RECORDS`,
        },
        {
          x:
            margin +
            (boxWidth + 10) * 2,
          label: "DEVICE",
          value:
            deviceForm.vendor ||
            "NOT ENTERED",
        },
      ];

      for (const box of boxes) {
        pdf.setFillColor(
          10,
          18,
          24
        );

        pdf.setDrawColor(
          20,
          80,
          90
        );

        pdf.roundedRect(
          box.x,
          y,
          boxWidth,
          35,
          3,
          3,
          "FD"
        );

        pdf.setTextColor(...cyan);
        pdf.setFontSize(8);
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          box.label,
          box.x + 5,
          y + 10
        );

        pdf.setTextColor(
          220,
          225,
          230
        );

        pdf.setFontSize(8);

        const lines =
          pdf.splitTextToSize(
            box.value,
            boxWidth - 10
          );

        pdf.text(
          lines,
          box.x + 5,
          y + 19
        );
      }

      y += 52;

      pdf.setTextColor(...cyan);
      pdf.setFontSize(16);

      pdf.text(
        "→",
        margin + boxWidth + 1,
        y - 34
      );

      pdf.text(
        "→",
        margin +
          (boxWidth + 10) * 2 -
          9,
        y - 34
      );

      paragraph(
        "The workflow shown above represents the records currently available in the NEXORA forensic workspace. It does not represent conclusions beyond the information entered or selected by the investigator."
      );

      /* FINDINGS */

      title("Recorded Findings");

      paragraph(
        selectedCaseEvidence.length
          ? `${selectedCaseEvidence.length} evidence record(s) are currently registered against this case.`
          : "No evidence records are currently registered against this case."
      );

      paragraph(
        deviceForm.vendor &&
          deviceForm.model
          ? "A device profile has been entered and analyzed using the information supplied in the Device Identification workspace."
          : "No complete device profile has been entered."
      );

      paragraph(
        parserFile
          ? "A filesystem input has been selected in the parser workspace. The current browser interface records the input metadata; proprietary filesystem parsing requires the backend parser."
          : "No filesystem parser input has been selected."
      );

      paragraph(
        "Timeline Calibration and Spatial Reconstruction remain separate analysis modules. Their actual results are not automatically inserted into this report unless their data is connected to the forensic workspace state."
      );

      /* INTEGRITY */

      title("Evidence Integrity Record");

      labelValue(
        "Registry State",
        selectedCaseEvidence.length
          ? "ACTIVE LOCAL EVIDENCE REGISTRY"
          : "NO EVIDENCE REGISTERED"
      );

      labelValue(
        "Hash Status",
        "SHA-256 hash values are not calculated by this report version."
      );

      labelValue(
        "Chain of Custody",
        "This browser prototype records registration metadata but does not claim a legally complete chain-of-custody process."
      );

      labelValue(
        "Report Generation",
        new Date().toLocaleString()
      );

      /* FINAL */

      newPage("Report Scope");

      title("Report Scope");

      paragraph(
        "NEXORA is a forensic investigation workspace prototype designed for CCTV/DVR/NVR evidence intake, device profiling, filesystem-analysis preparation and investigation workflow management."
      );

      paragraph(
        "All information in this report is derived from records currently available in the browser workspace. No unsupported identity, criminal attribution or forensic conclusion is generated by this report."
      );

      pdf.setFillColor(
        8,
        22,
        20
      );

      pdf.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        25,
        3,
        3,
        "F"
      );

      pdf.setTextColor(...green);
      pdf.setFontSize(9);
      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        "REPORT GENERATED SUCCESSFULLY",
        margin + 6,
        y + 10
      );

      pdf.setTextColor(
        170,
        185,
        180
      );

      pdf.setFontSize(7);

      pdf.text(
        "NEXORA FORENSIC OPERATIONS",
        margin + 6,
        y + 17
      );

      /* FOOTERS */

      const totalPages =
        pdf.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);
        footer();
      }

      const safeId =
        selectedCase.id.replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );

      pdf.save(
        `NEXORA_FORENSIC_REPORT_${safeId}.pdf`
      );

      setReportMessage(
        "REPORT GENERATED · PDF SAVED SUCCESSFULLY."
      );
    } catch (error) {
      console.error(error);

      setReportMessage(
        "REPORT GENERATION FAILED. CHECK THE BROWSER CONSOLE."
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#030509] text-white selection:bg-cyan-400/20 selection:text-cyan-100">
      {/* BACKGROUND GRID */}

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

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05070b]/90 backdrop-blur-xl">
        <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07]">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-[0.25em]">
                NEXORA
              </div>

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
              <span className="font-mono text-[10px] text-white/40">
                CASE
              </span>

              <span className="font-mono text-[10px] font-semibold text-white/80">
                {selectedCase?.id ??
                  "NO ACTIVE CASE"}
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
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-[11px] font-medium text-white/55 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.05] hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 text-white/40 group-hover:text-cyan-300" />

                  {item.label}

                  <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-cyan-300" />
                </a>
              );
            })}
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}

      {mobileOpen && (
        <div className="fixed inset-x-0 top-[72px] z-40 border-b border-white/10 bg-[#070a0f]/95 p-4 backdrop-blur-xl lg:hidden">
          <div className="grid gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65 hover:bg-white/[0.07] hover:text-white"
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
        {/* SIDEBAR */}

        <aside className="hidden w-[235px] shrink-0 border-r border-white/[0.07] lg:block">
          <div className="sticky top-[72px] p-5">
            <div className="mb-7">
              <div className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
                Investigation
              </div>

              <div className="space-y-1">
                {workspaceTabs.map(
                  (tab) => {
                    const Icon =
                      tab.icon;

                    const active =
                      activeView ===
                      tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() =>
                          setActiveView(
                            tab.id
                          )
                        }
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${
                          active
                            ? "border border-cyan-400/20 bg-cyan-400/[0.08] text-white"
                            : "border border-transparent text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 h-5 w-[2px] rounded-full bg-cyan-300" />
                        )}

                        <Icon
                          className={`h-4 w-4 ${
                            active
                              ? "text-cyan-300"
                              : "text-white/30"
                          }`}
                        />

                        <span>
                          {tab.label}
                        </span>

                        {active && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-cyan-300/60" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mb-7">
              <div className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
                Analysis Modules
              </div>

              <div className="space-y-1">
                {navLinks.map(
                  (item) => {
                    const Icon =
                      item.icon;

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
                  }
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  System Ready
                </span>
              </div>

              <div className="space-y-2 text-[10px] text-white/35">
                <div className="flex justify-between">
                  <span>Evidence Engine</span>
                  <span className="text-emerald-400">
                    READY
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Integrity Layer</span>
                  <span className="text-emerald-400">
                    ACTIVE
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Local Processing</span>
                  <span className="text-cyan-300">
                    ONLINE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}

        <main className="min-w-0 flex-1 px-5 py-7 lg:px-8 lg:py-9">
          <section className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                <Video className="h-3 w-3" />
                Surveillance Evidence Platform
              </span>

              <span className="text-white/15">
                /
              </span>

              <span className="font-mono text-[9px] uppercase tracking-wider text-white/25">
                Local Forensic Node
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Forensic Command Center
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                  Unified investigation workspace for CCTV evidence intake,
                  device identification, filesystem analysis, recovery and
                  forensic reconstruction.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/30">
                    Evidence Integrity
                  </div>

                  <div className="mt-0.5 text-xs font-semibold text-emerald-400">
                    {evidence.length
                      ? "LOCAL RECORDS ACTIVE"
                      : "WAITING FOR EVIDENCE"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MOBILE TABS */}

          <div className="mb-7 grid grid-cols-2 gap-2 border-b border-white/[0.07] pb-5 md:grid-cols-4 lg:hidden">
            {workspaceTabs.map(
              (tab) => {
                const Icon =
                  tab.icon;

                const active =
                  activeView ===
                  tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveView(
                        tab.id
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[11px] font-semibold ${
                      active
                        ? "bg-cyan-300 text-black"
                        : "border border-white/[0.08] bg-white/[0.025] text-white/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    <span className="hidden sm:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* CASE MANAGEMENT */}

          {activeView === "cases" && (
            <section className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    setShowCreateCase(true)
                  }
                  className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                >
                  <Plus className="h-4 w-4" />
                  New Case
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <DashboardCard
                  icon={ClipboardList}
                  title="Active Cases"
                  value={String(
                    cases.length
                  ).padStart(2, "0")}
                  description="Current investigations"
                  accent="cyan"
                />

                <DashboardCard
                  icon={Video}
                  title="CCTV Evidence"
                  value={String(
                    evidence.length
                  ).padStart(2, "0")}
                  description="Registered evidence"
                  accent="blue"
                />

                <DashboardCard
                  icon={HardDrive}
                  title="Evidence Device"
                  value={
                    deviceForm.vendor
                      ? "01"
                      : "00"
                  }
                  description="Device profile"
                  accent="violet"
                />

                <DashboardCard
                  icon={ShieldCheck}
                  title="Integrity"
                  value={
                    evidence.length
                      ? "READY"
                      : "WAIT"
                  }
                  description="Local registry"
                  accent="green"
                />
              </div>

              {!selectedCase ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No Active Investigation"
                  description="Create a case to begin the forensic workflow."
                  action="CREATE NEW CASE"
                  onClick={() =>
                    setShowCreateCase(true)
                  }
                />
              ) : (
                <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                  <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/50">
                          Active Investigation
                        </div>

                        <h2 className="mt-2 text-xl font-semibold">
                          {selectedCase.incident}
                        </h2>
                      </div>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        {selectedCase.status}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      <InfoBox
                        icon={ClipboardList}
                        label="Case ID"
                        value={
                          selectedCase.id
                        }
                      />

                      <InfoBox
                        icon={Search}
                        label="Location"
                        value={
                          selectedCase.location
                        }
                      />

                      <InfoBox
                        icon={Clock3}
                        label="Created"
                        value={
                          selectedCase.createdAt
                        }
                      />

                      <InfoBox
                        icon={FileText}
                        label="Evidence"
                        value={`${selectedCaseEvidence.length} registered record(s)`}
                      />
                    </div>

                    <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-4">
                      <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                        Description
                      </div>

                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {selectedCase.description ||
                          "No description supplied."}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          setActiveView(
                            "evidence"
                          )
                        }
                        className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                      >
                        OPEN EVIDENCE
                      </button>

                      <button
                        onClick={() =>
                          setActiveView(
                            "device"
                          )
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white"
                      >
                        DEVICE PROFILE
                      </button>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                    <SectionHeader
                      icon={Activity}
                      title="Investigation Activity"
                      subtitle="Current workspace records"
                    />

                    <div className="mt-5 space-y-3">
                      <ActivityRow
                        icon={ClipboardList}
                        title="Case created"
                        meta={selectedCase.createdAt}
                        status="ACTIVE"
                      />

                      <ActivityRow
                        icon={Video}
                        title={`${selectedCaseEvidence.length} evidence records`}
                        meta="Evidence registry"
                        status={
                          selectedCaseEvidence.length
                            ? "READY"
                            : "WAIT"
                        }
                      />

                      <ActivityRow
                        icon={HardDrive}
                        title="Device identification"
                        meta={
                          deviceForm.vendor
                            ? `${deviceForm.vendor} ${deviceForm.model}`
                            : "No device entered"
                        }
                        status={
                          deviceForm.vendor
                            ? "READY"
                            : "WAIT"
                        }
                      />

                      <ActivityRow
                        icon={Database}
                        title="Filesystem parser"
                        meta={
                          parserFile
                            ? parserFile.name
                            : "No parser input"
                        }
                        status={
                          parserFile
                            ? "READY"
                            : "WAIT"
                        }
                      />
                    </div>
                  </section>
                </div>
              )}
            </section>
          )}

          {/* EVIDENCE */}

          {activeView === "evidence" && (
            <section className="space-y-5">
              <Panel
                icon={FolderOpen}
                title="Evidence Intake"
                description="Register CCTV video, images and forensic evidence against the active case."
              />

              {!selectedCase ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No Case Selected"
                  description="Create or select a case before registering evidence."
                  action="CREATE CASE"
                  onClick={() =>
                    setShowCreateCase(true)
                  }
                />
              ) : (
                <>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
                    <input
                      ref={evidenceInputRef}
                      type="file"
                      accept="video/*,image/*,.raw,.bin,.img,.dd,.e01"
                      className="hidden"
                      onChange={(event) =>
                        chooseEvidence(
                          event.target.files?.[0] ??
                            null
                        )
                      }
                    />

                    <div
                      onClick={() =>
                        evidenceInputRef.current?.click()
                      }
                      className="cursor-pointer rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.025] p-10 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05]">
                        <Upload className="h-7 w-7 text-cyan-300" />
                      </div>

                      <h3 className="mt-5 text-lg font-semibold">
                        Select Evidence
                      </h3>

                      <p className="mt-2 text-xs text-white/30">
                        CCTV video, images or forensic storage files
                      </p>

                      <button className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black">
                        CHOOSE FILE
                      </button>
                    </div>

                    {selectedEvidence && (
                      <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-cyan-300" />

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {selectedEvidence.name}
                            </div>

                            <div className="mt-1 text-[9px] text-white/30">
                              {formatBytes(
                                selectedEvidence.size
                              )}{" "}
                              ·{" "}
                              {selectedEvidence.type ||
                                "unknown type"}
                            </div>
                          </div>

                          <button
                            onClick={
                              registerEvidence
                            }
                            className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black"
                          >
                            REGISTER
                          </button>
                        </div>
                      </div>
                    )}

                    {evidenceMessage && (
                      <div className="mt-4 font-mono text-[9px] uppercase tracking-wider text-cyan-300">
                        {evidenceMessage}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                    <SectionHeader
                      icon={Database}
                      title="Registered Evidence"
                      subtitle={`${selectedCaseEvidence.length} record(s) attached to ${selectedCase.id}`}
                    />

                    <div className="mt-5 space-y-3">
                      {!selectedCaseEvidence.length ? (
                        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-white/25">
                          NO EVIDENCE REGISTERED
                        </div>
                      ) : (
                        selectedCaseEvidence.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-black/20 p-4"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.06]">
                                {isVideoFile(
                                  item.file
                                ) ? (
                                  <Video className="h-4 w-4 text-cyan-300" />
                                ) : (
                                  <FileText className="h-4 w-4 text-cyan-300" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-white/80">
                                  {item.name}
                                </div>

                                <div className="mt-1 text-[9px] text-white/25">
                                  {item.type ||
                                    "unknown"}{" "}
                                  ·{" "}
                                  {formatBytes(
                                    item.size
                                  )}{" "}
                                  ·{" "}
                                  {item.addedAt}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  removeEvidence(
                                    item.id
                                  )
                                }
                                className="rounded-lg border border-red-400/10 bg-red-400/[0.04] p-2 text-red-300/60 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* DEVICE */}

          {activeView === "device" && (
            <section className="space-y-5">
              <Panel
                icon={HardDrive}
                title="Device Identification"
                description="Enter the actual DVR, NVR or camera information supplied by the investigator."
              />

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    [
                      "vendor",
                      "Vendor",
                      "e.g. Hikvision",
                    ],
                    [
                      "model",
                      "Model",
                      "e.g. DS-7608NI",
                    ],
                    [
                      "serial",
                      "Serial Number",
                      "Enter serial number",
                    ],
                    [
                      "firmware",
                      "Firmware",
                      "Enter firmware version",
                    ],
                    [
                      "sourceType",
                      "Source Type",
                      "DVR / NVR / Camera",
                    ],
                    [
                      "acquisitionMethod",
                      "Acquisition Method",
                      "Logical Export",
                    ],
                  ].map(
                    ([
                      key,
                      label,
                      placeholder,
                    ]) => (
                      <label
                        key={key}
                        className="block"
                      >
                        <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                          {label}
                        </span>

                        <input
                          value={
                            deviceForm[
                              key as keyof typeof deviceForm
                            ]
                          }
                          onChange={(event) => {
                            setDeviceForm(
                              (previous) => ({
                                ...previous,
                                [key]:
                                  event.target.value,
                              })
                            );

                            setDeviceResult(
                              null
                            );
                          }}
                          placeholder={
                            placeholder
                          }
                          className="w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3 text-xs text-white outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                        />
                      </label>
                    )
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={
                      analyzeDevice
                    }
                    className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                  >
                    <ScanSearch className="h-4 w-4" />
                    ANALYZE INPUT
                  </button>

                  <button
                    onClick={() => {
                      setDeviceForm(
                        emptyDevice
                      );
                      setDeviceResult(
                        null
                      );
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
                  >
                    RESET
                  </button>
                </div>

                {deviceResult && (
                  <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-300/60">
                      Analysis Result
                    </div>

                    <div className="mt-2 text-sm font-semibold text-cyan-200">
                      {deviceResult}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* PARSER */}

          {activeView === "parser" && (
            <section className="space-y-5">
              <Panel
                icon={Database}
                title="Filesystem Parser"
                description="Select an actual evidence image or storage file before analysis."
              />

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-10 text-center">
                <input
                  ref={parserInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) =>
                    chooseParserFile(
                      event.target.files?.[0] ??
                        null
                    )
                  }
                />

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05]">
                  <Database className="h-7 w-7 text-cyan-300" />
                </div>

                <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/50">
                  Parser Console
                </div>

                <h3 className="mt-2 text-xl font-semibold">
                  Filesystem Analysis
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/35">
                  Select an evidence image or storage source. This workspace
                  records the selected input and metadata.
                </p>

                <button
                  onClick={() =>
                    parserInputRef.current?.click()
                  }
                  className="mt-6 flex mx-auto items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
                >
                  <Search className="h-4 w-4" />
                  SELECT EVIDENCE FILE
                </button>

                {parserFile && (
                  <div className="mx-auto mt-5 max-w-lg rounded-xl border border-white/[0.08] bg-black/20 px-5 py-4 text-left">
                    <div className="text-xs font-semibold">
                      {parserFile.name}
                    </div>

                    <div className="mt-1 text-[9px] text-white/30">
                      {formatBytes(
                        parserFile.size
                      )}{" "}
                      ·{" "}
                      {parserFile.type ||
                        "unknown type"}
                    </div>
                  </div>
                )}

                <button
                  onClick={
                    analyzeParserFile
                  }
                  className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400"
                >
                  ANALYZE SELECTED INPUT
                </button>

                {parserResult && (
                  <div className="mt-3 font-mono text-[9px] text-cyan-300">
                    {parserResult}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* PDF REPORT */}

          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-300" />

                  <h2 className="text-sm font-semibold">
                    Forensic Report Generation
                  </h2>
                </div>

                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/25">
                  Complete investigation summary
                </p>
              </div>

              <span className="hidden font-mono text-[9px] text-white/20 sm:block">
                PDF REPORT ENGINE
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <ReportBadge
                      label={
                        selectedCase
                          ? selectedCase.id
                          : "NO CASE"
                      }
                    />

                    <ReportBadge
                      label={`${selectedCaseEvidence.length} EVIDENCE`}
                    />

                    <ReportBadge
                      label={
                        deviceForm.vendor
                          ? "DEVICE READY"
                          : "DEVICE EMPTY"
                      }
                    />

                    <ReportBadge
                      label={
                        parserFile
                          ? "PARSER READY"
                          : "PARSER EMPTY"
                      }
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    Generate NEXORA Forensic Report
                  </h3>

                  <p className="mt-2 max-w-2xl text-xs leading-6 text-white/35">
                    Creates an A4 forensic investigation PDF containing
                    case information, evidence records, evidence previews,
                    device details, filesystem input, investigation workflow,
                    integrity notes and report scope.
                  </p>

                  {reportMessage && (
                    <div className="mt-4 font-mono text-[9px] uppercase tracking-wider text-cyan-300">
                      {reportMessage}
                    </div>
                  )}
                </div>

                <button
                  onClick={
                    generateForensicReport
                  }
                  disabled={!selectedCase}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-4 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Download className="h-4 w-4" />
                  GENERATE FORENSIC REPORT
                </button>
              </div>
            </div>
          </section>

          {/* TOOLS */}

          <section className="mt-10">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-300" />

                <h2 className="text-sm font-semibold">
                  Forensic Investigation Tools
                </h2>
              </div>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/25">
                Specialized analysis modules
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
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

          <footer className="mt-10 border-t border-white/[0.07] pt-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-wider text-white/20">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                NEXORA System Online
              </span>

              <span>
                Local forensic workflow
              </span>

              <span>
                User-driven evidence intake
              </span>

              <span>
                No unsupported evidence claims
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* CREATE CASE MODAL */}

      {showCreateCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-400/15 bg-[#080d14] p-6 shadow-[0_0_60px_rgba(34,211,238,.08)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/60">
                  NEXORA CASE CREATION
                </div>

                <h2 className="mt-2 text-xl font-semibold">
                  Create Investigation
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Enter your actual investigation details.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateCase(false)
                }
                className="text-white/30 hover:text-white"
              >
                <X />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-wider text-white/30">
                  Incident / Case Name *
                </span>

                <input
                  autoFocus
                  value={caseForm.incident}
                  onChange={(event) =>
                    setCaseForm(
                      (previous) => ({
                        ...previous,
                        incident:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Enter incident name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-wider text-white/30">
                  Location *
                </span>

                <input
                  value={caseForm.location}
                  onChange={(event) =>
                    setCaseForm(
                      (previous) => ({
                        ...previous,
                        location:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Enter incident location"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-wider text-white/30">
                  Description
                </span>

                <textarea
                  rows={4}
                  value={
                    caseForm.description
                  }
                  onChange={(event) =>
                    setCaseForm(
                      (previous) => ({
                        ...previous,
                        description:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Optional investigation notes"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/15 focus:border-cyan-400/40"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowCreateCase(false)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
              >
                CANCEL
              </button>

              <button
                onClick={createCase}
                disabled={
                  !caseForm.incident.trim() ||
                  !caseForm.location.trim()
                }
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

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatusIndicator({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.03] px-3 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>

      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
        {label}
      </span>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  value,
  description,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  accent:
    | "cyan"
    | "blue"
    | "violet"
    | "green";
}) {
  const accentClasses = {
    cyan:
      "text-cyan-300 bg-cyan-300/[0.07] border-cyan-300/10",
    blue:
      "text-blue-300 bg-blue-300/[0.07] border-blue-300/10",
    violet:
      "text-violet-300 bg-violet-300/[0.07] border-violet-300/10",
    green:
      "text-emerald-300 bg-emerald-300/[0.07] border-emerald-300/10",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accentClasses[accent]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="mt-5">
        <div className="font-mono text-2xl font-bold">
          {value}
        </div>

        <div className="mt-1 text-xs font-semibold text-white/80">
          {title}
        </div>

        <p className="mt-1 text-[10px] text-white/30">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
          {label}
        </p>

        <Icon className="h-3.5 w-3.5 text-white/20" />
      </div>

      <p className="mt-3 text-sm font-semibold leading-5 text-white/85">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]">
        <Icon className="h-4 w-4 text-cyan-300/80" />
      </div>

      <div>
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-0.5 text-[10px] text-white/25">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ActivityRow({
  icon: Icon,
  title,
  meta,
  status,
}: {
  icon: React.ElementType;
  title: string;
  meta: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon className="h-3.5 w-3.5 text-cyan-300/70" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-white/75">
          {title}
        </div>

        <div className="mt-0.5 truncate text-[9px] text-white/25">
          {meta}
        </div>
      </div>

      <span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-400">
        {status}
      </span>
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
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-xs text-white/30">
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
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-cyan-400/[0.025]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04]">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>

        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-cyan-300" />
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/30">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-white/25 group-hover:text-cyan-300/70">
        Open module
        <ChevronRight className="h-3 w-3" />
      </div>
    </a>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-cyan-400/15 bg-cyan-400/[0.02] p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04]">
        <Icon className="h-6 w-6 text-cyan-300" />
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-xs text-white/30">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-200"
      >
        {action}
      </button>
    </section>
  );
}

function ReportBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/40">
      {label}
    </span>
  );
}