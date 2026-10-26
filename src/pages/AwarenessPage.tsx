import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Globe,
  Mail,
  Smartphone,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { QuizQuestion } from '../types/index.ts';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      'You receive an urgent SMS stating your primary bank account is suspended due to unusual activity. The SMS includes the link below. What is your safest immediate response?',
    urlExample: 'http://192.168.1.45/bank-security-verification/login.php',
    options: [
      'Click the link promptly to unlock your account before you are charged a penalty fee.',
      'Open the link but only enter your username, avoiding your password.',
      'Do not click the link. It uses an insecure IP address and unencrypted HTTP; contact your bank via their verified phone number.',
      'Forward the message to friends to see if they received the same alert.',
    ],
    correctIndex: 2,
    explanation:
      'Legitimate financial institutions never distribute emergency security links pointing to raw IP addresses over unencrypted HTTP. Direct IP destinations are hallmarks of temporary phishing kits.',
    category: 'Urgency',
  },
  {
    id: 2,
    scenario:
      'You are redirected to a webpage displaying a valid SSL/TLS padlock in the browser address bar with the domain shown below. Can you trust this site with your credentials?',
    urlExample: 'https://paypal.com.verify-account-security.biz/signin',
    options: [
      'Yes, because the padlock proves the website is verified, authentic, and safe.',
      'No. An SSL certificate only encrypts transport; attackers freely obtain free certificates for phishing domains with stacked subdomains.',
      'Yes, because "paypal.com" appears at the beginning of the domain.',
      'Yes, as long as your antivirus does not show a popup.',
    ],
    correctIndex: 1,
    explanation:
      'HTTPS encrypts the connection between your browser and the remote server—it does NOT verify the legitimacy or intentions of the website owner. Phishers use stacked subdomains to make URLs look official.',
    category: 'HTTPS',
  },
  {
    id: 3,
    scenario:
      'An email from "IT Support" prompts you to update your corporate password at the link below. What technique is being employed?',
    urlExample: 'https://xn--pple-43d.com/support/idmsa/auth',
    options: [
      'Zero-day browser vulnerability exploit.',
      'Internationalized Domain Name (IDN) homograph attack using Punycode to mimic "apple.com".',
      'Standard DNS cache poisoning.',
      'Buffer overflow attack.',
    ],
    correctIndex: 1,
    explanation:
      'The "xn--" prefix indicates Punycode, which decodes to lookalike Unicode characters (such as Cyrillic "а"). Attackers register these visually indistinguishable domains to fool unsuspecting targets.',
    category: 'Homograph',
  },
  {
    id: 4,
    scenario:
      'You receive a link formatted as below. What happens when you open this URL in a modern web browser?',
    urlExample: 'https://google.com@evil-credential-harvester.net/oauth/callback',
    options: [
      'The browser securely connects to google.com and asks evil-credential-harvester.net for authorization.',
      'The browser treats "google.com" as userinfo credentials, ignores it, and connects directly to "evil-credential-harvester.net".',
      'The browser opens both sites in split-screen mode.',
      'The browser automatically blocks the link due to invalid syntax.',
    ],
    correctIndex: 1,
    explanation:
      'In URL specifications, everything before the "@" symbol represents optional userinfo (e.g. username:password). Browsers discard this text and route the user to the host appearing after the "@".',
    category: 'Credential Harvesting',
  },
  {
    id: 5,
    scenario:
      'A delivery notification asks you to pay a $1.50 customs fee via a shortened link like "bit.ly/3XYZk9". What is the best cybersecurity precaution before clicking?',
    urlExample: 'https://bit.ly/3kX9pL2 -> ???',
    options: [
      'Shortened links are always safe because URL shortening services verify destinations.',
      'Use a URL unshortener or inspection tool to expand and verify the true destination URL before visiting.',
      'Click it quickly on mobile since mobile phones are immune to web phishing.',
      'Disable JavaScript and open the link in incognito mode.',
    ],
    correctIndex: 1,
    explanation:
      'URL shorteners are routinely leveraged by threat actors to disguise malicious hostnames and evade basic email spam scanners. Always expand or inspect short links with an analyzer prior to browsing.',
    category: 'Social Engineering',
  },
  {
    id: 6,
    scenario:
      'What is "Spear Phishing" and how does it differ from traditional bulk phishing campaigns?',
    options: [
      'Phishing directed exclusively through Bluetooth connections.',
      'A targeted attack tailored to a specific individual or organization using researched personal or professional details.',
      'Phishing that relies exclusively on automated email malware attachments.',
      'An attack aimed only at government infrastructure routers.',
    ],
    correctIndex: 1,
    explanation:
      'Spear phishing involves targeted reconnaissance on the victim (e.g., job role, colleagues, projects) to craft a highly convincing, personalized message, making it vastly more dangerous than generic spam.',
    category: 'Social Engineering',
  },
  {
    id: 7,
    scenario:
      'An attacker creates a cloned page of your email provider and asks for your username, password, and the 6-digit OTP code sent to your phone. If you provide them, what happens?',
    options: [
      'The attacker cannot log in because OTP codes can only be used on the original device.',
      'The attacker intercepts your credentials and OTP in real-time, instantly logging into your real account (Adversary-in-the-Middle).',
      'The browser flags the page and cancels the transaction automatically.',
      'The OTP code expires before the attacker can see it.',
    ],
    correctIndex: 1,
    explanation:
      'Adversary-in-the-Middle (AiTM) phishing proxies your login session live to the legitimate provider, intercepting both credentials and one-time MFA tokens to establish an authenticated session.',
    category: 'Credential Harvesting',
  },
  {
    id: 8,
    scenario:
      'If you encounter a confirmed malicious phishing website in the wild, which official channel should you report it to?',
    options: [
      'Post the link on social media to warn others.',
      'Report it to Google Safe Browsing, the Anti-Phishing Working Group (APWG), and CISA/US-CERT.',
      'Email the administrator of the phishing site asking them to take it down.',
      'Do nothing; modern browsers automatically detect all phishing within seconds.',
    ],
    correctIndex: 1,
    explanation:
      'Reporting to centralized defense organizations like Google Safe Browsing (safebrowsing.google.com), APWG (reportphishing@apwg.org), and US-CERT enables automated browser protection for millions of global internet users.',
    category: 'Social Engineering',
  },
];

export const AwarenessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'quiz'>('guide');

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleSelectOption = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const score = calculateScore();
  const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Phishing Awareness & Defense Guide
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Master the anatomy of deceptive links, social engineering mechanisms, and test your skills.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Guide
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Phishing IQ Quiz</span>
          </button>
        </div>
      </div>

      {activeTab === 'guide' ? (
        <div className="space-y-6">
          {/* Key Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module 1: HTTPS Fallacy */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-teal-400">
                <Lock className="w-5 h-5" />
                <h3 className="text-base font-semibold text-white">
                  1. The "HTTPS Padlock" Fallacy
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A common misconception is that the green or locked padlock means a website is safe.
                In reality, <strong>HTTPS only guarantees encryption in transit</strong>. It ensures
                that eavesdroppers on public Wi-Fi cannot see your traffic, but it does not evaluate
                whether the server owner is an identity thief. Today, over 80% of phishing websites
                operate with free, valid SSL certificates.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                https://chase-bank-verify-account.online/login
              </div>
              <p className="text-[11px] text-slate-500">
                Notice: Valid HTTPS certificate, but the root domain is unauthorized.
              </p>
            </div>

            {/* Module 2: Lookalike Domains & Homographs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-base font-semibold text-white">
                  2. Lookalike Domains & Punycode (IDN)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Attackers use Internationalized Domain Names (IDN) to execute homograph attacks.
                Characters from non-Latin scripts (like Cyrillic 'а', Greek 'ο', or Latin with accents)
                are substituted for standard ASCII letters. Browsers encode these as Punycode
                (beginning with <code className="text-teal-300">xn--</code>).
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                xn--pple-43d.com = аррle.com (Cyrillic 'а')
              </div>
              <p className="text-[11px] text-slate-500">
                PhishGuard flags all Punycode domains for immediate user inspection.
              </p>
            </div>

            {/* Module 3: Subdomain Stacking */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-semibold text-white">
                  3. Subdomain Stacking Tricks
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In URL syntax, the domain name is evaluated from right to left before the first single
                slash. Attackers place trusted brand names as prefix subdomains (e.g.
                <code className="text-amber-300">paypal.com.account-update.xyz</code>). Unwary users
                glance at the leftmost text and mistakenly believe they are on PayPal.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                https://<strong className="text-emerald-400">paypal.com</strong>.verify.<strong className="text-rose-400">attacker.net</strong>/auth
              </div>
              <p className="text-[11px] text-slate-500">
                Always read the text immediately preceding the top-level domain (.com, .org, etc.).
              </p>
            </div>

            {/* Module 4: Urgency & Social Engineering */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Mail className="w-5 h-5" />
                <h3 className="text-base font-semibold text-white">
                  4. Artificial Urgency & Fear Exploitation
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phishing messages rely on psychological triggers: panic, urgency, fear of financial loss,
                or excessive excitement. Common subject lines include "Account Suspended in 24 Hours",
                "Unauthorized Wire Transfer Detected", or "Immediate Tax Refund". Attackers want you to
                react emotionally before critical thinking can intervene.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300">
                "Your account has been locked. Click here within 15 minutes to avoid a $50 fee."
              </div>
              <p className="text-[11px] text-slate-500">
                Rule of thumb: Any message imposing an emergency deadline is suspicious.
              </p>
            </div>
          </div>

          {/* Incident Reporting & Best Practices */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Official Channels to Report Phishing Attacks</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When you identify a phishing attempt, reporting it helps global threat feeds block the
              attacker's infrastructure and protect unsuspecting users worldwide:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-teal-300 block mb-1">Google Safe Browsing</span>
                <p className="text-slate-400 text-[11px]">
                  Submit suspect URLs directly to Google's threat radar used by Chrome, Firefox, and Safari.
                </p>
                <span className="text-[10px] text-cyan-400 font-mono mt-2 block">
                  safebrowsing.google.com
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">CISA / US-CERT</span>
                <p className="text-slate-400 text-[11px]">
                  US Cybersecurity and Infrastructure Security Agency handles cyber incident reporting.
                </p>
                <span className="text-[10px] text-cyan-400 font-mono mt-2 block">
                  cisa.gov/report
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-amber-300 block mb-1">Anti-Phishing Working Group</span>
                <p className="text-slate-400 text-[11px]">
                  Global coalition fighting cybercrime. Forward fraudulent emails directly.
                </p>
                <span className="text-[10px] text-cyan-400 font-mono mt-2 block">
                  reportphishing@apwg.org
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Phishing IQ Quiz View */
        <div className="space-y-6">
          {!quizCompleted ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 shadow-xl space-y-5">
              {/* Question Progress Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-mono text-teal-400 font-semibold">
                  Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Topic: {currentQ.category}
                </span>
              </div>

              {/* Scenario */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                  {currentQ.scenario}
                </h3>
                {currentQ.urlExample && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                    {currentQ.urlExample}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (showExplanation) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-teal-950/40 border-teal-500 text-teal-200';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {showExplanation && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-semibold text-teal-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Cybersecurity Defense Takeaway</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {showExplanation && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 cursor-pointer"
                  >
                    {currentQuestionIndex < QUIZ_QUESTIONS.length - 1
                      ? 'Next Question'
                      : 'View Final Results'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed Results Card */
            <div className="rounded-2xl border border-teal-500/30 bg-slate-900/90 backdrop-blur-md p-8 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 mx-auto flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/20">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Quiz Evaluation Completed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Comprehensive Phishing Threat Assessment
                </p>
              </div>

              <div className="py-4">
                <div className="text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-white">
                  {score} / {QUIZ_QUESTIONS.length}
                </div>
                <p className="text-sm font-semibold text-teal-400 mt-2 font-mono">
                  {percentage}% Accuracy Rating
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {percentage >= 80 ? (
                  <p className="text-emerald-300 font-medium">
                    🛡️ <strong>Cyber Sentinel Grade:</strong> Excellent! You have strong instincts for detecting homographs, IP obfuscation, and artificial urgency tricks.
                  </p>
                ) : percentage >= 50 ? (
                  <p className="text-amber-300 font-medium">
                    ⚠️ <strong>Security Aware:</strong> Good baseline understanding, but watch out for stacked subdomains and SSL padlock misconceptions.
                  </p>
                ) : (
                  <p className="text-rose-300 font-medium">
                    🚨 <strong>Vulnerable to Traps:</strong> Review the Security Guide modules above to familiarize yourself with modern deception methods.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRetakeQuiz}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-teal-500/20"
                >
                  Review Study Guide
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
