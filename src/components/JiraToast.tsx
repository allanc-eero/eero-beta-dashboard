'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, X } from 'lucide-react';

interface JiraToastProps {
  ticketKey: string;
  summary: string;
  epicKey?: string;
  onClose: () => void;
  autoCloseMs?: number;
}

export default function JiraToast({ ticketKey, summary, epicKey, onClose, autoCloseMs = 8000 }: JiraToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // allow fade-out animation
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, onClose]);

  const jiraUrl = `https://eeroinc.atlassian.net/browse/${ticketKey}`;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-md bg-layer-page border border-border-support-success rounded-xl shadow-2xl p-4 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-fill-tag-green rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-Green-green-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">JIRA Ticket Created</p>
          <p className="text-xs text-text-tertiary mt-0.5 truncate">{summary}</p>
          <div className="flex items-center gap-2 mt-2">
            <a
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-Periwinkle-periwinkle-6 hover:text-text+icon-support-info hover:underline"
            >
              {ticketKey}
              <ExternalLink className="w-3 h-3" />
            </a>
            {epicKey && (
              <span className="text-xs text-text-placeholder">in epic {epicKey}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="flex-shrink-0 text-text-placeholder hover:text-text-tertiary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
