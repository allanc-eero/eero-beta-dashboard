'use client';

import { useState } from 'react';
import { OptOutRecord } from '@/types';
import { useDeviceStore } from '@/store/deviceStore';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, Circle, ExternalLink, Bell } from 'lucide-react';
import { adminUserUrl, insightNetworkUrl, resolveEnv } from '@/lib/format';

interface OptOutChecklistPanelProps {
  record: OptOutRecord;
}

export default function OptOutChecklistPanel({ record }: OptOutChecklistPanelProps) {
  const { updateOptOutChecklist, getTesterProfile, devices } = useDeviceStore();
  const { currentUser } = useAuthStore();
  const [showCompleteNotice, setShowCompleteNotice] = useState(false);

  const checklist = record.checklist || {
    adminRemoved: false, qualtricsRemoved: false, devicesOffboarded: false, networkReset: false, allCompleted: false,
  };

  const profile = getTesterProfile(record.personEmail);
  const networkId = profile?.networkId || '';
  const adminId = profile?.adminId || '';
  const userName = currentUser?.name || 'Admin';
  // Route this tester's Insight/Admin links to the right cloud. Dogfood offboarding
  // touches stage networks, so infer env from the tester's devices.
  const df = devices.find((d) => d.assignedEmail === record.personEmail && (d.environment === 'stage' || (d.program || '').toLowerCase().includes('dogfood')));
  const personEnv = df ? resolveEnv(df.environment, df.program) : 'prod';

  const handleCheck = (field: 'adminRemoved' | 'qualtricsRemoved' | 'devicesOffboarded' | 'networkReset') => {
    updateOptOutChecklist(record.id, field, userName);
    // Check if all will be complete after this
    const updated = { ...checklist, [field]: true };
    if (updated.adminRemoved && updated.qualtricsRemoved && updated.devicesOffboarded && updated.networkReset) {
      setShowCompleteNotice(true);
      setTimeout(() => setShowCompleteNotice(false), 6000);
    }
  };

  const steps = [
    {
      key: 'adminRemoved' as const,
      label: 'Remove from eero Admin',
      description: 'Revert tester to default user role in admin panel',
      done: checklist.adminRemoved,
      doneAt: checklist.adminRemovedAt,
      doneBy: checklist.adminRemovedBy,
      link: adminId ? adminUserUrl(adminId, personEnv) : networkId ? insightNetworkUrl(networkId, personEnv) : undefined,
      linkLabel: adminId ? 'Open in Admin' : networkId ? 'Open in Insight' : undefined,
    },
    {
      key: 'qualtricsRemoved' as const,
      label: 'Flag/Remove in Qualtrics',
      description: 'Mark as opted out in the Qualtrics mailing list so they don\'t receive future testing surveys',
      done: checklist.qualtricsRemoved,
      doneAt: checklist.qualtricsRemovedAt,
      doneBy: checklist.qualtricsRemovedBy,
      link: 'https://eero.qualtrics.com/directories',
      linkLabel: 'Open Qualtrics Directory',
    },
    {
      key: 'devicesOffboarded' as const,
      label: 'Offboard devices from tracker',
      description: 'Ensure all devices are returned, deactivated, or reassigned',
      done: checklist.devicesOffboarded,
      doneAt: checklist.devicesOffboardedAt,
      doneBy: checklist.devicesOffboardedBy,
      link: undefined,
      linkLabel: undefined,
    },
    {
      key: 'networkReset' as const,
      label: 'Reset network to default (off stage)',
      description: 'Move the network/group back to production and confirm it is no longer on the dogfood (stage) environment',
      done: checklist.networkReset,
      doneAt: checklist.networkResetAt,
      doneBy: checklist.networkResetBy,
      link: networkId ? insightNetworkUrl(networkId, personEnv) : undefined,
      linkLabel: networkId ? 'Open in Insight' : undefined,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="mt-4 bg-layer-page rounded-xl border border-border-layer-page p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Offboarding Checklist</h4>
          <p className="text-xs text-text-tertiary mt-0.5">Complete all steps to fully offboard this tester</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${checklist.allCompleted ? 'bg-fill-tag-green text-text-support-success' : 'bg-fill-tag-yellow text-text+icon-support-warning'}`}>
            {checklist.allCompleted ? '✓ Complete' : `${completedCount}/${steps.length}`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-layer-page-hover rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${checklist.allCompleted ? 'bg-Green-green-5' : 'bg-Periwinkle-periwinkle-6'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.key} className={`flex items-start gap-3 p-3 rounded-lg border ${step.done ? 'bg-fill-support-success border-border-support-success' : 'bg-layer-page border-border-layer-page'}`}>
            {/* Checkbox */}
            <button
              onClick={() => !step.done && handleCheck(step.key)}
              disabled={step.done}
              className={`flex-shrink-0 mt-0.5 ${step.done ? 'text-Green-green-6' : 'text-text-disabled hover:text-Periwinkle-periwinkle-6 cursor-pointer'}`}
            >
              {step.done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${step.done ? 'text-text-support-success line-through' : 'text-text-primary'}`}>
                  {step.label}
                </p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-Periwinkle-periwinkle-6 hover:text-text+icon-support-info hover:underline"
                  >
                    {step.linkLabel}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">{step.description}</p>
              {step.done && step.doneAt && (
                <p className="text-xs text-Green-green-6 mt-1">
                  ✓ Done by {step.doneBy} on {new Date(step.doneAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Action button for incomplete steps */}
            {!step.done && (
              <button
                onClick={() => handleCheck(step.key)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-text+icon-support-info border border-Periwinkle-periwinkle-3 rounded-md hover:bg-fill-support-info"
              >
                Mark Done
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Completion notice */}
      {checklist.allCompleted && (
        <div className="mt-4 p-3 bg-fill-support-success border border-border-support-success rounded-lg">
          <p className="text-sm font-medium text-text-support-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            All offboarding steps complete
          </p>
          <p className="text-xs text-Green-green-6 mt-1">
            Completed on {checklist.completedAt ? new Date(checklist.completedAt).toLocaleDateString() : 'N/A'}. This tester has been fully offboarded.
          </p>
        </div>
      )}

      {/* Toast-style notification when all steps are done */}
      {showCompleteNotice && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm bg-layer-page border border-border-support-success rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-fill-tag-green rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-Green-green-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Offboarding Complete</p>
              <p className="text-xs text-text-tertiary">{record.personName} has been fully offboarded from all systems.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
