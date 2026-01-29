// Utility to extract URLs from text and check if a link is likely fake/scam

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]*)?/gi
  return text.match(urlRegex) || []
}

// Simple heuristic: flag links with suspicious TLDs or known scam patterns
const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work']
const scamKeywords = ['verify', 'login', 'prize', 'winner', 'claim', 'reset', 'suspend', 'blocked', 'alert', 'urgent']

export function isLinkSuspicious(url: string): boolean {
  try {
    const u = new URL(url)
    if (suspiciousTlds.some(tld => u.hostname.endsWith(tld))) return true
    if (scamKeywords.some(word => url.toLowerCase().includes(word))) return true
    return false
  } catch {
    return false
  }
}
