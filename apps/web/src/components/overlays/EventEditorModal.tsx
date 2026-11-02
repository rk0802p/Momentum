import React, { useState, useEffect } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import type { EventStatus } from '@momentum/shared-types';
import { X, Clock, Tag, Calendar, Check, AlertCircle } from 'lucide-react';

export const EventEditorModal: React.FC = () => {
  const {
    isEditorOpen,
    editorPrefill,
    closeEditor,
    activeDate,
    timezone,
    setSelectedEventId
  } = useNavigationStore();

  const { categories, addEvent, updateEvent } = useEventStore();

  const isEditing = Boolean(editorPrefill?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dateStr, setDateStr] = useState(activeDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [status, setStatus] = useState<EventStatus>('planned');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editorPrefill) {
      setTitle(editorPrefill.title || '');
      setDescription(editorPrefill.description || '');
      setCategoryId(editorPrefill.categoryId || categories[0]?.id || 'cat-work');
      setStatus(editorPrefill.status || 'planned');

      if (editorPrefill.startAt) {
        const d = new Date(editorPrefill.startAt);
        setDateStr(editorPrefill.startAt.substring(0, 10));
        setStartTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else {
        setDateStr(activeDate);
        setStartTime('09:00');
      }

      if (editorPrefill.endAt) {
        const d = new Date(editorPrefill.endAt);
        setEndTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else {
        setEndTime('10:00');
      }
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'cat-work');
      setDateStr(activeDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setStatus('planned');
    }
    setError(null);
  }, [editorPrefill, activeDate, categories]);

  if (!isEditorOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    const startIso = `${dateStr}T${startTime}:00+05:30`;
    let endIso = `${dateStr}T${endTime}:00+05:30`;

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      // Overnight check or error
      const nextDate = new Date(dateStr);
      nextDate.setDate(nextDate.getDate() + 1);
      endIso = `${nextDate.toISOString().substring(0, 10)}T${endTime}:00+05:30`;
    }

    if (isEditing && editorPrefill?.id) {
      updateEvent(editorPrefill.id, {
        title: title.trim(),
        description: description.trim() || null,
        categoryId,
        startAt: startIso,
        endAt: endIso,
        status
      });
      setSelectedEventId(editorPrefill.id);
    } else {
      const created = addEvent({
        userId: 'default-user',
        title: title.trim(),
        description: description.trim() || null,
        categoryId,
        startAt: startIso,
        endAt: endIso,
        timezone,
        allDay: false,
        status,
        recurrenceId: null,
        parentEventId: null
      });
      setSelectedEventId(created.id);
    }

    closeEditor();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-raised border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold tracking-wide text-text-primary">
            {isEditing ? 'Edit Commitment' : 'Create Temporal Commitment'}
          </h3>
          <button
            onClick={closeEditor}
            className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-2 text-warning text-xs">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">TITLE</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Build Spatial Calendar Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">CATEGORY</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                    categoryId === c.id
                      ? 'border-accent bg-surface shadow-glow'
                      : 'border-border bg-surface/50 hover:bg-surface'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="truncate text-text-secondary">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">DATE</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">START</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted">END</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">DESCRIPTION (OPTIONAL)</label>
            <textarea
              rows={3}
              placeholder="Add contextual details or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={closeEditor}
              className="px-4 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e4b57e] transition-colors shadow-glow"
            >
              {isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
