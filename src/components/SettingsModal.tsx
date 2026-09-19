import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { AISettings } from '../types';
import { AVAILABLE_OPENROUTER_MODELS } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (newSettings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [openRouterEnabled, setOpenRouterEnabled] = useState(
    Boolean(settings.openRouterApiKey && settings.openRouterApiKey.trim() !== '')
  );
  const [openRouterKey, setOpenRouterKey] = useState(settings.openRouterApiKey);
  const [openRouterModel, setOpenRouterModel] = useState(settings.openRouterModel);
  const [enableThought, setEnableThought] = useState(settings.enableThoughtProcess);

  const [elevenLabsEnabled, setElevenLabsEnabled] = useState(
    settings.activeVoiceMode === 'elevenlabs_scribe'
  );
  const [elevenLabsKey, setElevenLabsKey] = useState(settings.elevenLabsApiKey);
  const [elevenLabsModel, setElevenLabsModel] = useState(settings.elevenLabsModelId);

  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalOpenRouterKey = openRouterEnabled ? openRouterKey.trim() : '';
    const finalVoiceMode = elevenLabsEnabled ? 'elevenlabs_scribe' : 'native_win_h';
    const finalElevenLabsKey = elevenLabsEnabled ? elevenLabsKey.trim() : '';

    localStorage.setItem('scribeflow_openrouter_key', finalOpenRouterKey);
    localStorage.setItem('scribeflow_openrouter_model', openRouterModel);
    localStorage.setItem('scribeflow_elevenlabs_key', finalElevenLabsKey);
    localStorage.setItem('scribeflow_elevenlabs_model', elevenLabsModel);
    localStorage.setItem('scribeflow_voice_mode', finalVoiceMode);

    onSaveSettings({
      openRouterApiKey: finalOpenRouterKey,
      openRouterModel: openRouterModel,
      elevenLabsApiKey: finalElevenLabsKey,
      elevenLabsModelId: elevenLabsModel,
      enableThoughtProcess: enableThought,
      activeVoiceMode: finalVoiceMode
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-md rounded-2xl border shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold text-sm">Settings</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* OpenRouter Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">OpenRouter</span>
              <button
                type="button"
                role="switch"
                aria-checked={openRouterEnabled}
                onClick={() => setOpenRouterEnabled(!openRouterEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  openRouterEnabled ? 'bg-[var(--accent-color)]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    openRouterEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {openRouterEnabled && (
              <div className="space-y-3 pt-1">
                {/* API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium opacity-80">API Key</label>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] opacity-70 hover:opacity-100 underline"
                    >
                      Get key &gt;
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenRouterKey ? 'text' : 'password'}
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full text-xs px-3 py-2 pr-9 rounded-lg border outline-none font-mono"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer p-1"
                    >
                      {showOpenRouterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium opacity-80">Model</label>
                  <select
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {AVAILABLE_OPENROUTER_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thought Process Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium opacity-80">Show thoughts</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableThought}
                    onClick={() => setEnableThought(!enableThought)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      enableThought ? 'bg-[var(--accent-color)]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                        enableThought ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-[1px] w-full" style={{ backgroundColor: 'var(--border-color)' }} />

          {/* ElevenLabs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">ElevenLabs Voice</span>
              <button
                type="button"
                role="switch"
                aria-checked={elevenLabsEnabled}
                onClick={() => setElevenLabsEnabled(!elevenLabsEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  elevenLabsEnabled ? 'bg-[var(--accent-color)]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    elevenLabsEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {elevenLabsEnabled && (
              <div className="space-y-3 pt-1">
                {/* API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium opacity-80">API Key</label>
                    <a
                      href="https://elevenlabs.io/app/speech-to-text"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] opacity-70 hover:opacity-100 underline"
                    >
                      Get key &gt;
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showElevenLabsKey ? 'text' : 'password'}
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      placeholder="xi-api-key-..."
                      className="w-full text-xs px-3 py-2 pr-9 rounded-lg border outline-none font-mono"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer p-1"
                    >
                      {showElevenLabsKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium opacity-80">Model</label>
                  <select
                    value={elevenLabsModel}
                    onChange={(e) => setElevenLabsModel(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="scribe_v1">scribe_v1</option>
                    <option value="scribe_v2">scribe_v2</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border text-xs hover:opacity-80 transition-opacity cursor-pointer"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-98 cursor-pointer flex items-center gap-1 shadow-xs"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
