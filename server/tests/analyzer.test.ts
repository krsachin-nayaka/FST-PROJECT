import { describe, it, expect } from 'vitest';
import {
  analyzeUrlRisk,
  validateUrl,
  sanitizeAndRedactUrl,
  isIpAddress,
  countSubdomains,
} from '../services/analyzer.service.ts';

describe('URL Risk Analyzer Heuristics', () => {
  it('validates URLs correctly', () => {
    expect(validateUrl('https://google.com').valid).toBe(true);
    expect(validateUrl('http://insecure-site.org').valid).toBe(true);
    expect(validateUrl('not-a-url').valid).toBe(false);
    expect(validateUrl('ftp://ftp.example.com').valid).toBe(false);
    expect(validateUrl('').valid).toBe(false);
  });

  it('redacts sensitive query parameters, userinfo credentials, and strips fragments', () => {
    const raw = 'https://admin:secret123@login.example.com/oauth?token=xyz987&apiKey=secret_key&redirect=home#dashboard';
    const { sanitizedUrl } = sanitizeAndRedactUrl(raw);

    expect(sanitizedUrl).not.toContain('secret123');
    expect(sanitizedUrl).not.toContain('xyz987');
    expect(sanitizedUrl).not.toContain('secret_key');
    expect(sanitizedUrl).not.toContain('#dashboard');
    expect(sanitizedUrl).toContain('token=%5BREDACTED%5D');
    expect(sanitizedUrl).toContain('apiKey=%5BREDACTED%5D');
  });

  it('detects IP address hostnames', () => {
    expect(isIpAddress('192.168.1.1')).toBe(true);
    expect(isIpAddress('10.0.0.1')).toBe(true);
    expect(isIpAddress('example.com')).toBe(false);
    expect(isIpAddress('google.123.com')).toBe(false);
  });

  it('calculates subdomain count accurately', () => {
    expect(countSubdomains('example.com')).toBe(0);
    expect(countSubdomains('sub.example.com')).toBe(1);
    expect(countSubdomains('a.b.c.example.com')).toBe(3);
  });

  it('triggers HTTP_INSECURE for http:// URLs', () => {
    const res = analyzeUrlRisk('http://simple-http-site.com');
    const httpInd = res.indicators.find((i) => i.indicatorId === 'HTTP_INSECURE');
    expect(httpInd?.triggered).toBe(true);
    expect(httpInd?.scoreContribution).toBe(25);
  });

  it('triggers IP_ADDRESS_HOST for raw IP destinations', () => {
    const res = analyzeUrlRisk('http://192.168.0.100/index.html');
    const ipInd = res.indicators.find((i) => i.indicatorId === 'IP_ADDRESS_HOST');
    expect(ipInd?.triggered).toBe(true);
    expect(ipInd?.scoreContribution).toBe(35);
  });

  it('triggers PUNYCODE_DOMAIN for xn-- domains', () => {
    const res = analyzeUrlRisk('https://xn--pple-43d.com/support');
    const punyInd = res.indicators.find((i) => i.indicatorId === 'PUNYCODE_DOMAIN');
    expect(punyInd?.triggered).toBe(true);
    expect(punyInd?.scoreContribution).toBe(25);
  });

  it('triggers SUSPICIOUS_AT_SYMBOL when "@" is embedded', () => {
    const res = analyzeUrlRisk('https://google.com@attacker-controlled.net/login');
    const atInd = res.indicators.find((i) => i.indicatorId === 'SUSPICIOUS_AT_SYMBOL');
    expect(atInd?.triggered).toBe(true);
    expect(atInd?.scoreContribution).toBe(25);
  });

  it('triggers SUSPICIOUS_KEYWORDS for login/verify/account/banking', () => {
    const res = analyzeUrlRisk('https://myportal.com/banking/login/verify-account');
    const kwInd = res.indicators.find((i) => i.indicatorId === 'SUSPICIOUS_KEYWORDS');
    expect(kwInd?.triggered).toBe(true);
    expect(kwInd?.scoreContribution).toBe(20);
  });

  it('triggers EXCESSIVE_SUBDOMAINS for stacked subdomains', () => {
    const res = analyzeUrlRisk('https://secure.account.update.login.fake-site.com');
    const subInd = res.indicators.find((i) => i.indicatorId === 'EXCESSIVE_SUBDOMAINS');
    expect(subInd?.triggered).toBe(true);
    expect(subInd?.scoreContribution).toBe(20);
  });

  it('triggers UNUSUAL_PORT for non-standard web ports', () => {
    const res = analyzeUrlRisk('http://legitlooking.com:8443/test');
    const portInd = res.indicators.find((i) => i.indicatorId === 'UNUSUAL_PORT');
    expect(portInd?.triggered).toBe(true);
    expect(portInd?.scoreContribution).toBe(20);
  });

  it('triggers UNUSUAL_LENGTH for URLs exceeding 75 characters', () => {
    const longUrl = 'https://example.com/very/long/path/with/lots/of/nested/directories/and/arbitrary/extra/parameters/test.html';
    const res = analyzeUrlRisk(longUrl);
    const lenInd = res.indicators.find((i) => i.indicatorId === 'UNUSUAL_LENGTH');
    expect(lenInd?.triggered).toBe(true);
    expect(lenInd?.scoreContribution).toBe(15);
  });

  it('triggers ENCODED_EVASION for multiple percent-encoded tokens or evasion sequences', () => {
    const encodedUrl = 'https://example.com/dir%2e%2e/target%2fpath%20test';
    const res = analyzeUrlRisk(encodedUrl);
    const encInd = res.indicators.find((i) => i.indicatorId === 'ENCODED_EVASION');
    expect(encInd?.triggered).toBe(true);
    expect(encInd?.scoreContribution).toBe(15);
  });

  it('caps risk score at 100 even with multiple cumulative triggers', () => {
    // URL triggering almost all rules: HTTP (+25) + IP (+35) + keywords (+20) + port (+20) + length (+15) = 115 -> capped at 100
    const malicious = 'http://192.168.1.1:8080/login/verify/update/account/recover/secure/portal/admin/path/test?auth=123';
    const res = analyzeUrlRisk(malicious);
    expect(res.riskScore).toBe(100);
    expect(res.riskCategory).toBe('High');
  });

  it('evaluates category boundaries correctly (Low: 0-29, Medium: 30-59, High: 60-100)', () => {
    // Benign URL
    const safe = analyzeUrlRisk('https://github.com');
    expect(safe.riskScore).toBeLessThan(30);
    expect(safe.riskCategory).toBe('Low');

    // Medium risk: HTTP (25) + length (15) = 40
    const med = analyzeUrlRisk('http://an-ordinary-website-that-just-happens-to-be-over-seventy-five-characters-long.com');
    expect(med.riskScore).toBeGreaterThanOrEqual(30);
    expect(med.riskScore).toBeLessThanOrEqual(59);
    expect(med.riskCategory).toBe('Medium');

    // High risk: HTTP (25) + IP (35) = 60
    const high = analyzeUrlRisk('http://192.168.1.1/dashboard');
    expect(high.riskScore).toBeGreaterThanOrEqual(60);
    expect(high.riskCategory).toBe('High');
  });
});
