import React, { useEffect, useState } from 'react';
import type { ExtensionSettings, LearnedAnswer } from '@/shared/types';
import { DEFAULT_SETTINGS, DEFAULT_API_BASE_URL } from '@/shared/types';
import { getStorage, setStorage, updateSettings, getSettings, getApiBaseUrl, setApiBaseUrl } from '../background/storage';

export default function OptionsApp() {
  const [settings, setSettingsState] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_BASE_URL);
  const [learnedAnswers, setLearnedAnswers] = useState<LearnedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
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

  async function handleSettingChange(key: keyof ExtensionSettings, value: boolean | number) {
    const newSettings = { ...settings, [key]: value };
    setSettingsState(newSettings);

    try {
      await updateSettings({ [key]: value });
      showMessage('success', 'Setting saved');
    } catch (err) {
      showMessage('error', 'Failed to save setting');
    }
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
      <header>
        <h1>Columbus Settings</h1>
        <p className="subtitle">Configure your job application assistant</p>
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <section>
        <h2>Connection</h2>
        <div className="setting-group">
          <label>
            <span>Columbus API URL</span>
            <small>The URL where your Columbus app is running</small>
          </label>
          <div className="input-group">
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
            <button onClick={handleApiUrlChange} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2>Auto-Fill</h2>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.autoFillEnabled}
              onChange={(e) => handleSettingChange('autoFillEnabled', e.target.checked)}
            />
            <span>Enable auto-fill</span>
          </label>
          <small>Automatically detect form fields on job application pages</small>
        </div>

        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.showConfidenceIndicators}
              onChange={(e) => handleSettingChange('showConfidenceIndicators', e.target.checked)}
            />
            <span>Show confidence indicators</span>
          </label>
          <small>Display confidence levels for detected fields</small>
        </div>

        <div className="setting-group">
          <label>
            <span>Minimum confidence threshold</span>
            <small>Only fill fields with confidence above this level</small>
          </label>
          <div className="range-group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.minimumConfidence}
              onChange={(e) => handleSettingChange('minimumConfidence', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.minimumConfidence * 100)}%</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Learning</h2>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.learnFromAnswers}
              onChange={(e) => handleSettingChange('learnFromAnswers', e.target.checked)}
            />
            <span>Learn from my answers</span>
          </label>
          <small>Save answers to custom questions for future suggestions</small>
        </div>
      </section>

      <section>
        <h2>Notifications</h2>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifyOnJobDetected}
              onChange={(e) => handleSettingChange('notifyOnJobDetected', e.target.checked)}
            />
            <span>Show badge when job detected</span>
          </label>
          <small>Display a badge on the extension icon when a job listing is found</small>
        </div>
      </section>

      {learnedAnswers.length > 0 && (
        <section>
          <h2>Saved Answers ({learnedAnswers.length})</h2>
          <div className="answers-list">
            {learnedAnswers.map((answer) => (
              <div key={answer.id} className="answer-item">
                <div className="answer-question">{answer.question}</div>
                <div className="answer-text">{answer.answer}</div>
                <div className="answer-meta">
                  {answer.sourceCompany && <span>{answer.sourceCompany}</span>}
                  <span>Used {answer.timesUsed}x</span>
                  <button className="delete-btn" onClick={() => handleDeleteAnswer(answer.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>About</h2>
        <p className="about">
          Columbus Browser Extension v{chrome.runtime.getManifest().version}
        </p>
        <p className="about">
          <a href="https://github.com/your-repo/columbus" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </section>
    </div>
  );
}
