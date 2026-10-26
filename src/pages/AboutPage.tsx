import React from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Layers,
  Code2,
  Database,
  Lock,
  Cpu,
  CheckCircle2,
  FileText,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const heuristics = [
    {
      id: 'HTTP_INSECURE',
      name: 'Unencrypted HTTP Transport',
      weight: 25,
      impact: 'Plaintext transit vulnerable to interception & MitM',
    },
    {
      id: 'IP_ADDRESS_HOST',
      name: 'Raw IP Address Hostname',
      weight: 35,
      impact: 'Direct numeric host bypassing DNS reputation records',
    },
    {
      id: 'PUNYCODE_DOMAIN',
      name: 'Punycode / Homograph (xn--)',
      weight: 25,
      impact: 'Lookalike character spoofing to mimic familiar domains',
    },
    {
      id: 'SUSPICIOUS_AT_SYMBOL',
      name: 'Embedded Userinfo / @ Symbol',
      weight: 25,
      impact: 'Discards prefix authority string to redirect victim',
    },
    {
      id: 'SUSPICIOUS_KEYWORDS',
      name: 'High-Risk Security Keywords',
      weight: 20,
      impact: 'Triggers on login, verify, secure, account, update, banking',
    },
    {
      id: 'EXCESSIVE_SUBDOMAINS',
      name: 'Excessive Subdomain Stacking',
      weight: 20,
      impact: 'Prepends trusted names before an unauthorized root domain',
    },
    {
      id: 'UNUSUAL_PORT',
      name: 'Non-Standard Web Port',
      weight: 20,
      impact: 'Targets port outside 80/443 to bypass firewalls',
    },
    {
      id: 'UNUSUAL_LENGTH',
      name: 'Suspicious URL Length (>75 chars)',
      weight: 15,
      impact: 'Obfuscates true query parameters and target tokens',
    },
    {
      id: 'ENCODED_EVASION',
      name: 'Heavy Percent-Encoding / Evasion',
      weight: 15,
      impact: 'Hex tokens (%2e, %2f, %20) crafted to evade WAFs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Profile Spotlight Card */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-xl shadow-teal-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-semibold">
                Academic Project Submission
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                K R SACHIN
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs">
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 font-mono border border-teal-500/40 font-bold">
                  USN: 1NH23CS106
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Course: Full Stack Technologies
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1 max-w-xs self-stretch md:self-auto">
            <p className="font-semibold text-white">Project Identity</p>
            <p className="text-slate-400">
              PhishGuard — Intelligent URL Risk Analyzer and Phishing Awareness Dashboard
            </p>
            <p className="font-mono text-teal-400 text-[11px] pt-1">
              Version: 1.0.0 (Production)
            </p>
          </div>
        </div>
      </div>

      {/* Project Mission & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-teal-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-semibold text-white">Project Objectives</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            PhishGuard was engineered to bridge the gap between complex perimeter threat intelligence
            and everyday internet user awareness. By deconstructing submitted links through
            deterministic, explainable heuristics, users gain immediate visibility into deceptive
            patterns rather than relying on opaque black-box scores.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Real-time static URL heuristic risk evaluation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Privacy-conscious storage with sensitive token redaction</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Safe inspection without making external target server calls</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-base font-semibold text-white">Architectural Overview</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            PhishGuard follows a strict separation of concerns with a single unified full-stack server
            serving both the REST APIs and the compiled Vite React frontend on port 3000.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-teal-400 block font-bold">Frontend SPA</span>
              <span className="text-slate-400 text-[11px]">React 19 + Tailwind CSS + Recharts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 block font-bold">Backend Engine</span>
              <span className="text-slate-400 text-[11px]">Express + Zod + Helmet + Mongoose</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Layers className="w-5 h-5 text-teal-400" />
          <h3 className="text-base font-semibold text-white">Comprehensive Technology Stack</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Frontend */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-teal-300 block text-sm">Frontend Tier</span>
            <ul className="space-y-1 text-slate-300">
              <li>• React 19 (Component-driven)</li>
              <li>• Vite 6 build system</li>
              <li>• Tailwind CSS (v4 styling)</li>
              <li>• Recharts interactive data visualizer</li>
              <li>• Lucide React security iconography</li>
              <li>• Axios centralized REST client</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 block text-sm">Backend Tier</span>
            <ul className="space-y-1 text-slate-300">
              <li>• Node.js v22 (ES Modules)</li>
              <li>• Express.js 4 application router</li>
              <li>• Zod schema validation</li>
              <li>• Centralized error handler</li>
              <li>• RESTful resource controllers</li>
              <li>• Google Safe Browsing v4 client</li>
            </ul>
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 block text-sm">Persistence Tier</span>
            <ul className="space-y-1 text-slate-300">
              <li>• MongoDB with Mongoose schema</li>
              <li>• Strict indexing (hostname, date, risk)</li>
              <li>• Embedded disk-backed fallback engine</li>
              <li>• Zero-downtime persistence guarantees</li>
              <li>• Aggregation pipeline queries</li>
              <li>• Sanitized credential storage</li>
            </ul>
          </div>

          {/* Security & Testing */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-300 block text-sm">Security & QA</span>
            <ul className="space-y-1 text-slate-300">
              <li>• Helmet HTTP security headers</li>
              <li>• Express-rate-limit protection</li>
              <li>• No target network fetches (safe sandbox)</li>
              <li>• Vitest automated testing suite</li>
              <li>• Supertest REST API integration tests</li>
              <li>• 23 automated tests (100% pass)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Heuristics Scoring Methodology */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-4">
        <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Deterministic 9-Rule Risk Scoring Methodology
            </h3>
            <p className="text-xs text-slate-400">
              Score ranges: Low Risk (0–29), Medium Risk (30–59), High Risk (60–100), Capped at 100.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-teal-300 border border-slate-700">
            Rules Config Module
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rule Identifier</th>
                <th className="py-2.5 px-3">Heuristic Name</th>
                <th className="py-2.5 px-3 font-mono">Weight</th>
                <th className="py-2.5 px-3">Cyber Threat Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {heuristics.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-teal-400">{h.id}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">{h.name}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">+{h.weight} pts</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{h.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ethical Safety Notice & Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs">
          <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>Ethical Sandbox Guarantee</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            PhishGuard adheres strictly to safe cybersecurity evaluation principles. Under no
            circumstances does the backend resolve DNS, initiate HTTP/TCP requests, follow redirects,
            or load assets from submitted URLs. All evaluations are performed statically upon the URL
            string syntax, safeguarding server environments from malicious callbacks.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs">
          <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Future Roadmap & Improvements</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            Planned future enhancements include WHOIS domain registration age analysis (&lt;30 days
            old threshold), passive DNS reputation lookup via VirusTotal API integration, TLS
            certificate transparency log auditing, and fine-tuned Transformer-based NLP character
            embedding classification.
          </p>
        </div>
      </div>
    </div>
  );
};
