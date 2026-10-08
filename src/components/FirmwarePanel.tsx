'use client';

import { useDeviceStore } from '@/store/deviceStore';
import { useState } from 'react';
import { Card, Button } from '@amzn/eero-web-design-components';

export default function FirmwarePanel({ deviceId }: { deviceId: string }) {
  const { devices, latestFirmware, pushFirmwareUpdate, getDeviceHistory } = useDeviceStore();
  const [pushing, setPushing] = useState(false);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  const isOutdated = device.firmwareVersion && device.firmwareVersion !== latestFirmware.version;
  const firmwareHistory = getDeviceHistory(deviceId).filter((h) => h.action === 'firmware_updated');

  const handlePushUpdate = () => {
    setPushing(true);
    // Simulate firmware push delay
    setTimeout(() => {
      pushFirmwareUpdate(deviceId, latestFirmware.version);
      setPushing(false);
    }, 1500);
  };

  return (
    <Card size={2} title={<span className="text-sm font-semibold text-text-primary">Firmware</span>}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary">Current Version</span>
          <span className={`text-xs font-mono font-medium ${isOutdated ? 'text-Orange-orange-6' : 'text-Green-green-6'}`}>
            {device.firmwareVersion || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary">Latest Available</span>
          <span className="text-xs font-mono font-medium text-text-primary">{latestFirmware.version}</span>
        </div>

        {isOutdated && (
          <div className="mt-2 p-2 bg-fill-support-warning border border-border-support-warning rounded-md">
            <p className="text-xs text-text+icon-support-warning font-medium">⚠️ Firmware is outdated</p>
            <div className="mt-2">
              <Button
                type="primary"
                label={pushing ? 'Pushing update...' : `Update to ${latestFirmware.version}`}
                loading={pushing}
                disabled={pushing}
                fullWidth
                onClick={handlePushUpdate}
              />
            </div>
          </div>
        )}

        {!isOutdated && device.firmwareVersion && (
          <p className="text-xs text-Green-green-6 font-medium mt-1">✓ Up to date</p>
        )}
      </div>

      {firmwareHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-layer-page">
          <p className="text-xs font-medium text-text-tertiary mb-2">Update History</p>
          <div className="space-y-1">
            {firmwareHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="text-xs text-text-tertiary">
                <span className="font-mono">{entry.oldValue}</span>
                <span className="mx-1">→</span>
                <span className="font-mono font-medium">{entry.newValue}</span>
                <span className="text-text-placeholder ml-2">{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
