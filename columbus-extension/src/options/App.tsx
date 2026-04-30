import React, { useEffect, useState } from 'react';
import type { ExtensionSettings, LearnedAnswer } from '@/shared/types';
import { DEFAULT_SETTINGS, DEFAULT_API_BASE_URL } from '@/shared/types';
import { updateSettings, getSettings, getApiBaseUrl, setApiBaseUrl } from '../background/storage';
import {
  SCRAPE_SITE_OPTIONS,
  formatConfidencePercent,
  toggleScrapeSource,
} from './settings-metadata';

interface AuthStatus {
  isAuthenticated: boolean;
  apiBaseUrl: string;
}

export default function OptionsApp() {
  const [settings, setSettingsState] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_BASE_URL);
  const [learnedAnswers, setLearnedAnswers] = useState<LearnedAnswer[]>([]);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadAuthStatus();
    loadLearnedAnswers();
  }, []);

  async function loadSettings() {
    try {
      const [settingsData, url] = await Promise.all([
        getSettings(),
        getApiBaseUrl(),
      ]);
      setSettingsState(settingsData);
      setApiUrl(url);
    } catch (err) {
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function loadAuthStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
      if (response?.success && response.data) {
        setAuthStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to load auth status:', err);
    }
  }

  async function loadLearnedAnswers() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
      if (!response?.data?.isAuthenticated) return;

      // Fetch learned answers via background script
      const result = await chrome.runtime.sendMessage({ type: 'GET_LEARNED_ANSWERS' });
      if (result?.success && result.data) {
        setLearnedAnswers(result.data);
      }
    } catch (err) {
      console.error('Failed to load learned answers:', err);
    }
  }

  async function handleDeleteAnswer(id: string) {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'DELETE_ANSWER',
        payload: id,
      });
      if (result?.success) {
        setLearnedAnswers((prev) => prev.filter((a) => a.id !== id));
        showMessage('success', 'Answer deleted');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete answer');
    }
  }

  async function handleConnect() {
    try {
      await chrome.runtime.sendMessage({ type: 'OPEN_AUTH' });
      showMessage('success', 'Opening Columbus sign in');
    } catch (err) {
      showMessage('error', 'Failed to open sign in');
    }
  }

  async function handleLogout() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });
      if (response?.success) {
        setAuthStatus((prev) => ({ apiBaseUrl: prev?.apiBaseUrl || apiUrl, isAuthenticated: false }));
        setLearnedAnswers([]);
        showMessage('success', 'Account disconnected');
      } else {
        showMessage('error', response?.error || 'Failed to disconnect account');
      }
    } catch (err) {
      showMessage('error', 'Failed to disconnect account');
    }
  }

  async function handleSettingChange(
    key: keyof ExtensionSettings,
    value: boolean | number | string[]
  ) {
    const newSettings = { ...settings, [key]: value };
    setSettingsState(newSettings);

    try {
      await updateSettings({ [key]: value });
      showMessage('success', 'Setting saved');
    } catch (err) {
      showMessage('error', 'Failed to save setting');
    }
  }

  async function handleScrapeSourceChange(source: string, enabled: boolean) {
    await handleSettingChange(
      'enabledScraperSources',
      toggleScrapeSource(settings.enabledScraperSources, source, enabled)
    );
  }

  async function handleApiUrlChange() {
    setSaving(true);
    try {
      await setApiBaseUrl(apiUrl);
      showMessage('success', 'API URL saved');
    } catch (err) {
      showMessage('error', 'Failed to save API URL');
    } finally {
      setSaving(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading) {
    return (
      <div className="options-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="options-container">
      <header className="header">
        <h1>Columbus</h1>
        <p className="subtitle">Extension settings</p>
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <main className="content">
        <section className="section">
          <div className="section-heading">
            <h2>Account</h2>
          </div>
          <div className="setting-row">
            <div>
              <span className="setting-title">
                {authStatus?.isAuthenticated ? 'Connected to Columbus' : 'Not connected'}
              </span>
              <small>
                {authStatus?.isAuthenticated
                  ? 'Your profile and saved answers can sync with the extension.'
                  : 'Connect your account to use profile auto-fill and saved answers.'}
              </small>
            </div>
            <button
              className={authStatus?.isAuthenticated ? 'secondary' : 'primary'}
              onClick={authStatus?.isAuthenticated ? handleLogout : handleConnect}
            >
              {authStatus?.isAuthenticated ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>API URL</h2>
          </div>
          <div className="setting-group">
            <label htmlFor="api-url">
              <span className="setting-title">Columbus API URL</span>
              <small>The URL where your Columbus app is running.</small>
            </label>
            <div className="input-group">
              <input
                id="api-url"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
              <button className="primary" onClick={handleApiUrlChange} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>Auto-fill preferences</h2>
          </div>
          <ToggleSetting
            checked={settings.autoFillEnabled}
            title="Enable auto-fill"
            description="Detect fields on job application forms and prepare profile suggestions."
            onChange={(checked) => handleSettingChange('autoFillEnabled', checked)}
          />
          <ToggleSetting
            checked={settings.showConfidenceIndicators}
            title="Show confidence indicators"
            description="Display match confidence for detected fields before filling."
            onChange={(checked) => handleSettingChange('showConfidenceIndicators', checked)}
          />
          <ToggleSetting
            checked={settings.autoDetectPrompts}
            title="Auto-detect custom prompts"
            description="Watch long-answer questions so reusable answers can be suggested or saved."
            onChange={(checked) => handleSettingChange('autoDetectPrompts', checked)}
          />
          <div className="setting-group">
            <label htmlFor="minimum-confidence">
              <span className="setting-title">Minimum confidence threshold</span>
              <small>Only fill fields with confidence above this level.</small>
            </label>
            <div className="range-group">
              <input
                id="minimum-confidence"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.minimumConfidence}
                onChange={(e) => handleSettingChange('minimumConfidence', parseFloat(e.target.value))}
              />
              <span>{formatConfidencePercent(settings.minimumConfidence)}</span>
            </div>
          </div>
          <ToggleSetting
            checked={settings.showSalaryOverlay}
            title="Salary overlay"
            description="Surface detected salary information while reviewing job listings."
            onChange={(checked) => handleSettingChange('showSalaryOverlay', checked)}
          />
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>Scrape sites</h2>
          </div>
          <ToggleSetting
            checked={settings.enableJobScraping}
            title="Detect and import job listings"
            description="Scan supported job sites so listings can be imported from the popup."
            onChange={(checked) => handleSettingChange('enableJobScraping', checked)}
          />
          <div className="site-grid">
            {SCRAPE_SITE_OPTIONS.map((site) => (
              <ToggleSetting
                key={site.source}
                checked={settings.enabledScraperSources.includes(site.source)}
                title={site.label}
                description={site.description}
                disabled={!settings.enableJobScraping}
                onChange={(checked) => handleScrapeSourceChange(site.source, checked)}
              />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>Saved Q&A library</h2>
            <span className="count-badge">{learnedAnswers.length}</span>
          </div>
          <ToggleSetting
            checked={settings.learnFromAnswers}
            title="Learn from my answers"
            description="Save answers to custom questions for future suggestions."
            onChange={(checked) => handleSettingChange('learnFromAnswers', checked)}
          />
          {learnedAnswers.length === 0 ? (
            <p className="muted">No saved answers yet.</p>
          ) : (
          <div className="answers-list">
            {learnedAnswers.map((answer) => (
              <div key={answer.id} className="answer-item">
                <div className="answer-question">{answer.question}</div>
                <div className="answer-text">{answer.answer}</div>
                <div className="answer-meta">
                  {answer.sourceCompany && <span>{answer.sourceCompany}</span>}
                  <span>Used {answer.timesUsed}x</span>
                  <button className="text-button" onClick={() => handleDeleteAnswer(answer.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>About</h2>
          </div>
          <div className="about-grid">
            <span>Columbus Browser Extension</span>
            <span>v{chrome.runtime.getManifest().version}</span>
          </div>
          <ToggleSetting
            checked={settings.notifyOnJobDetected}
            title="Show badge when job detected"
            description="Display a badge on the extension icon when a job listing is found."
            onChange={(checked) => handleSettingChange('notifyOnJobDetected', checked)}
          />
        </section>
      </main>
    </div>
  );
}

interface ToggleSettingProps {
  checked: boolean;
  title: string;
  description: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({
  checked,
  title,
  description,
  disabled = false,
  onChange,
}: ToggleSettingProps) {
  return (
    <label className={`toggle-row${disabled ? ' disabled' : ''}`}>
      <span>
        <span className="setting-title">{title}</span>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}
