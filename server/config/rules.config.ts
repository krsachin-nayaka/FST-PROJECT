export interface RiskRuleConfig {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export const RISK_RULES: Record<string, RiskRuleConfig> = {
  HTTP_INSECURE: {
    id: 'HTTP_INSECURE',
    name: 'Unencrypted HTTP Transport',
    weight: 25,
    description: 'The URL uses unencrypted HTTP instead of HTTPS, exposing credentials and network traffic to interception or eavesdropping.',
  },
  IP_ADDRESS_HOST: {
    id: 'IP_ADDRESS_HOST',
    name: 'Raw IP Address Hostname',
    weight: 35,
    description: 'The destination host is a direct numerical IP address rather than a registered domain name, a hallmark of rogue phishing kits and malware droppers.',
  },
  PUNYCODE_DOMAIN: {
    id: 'PUNYCODE_DOMAIN',
    name: 'Punycode / Homograph Domain',
    weight: 25,
    description: 'Internationalized domain name (Punycode xn--) detected. Frequently used in homograph attacks to impersonate legitimate brand domains.',
  },
  SUSPICIOUS_AT_SYMBOL: {
    id: 'SUSPICIOUS_AT_SYMBOL',
    name: 'Embedded Userinfo / @ Symbol',
    weight: 25,
    description: 'The @ character in URLs causes standard parsers to disregard preceding authority text, routing visitors to an unexpected subsequent host.',
  },
  SUSPICIOUS_KEYWORDS: {
    id: 'SUSPICIOUS_KEYWORDS',
    name: 'High-Risk Security Keywords',
    weight: 20,
    description: 'Contains high-priority authentication or urgency terms (e.g., login, verify, secure, account, update) often leveraged to harvest credentials.',
  },
  EXCESSIVE_SUBDOMAINS: {
    id: 'EXCESSIVE_SUBDOMAINS',
    name: 'Excessive Subdomain Stacking',
    weight: 20,
    description: 'Contains 3 or more subdomain prefixes, a tactic widely used to prepend trusted brand names onto unauthorized root domains.',
  },
  UNUSUAL_PORT: {
    id: 'UNUSUAL_PORT',
    name: 'Non-Standard Service Port',
    weight: 20,
    description: 'Targets a non-standard web port (outside 80/443), frequently associated with ad-hoc phishing tools or bypassed perimeter proxies.',
  },
  UNUSUAL_LENGTH: {
    id: 'UNUSUAL_LENGTH',
    name: 'Suspicious URL Length',
    weight: 15,
    description: 'URL length significantly exceeds typical norms (> 75 characters), commonly used to conceal target parameters or embed encoded payloads.',
  },
  ENCODED_EVASION: {
    id: 'ENCODED_EVASION',
    name: 'Heavy Percent-Encoding / Obfuscation',
    weight: 15,
    description: 'Multiple percent-encoded characters or hex sequences detected, suggesting intentional obfuscation to bypass static inspection filters.',
  },
};

export const SENSITIVE_PARAM_NAMES = new Set([
  'token',
  'access_token',
  'auth',
  'authorization',
  'key',
  'apikey',
  'api_key',
  'password',
  'pwd',
  'pass',
  'secret',
  'session',
  'sessionid',
  'code',
  'otp',
  'pin',
  'jwt',
  'credential',
  'sig',
  'signature',
]);

export const SUSPICIOUS_KEYWORD_LIST = [
  'login',
  'signin',
  'verify',
  'verification',
  'account',
  'update',
  'security',
  'secure',
  'banking',
  'password',
  'wallet',
  'confirm',
  'authenticate',
  'recovery',
  'recover',
  'billing',
  'invoice',
  'support-desk',
  'kyc',
  'validate',
];

export const CATEGORY_THRESHOLDS = {
  LOW_MAX: 29,
  MEDIUM_MAX: 59,
  HIGH_MIN: 60,
};
