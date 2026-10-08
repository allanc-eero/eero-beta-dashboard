'use client';

/**
 * DEMO COMPONENT — "Today" Briefing View
 * 
 * This replaces the stat cards + sync button + overdue banner with a single
 * intelligent summary of what needs attention right now.
 * 
 * TO ENABLE: In src/app/page.tsx, add:
 *   import TodayBriefing from '@/components/TodayBriefing';
 *   Then replace the <DashboardStats>, <NetworkSyncButton>, and <OverdueAlertsBanner>
 *   with: <TodayBriefing onNavigate={handleSetActiveTab} />
 * 
 * TO REMOVE: Delete this file and revert page.tsx. No other files are affected.
 */

import { useMemo } from 'react';
import { useDeviceStore } from '@/store/deviceStore';
import { TabType } from '@/types';
import { isReturnOverdue, RETURN_OVERDUE_MS } from '@/lib/format';

interface TodayBriefingProps {
  onNavigate: (tab: TabType) => void;
}

export default function TodayBriefing({ onNavigate }: TodayBriefingProps) {
  const { devices, getOptOuts, deviceHistory } = useDeviceStore();

  const briefing = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    // Pending returns overdue 2+ weeks
    const overdueReturns = devices.filter((d) => d.status === 'pending_return' && isReturnOverdue(d.returnEmailSentAt, now));

    // Pending returns needing follow-up (1-2 weeks)
    const needsFollowUp = devices.filter((d) =>
      d.status === 'pending_return' && d.returnEmailSentAt &&
      (now - new Date(d.returnEmailSentAt).getTime()) >= oneWeekMs &&
      (now - new Date(d.returnEmailSentAt).getTime()) < RETURN_OVERDUE_MS
    );

    // All pending returns
    const pendingReturns = devices.filter((d) => d.status === 'pending_return');

    // Devices that came online recently (last 24h based on updatedAt)
    const recentlyOnline = devices.filter((d) =>
      d.status === 'online' && d.updatedAt &&
      (now - new Date(d.updatedAt).getTime()) < oneDayMs
    );

    // Recent opt-outs
    const optOuts = getOptOuts();
    const recentOptOuts = optOuts.filter((o) =>
      (now - new Date(o.optOutDate).getTime()) < oneDayMs * 7
    );

    const totalActions = overdueReturns.length + needsFollowUp.length;

    return { overdueReturns, needsFollowUp, pendingReturns, recentlyOnline, recentOptOuts, totalActions };
  }, [devices, getOptOuts]);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{greeting}.</h1>
        {briefing.totalActions > 0 && (
          <p className="text-sm text-text-tertiary mt-1">{briefing.totalActions} item{briefing.totalActions !== 1 ? 's' : ''} need your attention today.</p>
        )}
      </div>

      {/* Action Cards */}
      <div className="space-y-3">
        {/* Overdue returns — highest priority */}
        {briefing.overdueReturns.length > 0 && (
          <div className="bg-fill-support-error border border-border-support-error rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-support-error">🚨 {briefing.overdueReturns.length} device(s) overdue for return (2+ weeks)</p>
              <p className="text-xs text-Red-red-6 mt-0.5">These testers haven't returned their devices. Send urgent reminders or brick.</p>
            </div>
            <button onClick={() => onNavigate('shipments')} className="px-4 py-2 text-xs font-medium text-text-on-color bg-Red-red-6 rounded-lg hover:bg-Red-red-7">
              View Overdue →
            </button>
          </div>
        )}

        {/* Follow-up needed */}
        {briefing.needsFollowUp.length > 0 && (
          <div className="bg-fill-support-warning border border-border-support-warning rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text+icon-support-warning">⏰ {briefing.needsFollowUp.length} device(s) need follow-up reminders (1 week)</p>
              <p className="text-xs text-Yellow-yellow-6 mt-0.5">Return emails were sent over a week ago with no response.</p>
            </div>
            <button onClick={() => onNavigate('shipments')} className="px-4 py-2 text-xs font-medium text-text+icon-support-warning border border-Yellow-yellow-3 rounded-lg hover:bg-fill-tag-yellow">
              Send Reminders →
            </button>
          </div>
        )}

        {/* Pending returns (informational) */}
        {briefing.pendingReturns.length > 0 && briefing.overdueReturns.length === 0 && briefing.needsFollowUp.length === 0 && (
          <div className="bg-Orange-orange-1 border border-Orange-orange-2 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-Orange-orange-8">📦 {briefing.pendingReturns.length} device(s) pending return</p>
              <p className="text-xs text-Orange-orange-6 mt-0.5">Return emails sent. Waiting for devices to come back.</p>
            </div>
            <button onClick={() => onNavigate('shipments')} className="px-4 py-2 text-xs font-medium text-Orange-orange-7 border border-Orange-orange-3 rounded-lg hover:bg-fill-tag-orange">
              View →
            </button>
          </div>
        )}

        {/* Recent opt-outs */}
        {briefing.recentOptOuts.length > 0 && (
          <div className="bg-layer-page-hover border border-border-layer-page rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary">👋 {briefing.recentOptOuts.length} tester(s) opted out this week</p>
              <p className="text-xs text-text-tertiary mt-0.5">{briefing.recentOptOuts.map((o) => o.personName).join(', ')}</p>
            </div>
            <button onClick={() => onNavigate('people')} className="px-4 py-2 text-xs font-medium text-text-tertiary border border-border-layer-page rounded-lg hover:bg-layer-page-hover">
              View →
            </button>
          </div>
        )}

        {/* Devices came online */}
        {briefing.recentlyOnline.length > 0 && (
          <div className="bg-fill-support-success border border-border-support-success rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-support-success">✓ {briefing.recentlyOnline.length} device(s) came online recently</p>
              <p className="text-xs text-Green-green-6 mt-0.5">Network sync detected new connections.</p>
            </div>
            <button onClick={() => onNavigate('devices')} className="px-4 py-2 text-xs font-medium text-text-support-success border border-Green-green-3 rounded-lg hover:bg-fill-tag-green">
              View →
            </button>
          </div>
        )}
      </div>

      {/* Quick stats — compact, secondary */}
      <div className="mt-6 flex items-center gap-6 text-xs text-text-tertiary">
        <span>{devices.length} total devices</span>
        <span>{devices.filter((d) => d.status === 'online').length} online</span>
        <span>{devices.filter((d) => d.status === 'not_online').length} offline</span>
        <span>{new Set(devices.map((d) => d.country).filter(Boolean)).size} countries</span>
      </div>

      {/* Activity Feed — last 3 months */}
      {(() => {
        const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const recentActivity = deviceHistory
          .filter((h) => new Date(h.timestamp).getTime() > threeMonthsAgo)
          .filter((h) => ['bricked', 'deactivated', 'return_requested', 'return_confirmed', 'email_sent', 'reminder_sent', 'program_closed', 'created', 'shipped_to_tester'].includes(h.action))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20);

        if (recentActivity.length === 0) return null;

        const actionIcons: Record<string, string> = {
          bricked: '🚨', deactivated: '📁', return_requested: '📦', return_confirmed: '✓',
          email_sent: '📧', reminder_sent: '⏰', program_closed: '📋', created: '➕', shipped_to_tester: '🚚',
        };

        return (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Recent Activity</h3>
            <div className="bg-layer-page rounded-xl border border-border-layer-page divide-y divide-border-layer-page max-h-64 overflow-y-auto">
              {recentActivity.map((entry) => {
                const device = devices.find((d) => d.id === entry.deviceId);
                return (
                  <div key={entry.id} className="px-4 py-2.5 flex items-start gap-3">
                    <span className="text-sm mt-0.5">{actionIcons[entry.action] || '•'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary truncate">{entry.description}</p>
                      <p className="text-xs text-text-placeholder mt-0.5">
                        {device?.serialNumber && <span className="font-mono">{device.serialNumber} · </span>}
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {entry.user !== 'System' && <span> · {entry.user}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
