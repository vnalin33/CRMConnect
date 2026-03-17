/**
 * concernConstants.js
 *
 * Shared configuration maps for concern priority and status rendering.
 * Extracted from ConcernCard so they can be reused across any
 * concern-related component (detail screens, modals, analytics, etc.).
 */

// ─── Priority visual config ─────────────────────────────────────────────────

export const PRIORITY_CONFIG = {
    High: { icon: 'alert-triangle', color: '#F44336', bg: 'rgba(244,67,54,0.08)' },
    Medium: { icon: 'alert-circle', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    Low: { icon: 'info', color: '#00C896', bg: 'rgba(0,200,150,0.08)' },
};

// ─── Status badge visual config ──────────────────────────────────────────────

export const STATUS_CONFIG = {
    Pending: { bg: '#FEF3CD', text: '#92400E' },
    'In Progress': { bg: '#EDEAFF', text: '#6855F0' },
    Resolved: { bg: '#E0FAF3', text: '#065F46' },
    Closed: { bg: '#F0F0F8', text: '#6B7280' },
};

// ─── Safe getters with fallback ──────────────────────────────────────────────

export const getPriorityConfig = (priority = 'Low') =>
    PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;

export const getStatusConfig = (status = 'Pending') =>
    STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
