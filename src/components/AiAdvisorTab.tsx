import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingDown,
  DollarSign,
  Leaf,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AIAuditResponse } from '../types';

interface AiAdvisorTabProps {
  auditData: AIAuditResponse | null;
  loadingAudit: boolean;
  onRefreshAudit: () => void;
  onSendMessage: (msg: string) => Promise<string>;
}

export const AiAdvisorTab: React.FC<AiAdvisorTabProps> = ({
  auditData,
  loadingAudit,
  onRefreshAudit,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello, Administrator! I am your Smart Campus Energy & Facility Copilot powered by Gemini. I monitor electricity meters, water risers, room occupancy, and weather forecasts in real time. How can I assist with campus efficiency, peak demand shaving, or resource allocation today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputMessage;
    if (!q.trim() || isSending) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setInputMessage('');
    setIsSending(true);

    try {
      const reply = await onSendMessage(q);
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an error connecting to the campus AI service.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    'How can we reduce peak electricity charges during afternoon hours?',
    'What are the primary causes of water loss in the hostels?',
    'Suggest a classroom consolidation plan for Friday afternoons.',
    'What is our projected ROI for adding 250 kW more rooftop solar?',
  ];

  return (
    <div id="ai-advisor-tab-content" className="space-y-6">
      {/* Top Banner with Audit Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                AI Energy & Resource Conservation Measures (ECMs)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Gemini 3.8 Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data-grounded recommendations to help campus facilities managers achieve decarbonization and cost reductions
            </p>
          </div>

          <button
            id="btn-refresh-ai-audit"
            onClick={onRefreshAudit}
            disabled={loadingAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
            <span>{loadingAudit ? 'Auditing Campus...' : 'Re-run Campus Audit'}</span>
          </button>
        </div>

        {/* Audit Metrics */}
        {auditData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium">Campus Sustainability Index</span>
              <p className="text-2xl font-bold text-emerald-900 mt-0.5">
                {auditData.sustainabilityScore} / 100
              </p>
              <span className="text-[11px] text-emerald-700">Top 10% University Benchmark</span>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs text-indigo-800 font-medium">Projected Monthly Savings</span>
              <p className="text-2xl font-bold text-indigo-900 mt-0.5">
                ${auditData.projectedMonthlySavingsUsd.toLocaleString()}
              </p>
              <span className="text-[11px] text-indigo-700">Via Automated Setbacks & Load Shifting</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">Active Policy Interventions</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {auditData.recommendations.length} Action Items
              </p>
              <span className="text-[11px] text-slate-500">Ranked by Payback Velocity</span>
            </div>
          </div>
        )}

        {auditData?.summary && (
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Executive Summary:</span>
            {auditData.summary}
          </div>
        )}
      </div>

      {/* Recommendations Cards Grid */}
      {auditData?.recommendations && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            Prioritized Energy Conservation Measures (ECMs)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditData.recommendations.map((rec) => {
              const priorityBadge =
                rec.priority === 'Immediate'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : rec.priority === 'High'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-indigo-100 text-indigo-800 border-indigo-200';

              return (
                <div
                  key={rec.id}
                  id={`rec-card-${rec.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${priorityBadge}`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{rec.targetZone}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-2">{rec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-1.5 rounded bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Annual Savings</span>
                      <span className="font-bold text-emerald-700 text-xs">
                        ${rec.annualCostSavingsUsd.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-1.5 rounded bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Energy Offset</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {rec.annualKwhSavings.toLocaleString()} kWh
                      </span>
                    </div>

                    <div className="p-1.5 rounded bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Payback</span>
                      <span className="font-bold text-indigo-700 text-xs">
                        {rec.paybackMonths === 0 ? 'Immediate' : `${rec.paybackMonths} Months`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Facility Copilot Chat */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Campus Facility Copilot
            </h3>
            <p className="text-xs text-slate-500">
              Ask questions about campus electricity demand, water leaks, or timetable consolidation
            </p>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              id={`chip-prompt-${i}`}
              onClick={() => handleSend(prompt)}
              className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>

        {/* Messages Log */}
        <div className="space-y-3 max-h-80 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-slate-500 text-xs pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Gemini is reasoning over campus telemetry...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            id="input-copilot-query"
            type="text"
            placeholder="Ask a question about campus energy, water, or facilities..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <button
            id="btn-send-copilot"
            onClick={() => handleSend()}
            disabled={isSending || !inputMessage.trim()}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
