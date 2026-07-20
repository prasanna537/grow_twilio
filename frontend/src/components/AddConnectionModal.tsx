'use client';

import React, { useState } from 'react';
import { ProviderType, ConnectionItem } from '@/lib/providers/types';
import { X, Check, ArrowRight, ArrowLeft, Server, ShieldCheck, Zap } from 'lucide-react';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConnection: (conn: Partial<ConnectionItem>) => void;
}

const PROVIDERS: Array<{
  type: ProviderType;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}> = [
  {
    type: 'WAHA',
    title: 'WAHA (Self-Hosted)',
    description: 'Open-source WhatsApp HTTP API engine with full session management',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    type: 'EVOLUTION',
    title: 'Evolution API',
    description: 'Multi-instance Node.js WhatsApp microservice',
    badge: 'Popular',
    badgeColor: 'bg-purple-500/10 text-purple-600',
  },
  {
    type: 'META_CLOUD',
    title: 'Meta WhatsApp Cloud API',
    description: 'Official Meta Graph API Business Platform',
    badge: 'Official',
    badgeColor: 'bg-blue-500/10 text-blue-600',
  },
  {
    type: 'TWILIO',
    title: 'Twilio WhatsApp',
    description: 'Enterprise Twilio Programmable Messaging API',
    badge: 'Enterprise',
    badgeColor: 'bg-red-500/10 text-red-600',
  },
  {
    type: 'BAILEYS',
    title: 'Baileys Microservice',
    description: 'Direct WebSocket library connection with low memory footprint',
    badge: 'Fast',
    badgeColor: 'bg-amber-500/10 text-amber-600',
  },
  {
    type: 'CUSTOM',
    title: 'Custom REST API',
    description: 'Connect any custom webhook or HTTP gateway endpoint',
    badge: 'Flexible',
    badgeColor: 'bg-slate-500/10 text-slate-600',
  },
];

export function AddConnectionModal({
  isOpen,
  onClose,
  onAddConnection,
}: AddConnectionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [providerType, setProviderType] = useState<ProviderType>('WAHA');
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('https://waha.grow-twilio.internal');
  const [apiKey, setApiKey] = useState('');
  const [sessionName, setSessionName] = useState('default');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddConnection({
      name: name || `${providerType} Connection`,
      providerType,
      serverUrl,
      sessionName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add WhatsApp Provider Connection
            </h3>
            <p className="text-xs text-slate-500">
              Step {step} of 2: {step === 1 ? 'Choose Provider Engine' : 'Configure Credentials'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Choose Provider */}
        {step === 1 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROVIDERS.map((p) => (
                <div
                  key={p.type}
                  onClick={() => setProviderType(p.type)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    providerType === p.type
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                    {providerType === p.type && <Check className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">{p.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-normal">{p.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                Configure Connection <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Configure Parameters */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
            <div>
              <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                Connection Display Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Primary WAHA Cluster"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                Server Base URL / Endpoint
              </label>
              <input
                type="text"
                required
                placeholder="https://waha.yourdomain.com"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                API Key / Auth Token
              </label>
              <input
                type="password"
                placeholder="Secret API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                Session ID / Instance Name
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Zap className="h-3.5 w-3.5" /> Connect Provider
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
