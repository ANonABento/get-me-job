import React, { useEffect, useState } from 'react';
import type { ExtensionProfile, ScrapedJob } from '@/shared/types';
import { sendMessage, Messages } from '@/shared/messages';

type ViewState = 'loading' | 'unauthenticated' | 'authenticated' | 'error';

interface PageStatus {
  hasForm: boolean;
  hasJobListing: boolean;
  detectedFields: number;
  scrapedJob: ScrapedJob | null;
}

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [profile, setProfile] = useState<ExtensionProfile | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    checkPageStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkAuthStatus() {
    try {
      const response = await sendMessage(Messages.getAuthStatus());
      if (response.success && response.data) {
        const { isAuthenticated } = response.data as { isAuthenticated: boolean };
        if (isAuthenticated) {
          setViewState('authenticated');
          loadProfile();
        } else {
          setViewState('unauthenticated');
        }
      } else {
        setViewState('unauthenticated');
      }
    } catch (err) {
      setError((err as Error).message);
      setViewState('error');
    }
  }

  async function loadProfile() {
    const response = await sendMessage<ExtensionProfile>(Messages.getProfile());
    if (response.success && response.data) {
      setProfile(response.data);
    }
  }

  async function checkPageStatus() {
    // Get current tab and send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_STATUS' });
        if (response) {
          setPageStatus(response);
        }
      } catch {
        // Content script not loaded
      }
    }
  }

  async function handleConnect() {
    await sendMessage(Messages.openAuth());
    window.close();
  }

  async function handleLogout() {
    await sendMessage(Messages.logout());
    setViewState('unauthenticated');
    setProfile(null);
  }

  async function handleFillForm() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_FILL' });
      window.close();
    }
  }

  async function handleImportJob() {
    if (!pageStatus?.scrapedJob) return;

    setImporting(true);
    try {
      const response = await sendMessage(Messages.importJob(pageStatus.scrapedJob));
      if (response.success) {
        setImportSuccess(true);
        setTimeout(() => window.close(), 1500);
      } else {
        setError(response.error || 'Failed to import job');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImporting(false);
    }
  }

  async function handleOpenDashboard() {
    const response = await sendMessage(Messages.getAuthStatus());
    const data = response.data as { apiBaseUrl: string } | undefined;
    const baseUrl = data?.apiBaseUrl || 'http://localhost:3000';
    chrome.tabs.create({ url: `${baseUrl}/dashboard` });
    window.close();
  }

  if (viewState === 'loading') {
    return (
      <div className="popup-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="popup-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => checkAuthStatus()}>Retry</button>
        </div>
      </div>
    );
  }

  if (viewState === 'unauthenticated') {
    return (
      <div className="popup-container">
        <div className="header">
          <h1>Columbus</h1>
          <p className="subtitle">Job Application Assistant</p>
        </div>
        <div className="content">
          <p>Connect your Columbus account to start auto-filling job applications.</p>
          <button className="primary" onClick={handleConnect}>
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="header">
        <h1>Columbus</h1>
        {profile && (
          <p className="subtitle">
            {profile.contact?.name || 'No profile name'}
          </p>
        )}
      </div>

      <div className="content">
        {/* Page Actions */}
        {pageStatus && (
          <div className="section">
            <h3>Current Page</h3>

            {pageStatus.hasForm && (
              <div className="action-card">
                <div className="action-info">
                  <span className="action-title">Application Form Detected</span>
                  <span className="action-subtitle">
                    {pageStatus.detectedFields} fields found
                  </span>
                </div>
                <button className="primary small" onClick={handleFillForm}>
                  Fill Form
                </button>
              </div>
            )}

            {pageStatus.hasJobListing && pageStatus.scrapedJob && (
              <div className="action-card">
                <div className="action-info">
                  <span className="action-title">{pageStatus.scrapedJob.title}</span>
                  <span className="action-subtitle">{pageStatus.scrapedJob.company}</span>
                </div>
                {importSuccess ? (
                  <span className="success-badge">Imported!</span>
                ) : (
                  <button
                    className="primary small"
                    onClick={handleImportJob}
                    disabled={importing}
                  >
                    {importing ? 'Importing...' : 'Import Job'}
                  </button>
                )}
              </div>
            )}

            {!pageStatus.hasForm && !pageStatus.hasJobListing && (
              <p className="muted">No job application form or listing detected on this page.</p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="secondary" onClick={handleOpenDashboard}>
              Open Dashboard
            </button>
            <button className="secondary" onClick={() => chrome.runtime.openOptionsPage()}>
              Settings
            </button>
          </div>
        </div>

        {/* Profile Preview */}
        {profile && (
          <div className="section">
            <h3>Profile</h3>
            <div className="profile-preview">
              {profile.contact?.email && <p>{profile.contact.email}</p>}
              {profile.computed?.currentTitle && profile.computed?.currentCompany && (
                <p className="muted">
                  {profile.computed.currentTitle} at {profile.computed.currentCompany}
                </p>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="skills-preview">
                  {profile.skills.slice(0, 5).map((skill) => (
                    <span key={skill.id} className="skill-tag">{skill.name}</span>
                  ))}
                  {profile.skills.length > 5 && (
                    <span className="skill-tag more">+{profile.skills.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <button className="text-button" onClick={handleLogout}>
          Disconnect
        </button>
      </div>
    </div>
  );
}
