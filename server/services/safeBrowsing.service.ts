import { env } from '../config/env.ts';

export type SafeBrowsingStatus =
  | 'NOT_CONFIGURED'
  | 'NO_THREAT_FOUND'
  | 'THREAT_DETECTED'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT';

export interface SafeBrowsingResult {
  status: SafeBrowsingStatus;
  threatDetails?: string[];
  checkedAt: string;
}

export async function checkGoogleSafeBrowsing(urlToCheck: string): Promise<SafeBrowsingResult> {
  const apiKey = env.GOOGLE_SAFE_BROWSING_API_KEY;
  const checkedAt = new Date().toISOString();

  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 'NOT_CONFIGURED',
      checkedAt,
    };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

  try {
    const payload = {
      client: {
        clientId: 'phishguard-risk-analyzer',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url: urlToCheck }],
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Safe Browsing API returned non-OK status: ${res.status}`);
      return {
        status: 'PROVIDER_ERROR',
        threatDetails: [`HTTP error ${res.status}`],
        checkedAt,
      };
    }

    const data: any = await res.json();
    if (data && data.matches && data.matches.length > 0) {
      const threats = data.matches.map(
        (m: any) => `${m.threatType} on ${m.platformType || 'ALL_PLATFORMS'}`
      );
      return {
        status: 'THREAT_DETECTED',
        threatDetails: threats,
        checkedAt,
      };
    }

    return {
      status: 'NO_THREAT_FOUND',
      checkedAt,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        status: 'TIMEOUT',
        threatDetails: ['Safe Browsing lookup exceeded request timeout'],
        checkedAt,
      };
    }
    return {
      status: 'PROVIDER_ERROR',
      threatDetails: [err.message || 'Network error querying Safe Browsing'],
      checkedAt,
    };
  }
}
