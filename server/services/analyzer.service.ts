import {
  RISK_RULES,
  SENSITIVE_PARAM_NAMES,
  SUSPICIOUS_KEYWORD_LIST,
  CATEGORY_THRESHOLDS,
  RiskRuleConfig,
} from '../config/rules.config.ts';

export interface IndicatorResult {
  indicatorId: string;
  name: string;
  triggered: boolean;
  explanation: string;
  scoreContribution: number;
}

export type RiskCategory = 'Low' | 'Medium' | 'High';

export interface AnalysisResult {
  originalInput: string;
  sanitizedUrl: string;
  hostname: string;
  protocol: string;
  port: string | null;
  pathname: string;
  riskScore: number;
  riskCategory: RiskCategory;
  indicators: IndicatorResult[];
  recommendations: string[];
  analyzedAt: string;
}

/**
 * Redacts sensitive query parameters, user credentials, and strips fragments
 */
export function sanitizeAndRedactUrl(rawUrl: string): { sanitizedUrl: string; parsed: URL } {
  const trimmed = rawUrl.trim();
  const parsed = new URL(trimmed);

  // Redact credentials if present in userinfo
  if (parsed.username || parsed.password) {
    parsed.username = 'REDACTED';
    parsed.password = '';
  }

  // Strip fragment
  parsed.hash = '';

  // Redact sensitive query parameters
  const params = parsed.searchParams;
  const keysToRedact: string[] = [];

  params.forEach((_, key) => {
    const lowerKey = key.toLowerCase();
    const isSensitive = Array.from(SENSITIVE_PARAM_NAMES).some(
      (s) => lowerKey === s || lowerKey.includes(s)
    );
    if (isSensitive) {
      keysToRedact.push(key);
    }
  });

  for (const key of keysToRedact) {
    params.set(key, '[REDACTED]');
  }

  return {
    sanitizedUrl: parsed.toString(),
    parsed,
  };
}

/**
 * Validates and normalizes URL format
 */
export function validateUrl(rawUrl: string): { valid: boolean; error?: string; url?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum allowable length of 2048 characters' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Only standard HTTP and HTTPS protocols are accepted (e.g., https://example.com)',
      };
    }
    if (!parsed.hostname) {
      return { valid: false, error: 'URL does not contain a valid hostname' };
    }
    return { valid: true, url: trimmed };
  } catch (err: any) {
    return {
      valid: false,
      error: 'Invalid URL format. Please ensure you include the protocol (http:// or https://)',
    };
  }
}

/**
 * Determines whether hostname is an IPv4 or IPv6 address
 */
export function isIpAddress(hostname: string): boolean {
  // IPv4 regex pattern
  const ipv4Regex =
    /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
  // IPv6 format (inside brackets or raw)
  const cleanHost = hostname.replace(/^\[|\]$/g, '');
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^([0-9a-fA-F]{1,4}:)+[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(cleanHost) || ipv6Regex.test(cleanHost);
}

/**
 * Counts subdomain levels excluding top-level domain and common public suffixes
 */
export function countSubdomains(hostname: string): number {
  if (isIpAddress(hostname)) return 0;
  const parts = hostname.toLowerCase().split('.').filter(Boolean);
  // Example: a.b.c.example.com -> parts = ['a', 'b', 'c', 'example', 'com'] -> 5 parts
  // Standard root: domain.tld (2 parts). If ccTLD like co.uk (3 parts).
  const isCcTld = parts.length >= 3 && ['co.uk', 'com.au', 'co.in', 'org.uk', 'edu.in'].includes(`${parts[parts.length - 2]}.${parts[parts.length - 1]}`);
  const baseCount = isCcTld ? 3 : 2;
  const subdomainCount = Math.max(0, parts.length - baseCount);
  return subdomainCount;
}

/**
 * Purely static deterministic URL risk analyzer
 * NOTE: Never makes outbound network calls or requests to destination servers!
 */
export function analyzeUrlRisk(rawUrl: string): AnalysisResult {
  const { valid, error, url } = validateUrl(rawUrl);
  if (!valid || !url) {
    throw new Error(error || 'Invalid URL supplied');
  }

  const { sanitizedUrl, parsed } = sanitizeAndRedactUrl(url);
  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();
  const port = parsed.port || null;
  const pathname = parsed.pathname;
  const search = parsed.search;
  const fullRaw = rawUrl.trim();

  const indicators: IndicatorResult[] = [];
  let totalScore = 0;

  // 1. HTTP instead of HTTPS
  const isHttp = protocol === 'http:';
  const httpRule = RISK_RULES.HTTP_INSECURE;
  indicators.push({
    indicatorId: httpRule.id,
    name: httpRule.name,
    triggered: isHttp,
    scoreContribution: isHttp ? httpRule.weight : 0,
    explanation: isHttp
      ? 'The URL uses unencrypted HTTP protocol. All login credentials and traffic can be intercepted.'
      : 'URL employs modern TLS/HTTPS encryption.',
  });
  if (isHttp) totalScore += httpRule.weight;

  // 2. IP-Address-Based Hostnames
  const hasIpHost = isIpAddress(hostname);
  const ipRule = RISK_RULES.IP_ADDRESS_HOST;
  indicators.push({
    indicatorId: ipRule.id,
    name: ipRule.name,
    triggered: hasIpHost,
    scoreContribution: hasIpHost ? ipRule.weight : 0,
    explanation: hasIpHost
      ? `Host is an explicit IP address (${hostname}) instead of a trusted domain name.`
      : 'Standard registered domain name utilized.',
  });
  if (hasIpHost) totalScore += ipRule.weight;

  // 3. Punycode / Homograph domain
  const isPunycode = hostname.includes('xn--');
  const punyRule = RISK_RULES.PUNYCODE_DOMAIN;
  indicators.push({
    indicatorId: punyRule.id,
    name: punyRule.name,
    triggered: isPunycode,
    scoreContribution: isPunycode ? punyRule.weight : 0,
    explanation: isPunycode
      ? 'Punycode prefix (xn--) detected. Attackers frequently use international character spoofing to mimic known brands.'
      : 'Standard ASCII domain encoding without Punycode spoofing.',
  });
  if (isPunycode) totalScore += punyRule.weight;

  // 4. Suspicious '@' symbol
  // Inspect the raw input for '@' before host or within URL
  const hasAtSymbol = fullRaw.includes('@');
  const atRule = RISK_RULES.SUSPICIOUS_AT_SYMBOL;
  indicators.push({
    indicatorId: atRule.id,
    name: atRule.name,
    triggered: hasAtSymbol,
    scoreContribution: hasAtSymbol ? atRule.weight : 0,
    explanation: hasAtSymbol
      ? 'Suspicious "@" symbol detected in URL structure. In browser URL parsing, this can silently discard preceding text to spoof users.'
      : 'No misleading "@" userinfo separator found.',
  });
  if (hasAtSymbol) totalScore += atRule.weight;

  // 5. Suspicious keywords (login, verify, account, update, etc.)
  const combinedPathAndHost = `${hostname}${pathname}${search}`.toLowerCase();
  const matchedKeywords = SUSPICIOUS_KEYWORD_LIST.filter((kw) =>
    combinedPathAndHost.includes(kw)
  );
  const hasKeywords = matchedKeywords.length > 0;
  const kwRule = RISK_RULES.SUSPICIOUS_KEYWORDS;
  indicators.push({
    indicatorId: kwRule.id,
    name: kwRule.name,
    triggered: hasKeywords,
    scoreContribution: hasKeywords ? kwRule.weight : 0,
    explanation: hasKeywords
      ? `High-risk authentication keywords found: [${matchedKeywords.slice(0, 4).join(', ')}]. Frequently used in credential traps.`
      : 'No high-risk credential-harvesting keywords identified.',
  });
  if (hasKeywords) totalScore += kwRule.weight;

  // 6. Excessive Subdomains (>= 3 subdomains)
  const subdomains = countSubdomains(hostname);
  const hasExcessiveSubs = subdomains >= 3;
  const subRule = RISK_RULES.EXCESSIVE_SUBDOMAINS;
  indicators.push({
    indicatorId: subRule.id,
    name: subRule.name,
    triggered: hasExcessiveSubs,
    scoreContribution: hasExcessiveSubs ? subRule.weight : 0,
    explanation: hasExcessiveSubs
      ? `Excessive subdomain nesting (${subdomains} levels). Attackers stack subdomains to disguise fraudulent host origins.`
      : `Subdomain level is within safe normal thresholds (${subdomains} levels).`,
  });
  if (hasExcessiveSubs) totalScore += subRule.weight;

  // 7. Unusual Ports
  const hasUnusualPort = Boolean(port && port !== '80' && port !== '443');
  const portRule = RISK_RULES.UNUSUAL_PORT;
  indicators.push({
    indicatorId: portRule.id,
    name: portRule.name,
    triggered: hasUnusualPort,
    scoreContribution: hasUnusualPort ? portRule.weight : 0,
    explanation: hasUnusualPort
      ? `Non-standard web service port :${port} detected. Known to host unauthorized services or circumvent security firewalls.`
      : 'Standard default HTTP/HTTPS web port used.',
  });
  if (hasUnusualPort) totalScore += portRule.weight;

  // 8. Unusually Long URLs (> 75 characters)
  const isLong = fullRaw.length > 75;
  const lenRule = RISK_RULES.UNUSUAL_LENGTH;
  indicators.push({
    indicatorId: lenRule.id,
    name: lenRule.name,
    triggered: isLong,
    scoreContribution: isLong ? lenRule.weight : 0,
    explanation: isLong
      ? `URL length (${fullRaw.length} chars) exceeds the 75-character threshold, a typical trait of URL redirection chains and parameter cloaking.`
      : `URL length is standard (${fullRaw.length} characters).`,
  });
  if (isLong) totalScore += lenRule.weight;

  // 9. Encoded or heavily percent-encoded characters
  // Match percent encoding sequences e.g. %20, %2e, %2f, etc.
  const percentMatches = fullRaw.match(/%[0-9a-fA-F]{2}/g) || [];
  const hasHeavyEncoding = percentMatches.length >= 3 || /%(?:25|2e|2f|5c|3a)/i.test(fullRaw);
  const encRule = RISK_RULES.ENCODED_EVASION;
  indicators.push({
    indicatorId: encRule.id,
    name: encRule.name,
    triggered: hasHeavyEncoding,
    scoreContribution: hasHeavyEncoding ? encRule.weight : 0,
    explanation: hasHeavyEncoding
      ? `Detected ${percentMatches.length} percent-encoded tokens and/or evasion characters (%2e, %2f), indicating potential filter evasion.`
      : 'No suspicious percent-encoding or obfuscation detected.',
  });
  if (hasHeavyEncoding) totalScore += encRule.weight;

  // Cap total score at 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Risk Category
  let riskCategory: RiskCategory = 'Low';
  if (finalScore >= CATEGORY_THRESHOLDS.HIGH_MIN) {
    riskCategory = 'High';
  } else if (finalScore > CATEGORY_THRESHOLDS.LOW_MAX) {
    riskCategory = 'Medium';
  }

  // Recommendations
  const recommendations: string[] = [];
  if (riskCategory === 'High') {
    recommendations.push('Do NOT visit this link or enter any login credentials, passwords, or personal details.');
    recommendations.push('Close the browser tab immediately and report this link to your organization security team.');
    recommendations.push('If you received this in an email or SMS, mark it as phishing and do not respond.');
  } else if (riskCategory === 'Medium') {
    recommendations.push('Exercise caution. Inspect the domain carefully in the browser address bar before interacting.');
    recommendations.push('Verify the identity of the sender through a known, independent contact channel.');
    recommendations.push('Ensure a valid SSL padlock is active and that the site does not prompt for unexpected downloads.');
  } else {
    recommendations.push('No obvious heuristic red flags detected. Maintain standard web hygiene.');
    recommendations.push('Always confirm the official domain name in the browser address bar when entering credentials.');
  }

  if (isHttp) {
    recommendations.push('Never input credit cards or sensitive credentials over unencrypted HTTP connections.');
  }
  if (hasIpHost || hasAtSymbol) {
    recommendations.push('Legitimate banking and consumer platforms virtually never use direct IP addresses or "@" syntax.');
  }

  return {
    originalInput: fullRaw,
    sanitizedUrl,
    hostname,
    protocol,
    port,
    pathname,
    riskScore: finalScore,
    riskCategory,
    indicators,
    recommendations,
    analyzedAt: new Date().toISOString(),
  };
}
