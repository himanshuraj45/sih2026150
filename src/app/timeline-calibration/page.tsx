"use client";

import {
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";

type EvidenceEvent = {
  id: number;
  camera: string;
  description: string;
  dvrTime: string;
};

const TIMELINE_START = 12 * 60 * 60; // 12:00:00
const TIMELINE_END = 18 * 60 * 60; // 18:00:00

const INITIAL_EVENTS: EvidenceEvent[] = [
  {
    id: 1,
    camera: "CAM-01",
    description: "Person detected",
    dvrTime: "14:30:20",
  },
  {
    id: 2,
    camera: "CAM-02",
    description: "Vehicle entered",
    dvrTime: "14:31:45",
  },
  {
    id: 3,
    camera: "CAM-03",
    description: "Gate movement",
    dvrTime: "14:32:10",
  },
  {
    id: 4,
    camera: "CAM-01",
    description: "Person detected",
    dvrTime: "14:33:25",
  },
  {
    id: 5,
    camera: "CAM-04",
    description: "Vehicle stopped",
    dvrTime: "14:34:50",
  },
];

function timeToSeconds(time: string) {
  const parts = time.split(":").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return 0;
  }

  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function secondsToTime(totalSeconds: number) {
  const normalized =
    ((Math.round(totalSeconds) % 86400) + 86400) % 86400;

  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const seconds = normalized % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatOffset(totalSeconds: number) {
  const rounded = Math.round(totalSeconds);
  const sign = rounded >= 0 ? "+" : "-";
  const absolute = Math.abs(rounded);

  const hours = Math.floor(absolute / 3600);
  const minutes = Math.floor((absolute % 3600) / 60);
  const seconds = absolute % 60;

  return `${sign}${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTimelinePosition(seconds: number) {
  const percentage =
    ((seconds - TIMELINE_START) /
      (TIMELINE_END - TIMELINE_START)) *
    100;

  return clamp(percentage, 0, 100);
}

export default function TimelineCalibrationPage() {
  /*
   * ---------------------------------------------------------
   * BASIC STATE
   * ---------------------------------------------------------
   */

  const [referenceTime, setReferenceTime] =
    useState("14:35:42");

  const [dvrTime, setDvrTime] =
    useState("14:32:10");

  /*
   * This is the position of the DRAGGABLE DVR marker.
   *
   * The real-world/reference time NEVER changes when
   * the marker is dragged.
   */
  const [dvrMarkerSeconds, setDvrMarkerSeconds] =
    useState(timeToSeconds("14:32:10"));

  const [isCalibrated, setIsCalibrated] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * EVENTS
   * ---------------------------------------------------------
   */

  const [events, setEvents] =
    useState<EvidenceEvent[]>(INITIAL_EVENTS);

  const [showAddEvent, setShowAddEvent] =
    useState(false);

  const [newCamera, setNewCamera] =
    useState("CAM-06");

  const [newDescription, setNewDescription] =
    useState("");

  const [newDvrTime, setNewDvrTime] =
    useState("14:35:00");

  /*
   * ---------------------------------------------------------
   * DRAGGING
   * ---------------------------------------------------------
   */

  const timelineRef =
    useRef<HTMLDivElement | null>(null);

  const isDragging =
    useRef(false);

  /*
   * ---------------------------------------------------------
   * CALCULATIONS
   * ---------------------------------------------------------
   */

  const referenceSeconds =
    timeToSeconds(referenceTime);

  /*
   * IMPORTANT:
   *
   * Real-world time is FIXED.
   *
   * DVR marker moves.
   *
   * Offset = Real-world time - DVR marker time
   */

  const offset = useMemo(() => {
    return referenceSeconds - dvrMarkerSeconds;
  }, [referenceSeconds, dvrMarkerSeconds]);

  /*
   * The corrected time of the selected DVR marker.
   *
   * This should always equal the reference time when aligned.
   */

  const correctedMarkerTime =
    dvrMarkerSeconds + offset;

  /*
   * ---------------------------------------------------------
   * DRAG CALCULATION
   * ---------------------------------------------------------
   */

  function updateMarkerFromPointer(
    clientX: number
  ) {
    const timeline = timelineRef.current;

    if (!timeline) return;

    const rect =
      timeline.getBoundingClientRect();

    const relativeX =
      clientX - rect.left;

    let percentage =
      relativeX / rect.width;

    percentage = clamp(
      percentage,
      0,
      1
    );

    const newSeconds =
      TIMELINE_START +
      percentage *
        (TIMELINE_END - TIMELINE_START);

    setDvrMarkerSeconds(
      Math.round(newSeconds)
    );

    setIsCalibrated(false);
  }

  function handleTimelinePointerDown(
    event: PointerEvent<HTMLDivElement>
  ) {
    isDragging.current = true;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    updateMarkerFromPointer(
      event.clientX
    );
  }

  function handleTimelinePointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (!isDragging.current) return;

    updateMarkerFromPointer(
      event.clientX
    );
  }

  function handleTimelinePointerUp(
    event: PointerEvent<HTMLDivElement>
  ) {
    isDragging.current = false;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * INPUT HANDLERS
   * ---------------------------------------------------------
   */

  function handleReferenceChange(
    value: string
  ) {
    setReferenceTime(value);
    setIsCalibrated(false);
  }

  function handleDvrChange(
    value: string
  ) {
    setDvrTime(value);

    const seconds =
      timeToSeconds(value);

    setDvrMarkerSeconds(seconds);
    setIsCalibrated(false);
  }

  /*
   * ---------------------------------------------------------
   * CALIBRATION
   * ---------------------------------------------------------
   */

  function applyCalibration() {
    setIsCalibrated(true);
  }

  function resetCalibration() {
    setDvrMarkerSeconds(
      timeToSeconds(dvrTime)
    );

    setIsCalibrated(false);
  }

  /*
   * ---------------------------------------------------------
   * EVENTS
   * ---------------------------------------------------------
   */

  function deleteEvent(id: number) {
    setEvents((current) =>
      current.filter(
        (event) => event.id !== id
      )
    );
  }

  function addEvent() {
    if (!newDescription.trim()) {
      alert("Enter an event description.");
      return;
    }

    const nextId =
      events.length > 0
        ? Math.max(
            ...events.map(
              (event) => event.id
            )
          ) + 1
        : 1;

    const newEvent: EvidenceEvent = {
      id: nextId,
      camera:
        newCamera.trim() || `CAM-${nextId}`,
      description:
        newDescription.trim(),
      dvrTime: newDvrTime,
    };

    setEvents((current) => [
      ...current,
      newEvent,
    ]);

    setNewDescription("");
    setNewDvrTime("14:35:00");
    setShowAddEvent(false);
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8">

          <div className="text-xs font-bold tracking-[0.35em] text-cyan-400">
            NEXORA / FORENSIC OPERATIONS
          </div>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <h1 className="text-3xl font-bold">
                Timeline Calibration
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                Synchronize the DVR internal clock with
                a verified real-world reference event.
              </p>
            </div>

            <div
              className={`rounded-xl border px-5 py-3 ${
                isCalibrated
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-yellow-500/30 bg-yellow-500/10"
              }`}
            >
              <div className="text-[10px] tracking-[0.2em] text-gray-500">
                CALIBRATION STATUS
              </div>

              <div
                className={`mt-1 text-sm font-bold ${
                  isCalibrated
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {isCalibrated
                  ? "APPLIED"
                  : "NOT APPLIED"}
              </div>
            </div>

          </div>
        </header>

        {/* =================================================
            TIME INPUTS
        ================================================= */}

        <section className="grid gap-5 md:grid-cols-2">

          {/* REAL WORLD */}

          <div className="rounded-2xl border border-cyan-500/20 bg-[#0a0f17] p-6">

            <div className="text-xs font-bold tracking-[0.2em] text-cyan-400">
              REFERENCE EVENT
            </div>

            <h2 className="mt-2 text-lg font-semibold">
              Real-World Time
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Trusted timestamp from a seizure photograph
              or verified event.
            </p>

            <input
              type="time"
              step="1"
              value={referenceTime}
              onChange={(event) =>
                handleReferenceChange(
                  event.target.value
                )
              }
              className="mt-5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-4 font-mono text-lg outline-none focus:border-cyan-400"
            />

            <div className="mt-3 text-xs text-gray-500">
              FIXED REFERENCE:
              <span className="ml-2 font-mono text-cyan-300">
                {referenceTime}
              </span>
            </div>

          </div>

          {/* DVR */}

          <div className="rounded-2xl border border-purple-500/20 bg-[#0a0f17] p-6">

            <div className="text-xs font-bold tracking-[0.2em] text-purple-400">
              DVR INTERNAL CLOCK
            </div>

            <h2 className="mt-2 text-lg font-semibold">
              Original DVR Time
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Timestamp shown by the DVR or recorded video.
            </p>

            <input
              type="time"
              step="1"
              value={dvrTime}
              onChange={(event) =>
                handleDvrChange(
                  event.target.value
                )
              }
              className="mt-5 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-4 font-mono text-lg outline-none focus:border-purple-400"
            />

            <div className="mt-3 text-xs text-gray-500">
              ORIGINAL DVR:
              <span className="ml-2 font-mono text-purple-300">
                {dvrTime}
              </span>
            </div>

          </div>

        </section>

        {/* =================================================
            MAIN CALIBRATION
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#080c13] p-6">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

            <div>

              <div className="text-xs font-bold tracking-[0.2em] text-gray-500">
                INTERACTIVE CALIBRATION
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Align the DVR Event
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                The cyan marker is the fixed real-world
                reference. Drag the purple DVR marker
                to align the events.
              </p>

            </div>

            {/* OFFSET */}

            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-6 py-4">

              <div className="text-[10px] tracking-[0.2em] text-gray-500">
                TEMPORAL OFFSET
              </div>

              <div className="mt-1 font-mono text-2xl font-bold text-cyan-300">
                {formatOffset(offset)}
              </div>

            </div>

          </div>

          {/* =================================================
              TIMELINE
          ================================================= */}

          <div className="mt-12">

            {/* REAL WORLD LABEL */}

            <div className="mb-3 flex items-center justify-between">

              <span className="text-xs font-bold tracking-wider text-cyan-300">
                🔵 FIXED REAL-WORLD EVENT
              </span>

              <span className="rounded-lg bg-cyan-500/10 px-3 py-2 font-mono text-cyan-300">
                {referenceTime}
              </span>

            </div>

            {/* TIMELINE */}

            <div
              ref={timelineRef}
              onPointerDown={
                handleTimelinePointerDown
              }
              onPointerMove={
                handleTimelinePointerMove
              }
              onPointerUp={
                handleTimelinePointerUp
              }
              onPointerCancel={
                handleTimelinePointerUp
              }
              className="relative h-24 w-full cursor-crosshair touch-none select-none"
            >

              {/* TRACK */}

              <div className="absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-gray-800">

                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-purple-400/30 to-purple-500/20" />

              </div>

              {/* REAL-WORLD FIXED MARKER */}

              <div
                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${getTimelinePosition(
                    referenceSeconds
                  )}%`,
                }}
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-cyan-200 bg-cyan-500 shadow-xl shadow-cyan-500/50">

                  <div className="h-2.5 w-2.5 rounded-full bg-white" />

                </div>

                <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-300">
                  REAL: {referenceTime}
                </div>

              </div>

              {/* DVR DRAGGABLE MARKER */}

              <div
                className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${getTimelinePosition(
                    dvrMarkerSeconds
                  )}%`,
                }}
              >

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-purple-200 bg-purple-500 shadow-2xl shadow-purple-500/60 transition-transform ${
                    isDragging.current
                      ? "scale-125 cursor-grabbing"
                      : "cursor-grab hover:scale-110"
                  }`}
                >

                  <div className="h-4 w-4 rounded-full bg-white" />

                </div>

                <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 font-mono text-xs text-purple-300">
                  DVR: {secondsToTime(
                    dvrMarkerSeconds
                  )}
                </div>

              </div>

            </div>

            {/* TIME SCALE */}

            <div className="mt-6 flex justify-between font-mono text-xs text-gray-500">

              <span>12:00:00</span>
              <span>13:00:00</span>
              <span>14:00:00</span>
              <span>15:00:00</span>
              <span>16:00:00</span>
              <span>17:00:00</span>
              <span>18:00:00</span>

            </div>

            {/* DRAG INSTRUCTION */}

            <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 text-center">

              <div className="text-xs font-bold tracking-[0.2em] text-purple-300">
                🟣 DRAG THE PURPLE MARKER
              </div>

              <div className="mt-2 font-mono text-3xl font-bold text-purple-300">
                {secondsToTime(
                  dvrMarkerSeconds
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Move the DVR event until it aligns
                with the cyan reference event.
              </div>

            </div>

          </div>

          {/* =================================================
              CALCULATION CARDS
          ================================================= */}

          <div className="mt-8 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

              <div className="text-xs text-gray-500">
                DVR EVENT
              </div>

              <div className="mt-2 font-mono text-xl text-purple-300">
                {secondsToTime(
                  dvrMarkerSeconds
                )}
              </div>

            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">

              <div className="text-xs text-gray-500">
                CLOCK DRIFT
              </div>

              <div className="mt-2 font-mono text-xl text-cyan-300">
                {formatOffset(offset)}
              </div>

            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">

              <div className="text-xs text-gray-500">
                CORRECTED EVENT
              </div>

              <div className="mt-2 font-mono text-xl text-green-300">
                {secondsToTime(
                  correctedMarkerTime
                )}
              </div>

            </div>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              onClick={applyCalibration}
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/20"
            >
              ✓ Apply Calibration
            </button>

            <button
              onClick={resetCalibration}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
            >
              ↺ Reset
            </button>

          </div>

        </section>

        {/* =================================================
            CALCULATION DETAILS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#080c13] p-6">

          <div className="text-xs font-bold tracking-[0.2em] text-cyan-400">
            FORENSIC CALCULATION
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Clock Drift Analysis
          </h2>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-sm">

            <div className="text-gray-500">
              Reference Time
            </div>

            <div className="mt-1 text-cyan-300">
              {referenceTime}
            </div>

            <div className="my-4 border-t border-white/10" />

            <div className="text-gray-500">
              DVR Event Time
            </div>

            <div className="mt-1 text-purple-300">
              {secondsToTime(
                dvrMarkerSeconds
              )}
            </div>

            <div className="my-4 border-t border-white/10" />

            <div className="text-gray-500">
              Temporal Offset
            </div>

            <div className="mt-1 text-green-300">
              {formatOffset(offset)}
            </div>

            <div className="my-4 border-t border-white/10" />

            <div className="text-gray-500">
              Formula
            </div>

            <div className="mt-1 text-white">
              Corrected Time = DVR Time + Offset
            </div>

          </div>

        </section>

        {/* =================================================
            EVENTS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#080c13] p-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <div className="text-xs font-bold tracking-[0.2em] text-gray-500">
                VIDEO EVENT TIMELINE
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Evidence Events
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage DVR events and their recalibrated timestamps.
              </p>

            </div>

            <button
              onClick={() =>
                setShowAddEvent(
                  (current) => !current
                )
              }
              className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 text-sm font-bold text-purple-300 transition hover:bg-purple-400/20"
            >
              {showAddEvent
                ? "✕ Close"
                : "+ Add Event"}
            </button>

          </div>

          {/* ADD EVENT FORM */}

          {showAddEvent && (
            <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

              <div className="text-xs font-bold tracking-[0.2em] text-purple-300">
                ADD FORENSIC EVENT
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                {/* CAMERA */}

                <div>

                  <label className="text-xs text-gray-500">
                    Camera
                  </label>

                  <input
                    value={newCamera}
                    onChange={(event) =>
                      setNewCamera(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-3 font-mono outline-none focus:border-purple-400"
                    placeholder="CAM-06"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="text-xs text-gray-500">
                    Event Description
                  </label>

                  <input
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-3 outline-none focus:border-purple-400"
                    placeholder="Person detected"
                  />

                </div>

                {/* TIME */}

                <div>

                  <label className="text-xs text-gray-500">
                    DVR Time
                  </label>

                  <input
                    type="time"
                    step="1"
                    value={newDvrTime}
                    onChange={(event) =>
                      setNewDvrTime(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-3 font-mono outline-none focus:border-purple-400"
                  />

                </div>

              </div>

              <button
                onClick={addEvent}
                className="mt-5 rounded-lg border border-green-400/30 bg-green-400/10 px-5 py-3 text-sm font-bold text-green-300 transition hover:bg-green-400/20"
              >
                + Save Event
              </button>

            </div>
          )}

          {/* EVENT TABLE */}

          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">

            <div className="min-w-[800px]">

              <div className="grid grid-cols-5 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-bold tracking-wider text-gray-500">

                <span>CAMERA</span>
                <span>EVENT</span>
                <span>DVR TIME</span>
                <span>CORRECTED TIME</span>
                <span>ACTION</span>

              </div>

              {events.length === 0 ? (

                <div className="p-10 text-center text-sm text-gray-500">
                  No evidence events.
                  Click <b>+ Add Event</b> to create one.
                </div>

              ) : (

                events.map((item) => {

                  const originalSeconds =
                    timeToSeconds(
                      item.dvrTime
                    );

                  const correctedSeconds =
                    originalSeconds + offset;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-5 items-center border-b border-white/5 px-4 py-4 text-sm last:border-b-0"
                    >

                      <span className="font-mono text-cyan-300">
                        {item.camera}
                      </span>

                      <span className="text-gray-300">
                        {item.description}
                      </span>

                      <span className="font-mono text-purple-300">
                        {item.dvrTime}
                      </span>

                      <span
                        className={`font-mono ${
                          isCalibrated
                            ? "text-green-300"
                            : "text-gray-600"
                        }`}
                      >
                        {isCalibrated
                          ? secondsToTime(
                              correctedSeconds
                            )
                          : "—"}
                      </span>

                      <button
                        onClick={() =>
                          deleteEvent(item.id)
                        }
                        className="w-fit rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/15"
                      >
                        🗑 Delete
                      </button>

                    </div>
                  );
                })

              )}

            </div>

          </div>

        </section>

        {/* =================================================
            FINAL STATUS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-6">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <div className="text-xs font-bold tracking-[0.2em] text-green-400">
                FORENSIC STATUS
              </div>

              <h2 className="mt-2 text-lg font-semibold">
                {isCalibrated
                  ? "Timeline synchronized"
                  : "Calibration pending"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Original DVR timestamps are preserved.
                Corrected timestamps are calculated separately.
              </p>

            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-6 py-4 text-center">

              <div className="text-[10px] tracking-wider text-gray-500">
                FINAL OFFSET
              </div>

              <div className="mt-1 font-mono text-xl text-cyan-300">
                {formatOffset(offset)}
              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}