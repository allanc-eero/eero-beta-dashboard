'use client';

import { useDeviceStore } from '@/store/deviceStore';

const actionColors: Record<string, string> = {
  checked_out: 'bg-Yellow-yellow-4',
  checked_in: 'bg-Green-green-4',
  field_updated: 'bg-Periwinkle-periwinkle-4',
  firmware_updated: 'bg-Purple-purple-4',
  deactivated: 'bg-Red-red-4',
  jira_created: 'bg-Orange-orange-4',
  jira_closed: 'bg-Gray-gray-5',
  health_regression: 'bg-Red-red-5',
  speed_test: 'bg-Turquoise-turquoise-4',
  overdue_reminder: 'bg-Yellow-yellow-4',
  created: 'bg-Green-green-5',
};

const actionLabels: Record<string, string> = {
  checked_out: 'Checked Out',
  checked_in: 'Checked In',
  field_updated: 'Updated',
  firmware_updated: 'Firmware Update',
  deactivated: 'Deactivated',
  jira_created: 'JIRA Created',
  jira_closed: 'JIRA Closed',
  health_regression: 'Regression',
  speed_test: 'Speed Test',
  overdue_reminder: 'Reminder Sent',
  created: 'Created',
};

export default function DeviceTimeline({ deviceId }: { deviceId: string }) {
  const { getDeviceHistory } = useDeviceStore();
  const history = getDeviceHistory(deviceId);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-text-placeholder">
        <p className="text-sm">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${actionColors[entry.action] || 'bg-Gray-gray-4'} mt-1.5`} />
            {idx < history.length - 1 && <div className="w-px flex-1 bg-Gray-gray-3 my-1" />}
          </div>

          {/* Content */}
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary">
                {actionLabels[entry.action] || entry.action}
              </span>
              <span className="text-xs text-text-placeholder">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5 break-words">{entry.description}</p>
            {entry.user && (
              <p className="text-xs text-text-placeholder mt-0.5">by {entry.user}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
