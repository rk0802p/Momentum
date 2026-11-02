import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  timeToAngle,
  polarToCartesian,
  pointerToMinutes,
  describeArc,
  formatMinutes,
  minutesToTime,
  splitAcrossDays,
  detectOverlaps
} from '@momentum/temporal-engine';
import type { CalendarEvent, NormalizedEvent } from '@momentum/shared-types';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';

interface RadialCalendarProps {
  size?: number;
}

export const RadialCalendar: React.FC<RadialCalendarProps> = ({ size = 720 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const {
    activeDate,
    selectedEventId,
    setSelectedEventId,
    snapMinutes,
    timezone,
    openEditor
  } = useNavigationStore();

  const {
    events,
    categories,
    rescheduleEvent,
    getNormalizedEvents,
    getOverlaps
  } = useEventStore();

  const cx = size / 2;
  const cy = size / 2;
  const outerRingRadius = size * 0.44;
  const arcOuterRadius = outerRingRadius - 12;
  const arcInnerRadius = arcOuterRadius - 38;
  const innerRingRadius = arcInnerRadius - 16;

  // Real-time Beacon state
  const [currentInstant, setCurrentInstant] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentInstant(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live beacon angle
  const liveAngle = useMemo(() => {
    const h = currentInstant.getHours();
    const m = currentInstant.getMinutes();
    const s = currentInstant.getSeconds();
    return timeToAngle(h, m, s);
  }, [currentInstant]);

  // Hover state
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    event: CalendarEvent;
    startStr: string;
    endStr: string;
    duration: number;
  } | null>(null);

  // Dragging & Resizing state machine
  type DragMode = 'move' | 'resize-start' | 'resize-end' | null;
  const [dragState, setDragState] = useState<{
    mode: DragMode;
    eventId: string;
    origStartMinutes: number;
    origEndMinutes: number;
    durationMinutes: number;
    curStartMinutes: number;
    curEndMinutes: number;
    pointerAngleOffset: number; // For smooth relative rotation
  } | null>(null);

  // Filter and normalize events for the active date
  const dayEvents = useMemo(() => {
    return events.filter(e => {
      if (e.deletedAt) return false;
      // Filter events that touch activeDate
      const startDay = e.startAt.substring(0, 10);
      const endDay = e.endAt.substring(0, 10);
      return startDay === activeDate || endDay === activeDate;
    });
  }, [events, activeDate]);

  const activeNormalized = useMemo(() => {
    return getNormalizedEvents();
  }, [events, getNormalizedEvents]);

  const overlaps = useMemo(() => {
    return detectOverlaps(activeNormalized);
  }, [activeNormalized]);

  const overlappingEventIds = useMemo(() => {
    const ids = new Set<string>();
    for (const o of overlaps) {
      ids.add(o.eventAId);
      ids.add(o.eventBId);
    }
    return ids;
  }, [overlaps]);

  // Helper to extract minutes of day from ISO string in activeDate context
  const getMinutesOfDay = (isoString: string): number => {
    const d = new Date(isoString);
    return d.getHours() * 60 + d.getMinutes();
  };

  // Convert minutes of day to ISO string on activeDate
  const minutesToIso = (totalMinutes: number, dateStr = activeDate): string => {
    const normalized = (Math.floor(totalMinutes) % 1440 + 1440) % 1440;
    const h = String(Math.floor(normalized / 60)).padStart(2, '0');
    const m = String(normalized % 60).padStart(2, '0');
    // Using current timezone offset
    return `${dateStr}T${h}:${m}:00+05:30`;
  };

  // Handle pointer interactions on event arcs
  const handleArcPointerDown = (
    e: React.PointerEvent,
    event: CalendarEvent,
    mode: DragMode = 'move'
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setSelectedEventId(event.id);

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const px = e.clientX - svgRect.left;
    const py = e.clientY - svgRect.top;
    const pointerMin = pointerToMinutes(px, py, cx, cy, 1);

    const startMin = getMinutesOfDay(event.startAt);
    let endMin = getMinutesOfDay(event.endAt);
    if (endMin <= startMin) endMin += 1440; // overnight event

    const duration = endMin - startMin;
    const offsetMin = (pointerMin - startMin + 1440) % 1440;

    setDragState({
      mode,
      eventId: event.id,
      origStartMinutes: startMin,
      origEndMinutes: endMin,
      durationMinutes: duration,
      curStartMinutes: startMin,
      curEndMinutes: endMin,
      pointerAngleOffset: offsetMin
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const px = e.clientX - svgRect.left;
    const py = e.clientY - svgRect.top;

    if (!dragState) {
      // Hover tracking for tooltips
      return;
    }

    const currentPointerMin = pointerToMinutes(px, py, cx, cy, snapMinutes);

    if (dragState.mode === 'move') {
      const proposedStart = (currentPointerMin - dragState.pointerAngleOffset + 1440) % 1440;
      const proposedEnd = proposedStart + dragState.durationMinutes;

      setDragState(prev => prev ? {
        ...prev,
        curStartMinutes: proposedStart,
        curEndMinutes: proposedEnd
      } : null);
    } else if (dragState.mode === 'resize-start') {
      // Snapped start time
      let newStart = currentPointerMin;
      let newEnd = dragState.curEndMinutes;
      // Minimum duration 15 minutes
      if (newEnd - newStart < 15) {
        newStart = newEnd - 15;
      }
      setDragState(prev => prev ? {
        ...prev,
        curStartMinutes: newStart
      } : null);
    } else if (dragState.mode === 'resize-end') {
      let newEnd = currentPointerMin;
      let newStart = dragState.curStartMinutes;
      if (newEnd <= newStart) {
        newEnd += 1440;
      }
      if (newEnd - newStart < 15) {
        newEnd = newStart + 15;
      }
      setDragState(prev => prev ? {
        ...prev,
        curEndMinutes: newEnd
      } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    // Commit change
    if (dragState.curStartMinutes !== dragState.origStartMinutes || dragState.curEndMinutes !== dragState.origEndMinutes) {
      const newStartIso = minutesToIso(dragState.curStartMinutes);
      // For cross-midnight end time
      let endDateStr = activeDate;
      if (dragState.curEndMinutes >= 1440) {
        const nextDay = new Date(activeDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateStr = nextDay.toISOString().substring(0, 10);
      }
      const newEndIso = minutesToIso(dragState.curEndMinutes % 1440, endDateStr);

      rescheduleEvent(dragState.eventId, newStartIso, newEndIso);
    }

    setDragState(null);
  };

  // Double click empty space to create event at clicked time
  const handleSvgDoubleClick = (e: React.MouseEvent) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const px = e.clientX - svgRect.left;
    const py = e.clientY - svgRect.top;

    // Check distance from center to ensure inside dial area
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < innerRingRadius - 40 || dist > outerRingRadius + 40) return;

    const clickedMinutes = pointerToMinutes(px, py, cx, cy, snapMinutes);
    const startIso = minutesToIso(clickedMinutes);
    const endIso = minutesToIso((clickedMinutes + 60) % 1440);

    openEditor({
      startAt: startIso,
      endAt: endIso,
      title: 'New Focus Block',
      categoryId: categories[0]?.id || 'cat-work'
    });
  };

  // 24 Hour Markers (Every hour with labels on even hours)
  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let h = 0; h < 24; h++) {
      const angle = timeToAngle(h, 0);
      const isMajor = h % 2 === 0;
      const isQuarter = h % 6 === 0; // 00, 06, 12, 18

      const r1 = outerRingRadius - (isMajor ? 8 : 4);
      const r2 = outerRingRadius;
      const p1 = polarToCartesian(cx, cy, r1, angle);
      const p2 = polarToCartesian(cx, cy, r2, angle);

      const labelRadius = outerRingRadius + 18;
      const labelPos = polarToCartesian(cx, cy, labelRadius, angle);

      markers.push({
        hour: h,
        p1,
        p2,
        labelPos,
        isMajor,
        isQuarter,
        label: `${String(h).padStart(2, '0')}:00`
      });
    }
    return markers;
  }, [cx, cy, outerRingRadius]);

  // Minor ticks for minutes (every 15 min)
  const minuteTicks = useMemo(() => {
    const ticks = [];
    for (let m = 0; m < 1440; m += 15) {
      if (m % 60 === 0) continue; // Skip full hours already handled
      const h = Math.floor(m / 60);
      const min = m % 60;
      const angle = timeToAngle(h, min);
      const isHalf = min === 30;
      const r1 = outerRingRadius - (isHalf ? 5 : 2.5);
      const r2 = outerRingRadius;
      const p1 = polarToCartesian(cx, cy, r1, angle);
      const p2 = polarToCartesian(cx, cy, r2, angle);
      ticks.push({ m, p1, p2, isHalf });
    }
    return ticks;
  }, [cx, cy, outerRingRadius]);

  // Selected event object
  const selectedEvent = events.find(e => e.id === selectedEventId && !e.deletedAt);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden radial-halo">
      {/* SVG Central Stage */}
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleSvgDoubleClick}
        className="cursor-crosshair drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Subtle luminous filter */}
          <filter id="bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="beacon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Guide Circles */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRingRadius}
          fill="none"
          stroke="#292D35"
          strokeWidth="1"
          opacity="0.8"
        />
        <circle
          cx={cx}
          cy={cy}
          r={arcOuterRadius}
          fill="none"
          stroke="#1E222A"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={arcInnerRadius}
          fill="none"
          stroke="#1E222A"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={innerRingRadius}
          fill="#121419"
          fillOpacity="0.85"
          stroke="#292D35"
          strokeWidth="1"
        />

        {/* 15-Minute Minor Ticks */}
        {minuteTicks.map(t => (
          <line
            key={`tick-${t.m}`}
            x1={t.p1.x}
            y1={t.p1.y}
            x2={t.p2.x}
            y2={t.p2.y}
            stroke={t.isHalf ? '#464D5B' : '#2A2E38'}
            strokeWidth={t.isHalf ? 1 : 0.75}
          />
        ))}

        {/* Hour Markers & Monospace Numerals */}
        {hourMarkers.map(m => (
          <g key={`hour-${m.hour}`}>
            <line
              x1={m.p1.x}
              y1={m.p1.y}
              x2={m.p2.x}
              y2={m.p2.y}
              stroke={m.isQuarter ? '#D6A66D' : m.isMajor ? '#92969F' : '#3D4350'}
              strokeWidth={m.isQuarter ? 2 : m.isMajor ? 1.5 : 1}
            />
            {m.isMajor && (
              <text
                x={m.labelPos.x}
                y={m.labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={m.isQuarter ? '#D6A66D' : '#92969F'}
                fontSize={m.isQuarter ? '11' : '10'}
                fontFamily="Geist Mono, JetBrains Mono, monospace"
                className="select-none font-medium"
              >
                {m.hour === 0 ? '00:00' : `${String(m.hour).padStart(2, '0')}`}
              </text>
            )}
          </g>
        ))}

        {/* Unallocated / Free Time subtle background arc indicator */}
        <path
          d={describeArc(cx, cy, arcInnerRadius, arcOuterRadius, 0, Math.PI * 2)}
          fill="#121419"
          fillOpacity="0.4"
          stroke="none"
        />

        {/* Scheduled Event Arcs */}
        {dayEvents.map(ev => {
          const isSelected = selectedEventId === ev.id;
          const isHovered = hoveredEventId === ev.id;
          const isColliding = overlappingEventIds.has(ev.id);
          const category = categories.find(c => c.id === ev.categoryId);
          const baseColor = category?.color || '#829AB9';

          // Check if being actively dragged or resized
          const isDraggingThis = dragState?.eventId === ev.id;
          const startMin = isDraggingThis ? dragState.curStartMinutes : getMinutesOfDay(ev.startAt);
          let endMin = isDraggingThis ? dragState.curEndMinutes : getMinutesOfDay(ev.endAt);
          if (endMin <= startMin) endMin += 1440;

          const startHour = startMin / 60;
          const endHour = endMin / 60;
          const startAngle = timeToAngle(startHour);
          const endAngle = timeToAngle(endHour);

          const arcPath = describeArc(cx, cy, arcInnerRadius + 2, arcOuterRadius - 2, startAngle, endAngle);

          // Center coordinate of arc for title label
          const midAngle = (startAngle + endAngle) / 2;
          const labelDist = (arcInnerRadius + arcOuterRadius) / 2;
          const labelPos = polarToCartesian(cx, cy, labelDist, midAngle);

          // Start & End boundary points for resize handles
          const startPt = polarToCartesian(cx, cy, (arcInnerRadius + arcOuterRadius) / 2, startAngle);
          const endPt = polarToCartesian(cx, cy, (arcInnerRadius + arcOuterRadius) / 2, endAngle);

          return (
            <g
              key={ev.id}
              className="cursor-grab active:cursor-grabbing transition-all duration-150"
              onPointerDown={(e) => handleArcPointerDown(e, ev, 'move')}
              onMouseEnter={(e) => {
                setHoveredEventId(ev.id);
                setTooltipData({
                  x: e.clientX,
                  y: e.clientY,
                  event: ev,
                  startStr: formatMinutes(startMin),
                  endStr: formatMinutes(endMin % 1440),
                  duration: endMin - startMin
                });
              }}
              onMouseLeave={() => {
                setHoveredEventId(null);
                setTooltipData(null);
              }}
            >
              {/* Event Arc Path */}
              <path
                d={arcPath}
                fill={baseColor}
                fillOpacity={isSelected ? 0.75 : isHovered ? 0.6 : 0.4}
                stroke={isColliding ? '#D88B75' : isSelected ? '#F1F0EB' : baseColor}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                strokeDasharray={isColliding ? '4 2' : 'none'}
                filter={isSelected ? 'url(#bloom)' : undefined}
                className="transition-colors duration-150"
              />

              {/* Event Title text inside arc if duration > 30 mins */}
              {endMin - startMin >= 40 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#F1F0EB"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="Inter, sans-serif"
                  className="pointer-events-none select-none drop-shadow"
                >
                  {ev.title.length > 18 ? `${ev.title.substring(0, 16)}…` : ev.title}
                </text>
              )}

              {/* Resize Handles (rendered when selected) */}
              {isSelected && (
                <>
                  {/* Start Edge Handle */}
                  <circle
                    cx={startPt.x}
                    cy={startPt.y}
                    r={5}
                    fill="#F1F0EB"
                    stroke="#0B0C0F"
                    strokeWidth={2}
                    className="cursor-ew-resize hover:scale-125 transition-transform"
                    onPointerDown={(e) => handleArcPointerDown(e, ev, 'resize-start')}
                  />
                  {/* End Edge Handle */}
                  <circle
                    cx={endPt.x}
                    cy={endPt.y}
                    r={5}
                    fill="#F1F0EB"
                    stroke="#0B0C0F"
                    strokeWidth={2}
                    className="cursor-ew-resize hover:scale-125 transition-transform"
                    onPointerDown={(e) => handleArcPointerDown(e, ev, 'resize-end')}
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Live Current-Time Beacon (Pulsing orbital beacon) */}
        {(() => {
          const beaconOuter = polarToCartesian(cx, cy, outerRingRadius, liveAngle);
          const beaconInner = polarToCartesian(cx, cy, innerRingRadius, liveAngle);
          const beaconCenter = polarToCartesian(cx, cy, (arcInnerRadius + arcOuterRadius) / 2, liveAngle);

          return (
            <g className="pointer-events-none">
              {/* Radial hairline beacon ray */}
              <line
                x1={beaconInner.x}
                y1={beaconInner.y}
                x2={beaconOuter.x}
                y2={beaconOuter.y}
                stroke="#D6A66D"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              {/* Luminous beacon core */}
              <circle
                cx={beaconCenter.x}
                cy={beaconCenter.y}
                r="6"
                fill="#D6A66D"
                filter="url(#beacon-glow)"
              />
              <circle
                cx={beaconCenter.x}
                cy={beaconCenter.y}
                r="2"
                fill="#FFFFFF"
              />
            </g>
          );
        })()}

        {/* Center Temporal Hub (Live Clock & Stats) */}
        <g className="pointer-events-none select-none text-center">
          <text
            x={cx}
            y={cy - 28}
            textAnchor="middle"
            fill="#92969F"
            fontSize="11"
            fontFamily="Geist Mono, JetBrains Mono, monospace"
            letterSpacing="0.1em"
          >
            LOCAL TIME · {timezone}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="#F1F0EB"
            fontSize="34"
            fontWeight="600"
            fontFamily="Geist Mono, JetBrains Mono, monospace"
            letterSpacing="-0.02em"
          >
            {currentInstant.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </text>
          <text
            x={cx}
            y={cy + 34}
            textAnchor="middle"
            fill="#D6A66D"
            fontSize="12"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
            letterSpacing="0.05em"
          >
            {dayEvents.length} SCHEDULED COMMITMENTS
          </text>
          {dragState && (
            <text
              x={cx}
              y={cy + 58}
              textAnchor="middle"
              fill="#F1F0EB"
              fontSize="12"
              fontFamily="Geist Mono, monospace"
              className="bg-black/80 px-2 py-1"
            >
              PROPOSED: {formatMinutes(dragState.curStartMinutes)} → {formatMinutes(dragState.curEndMinutes % 1440)}
            </text>
          )}
        </g>
      </svg>

      {/* Interactive Tooltip on Hover */}
      {tooltipData && !dragState && (
        <div
          className="fixed pointer-events-none z-50 bg-surface-raised/95 border border-border px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md"
          style={{
            left: `${tooltipData.x + 14}px`,
            top: `${tooltipData.y + 14}px`
          }}
        >
          <div className="font-semibold text-text-primary text-sm mb-0.5">
            {tooltipData.event.title}
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-accent">
            <Clock size={12} />
            <span>{tooltipData.startStr} – {tooltipData.endStr}</span>
            <span className="text-text-muted">({tooltipData.duration}m)</span>
          </div>
          {overlappingEventIds.has(tooltipData.event.id) && (
            <div className="flex items-center gap-1 text-warning mt-1 text-[10px] font-mono">
              <AlertCircle size={11} />
              <span>Collision / Overlapping interval detected</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
