let from = email.from || "";
let subject = email.subject || "";
let bodyText = email.textPlain || email.textHtml || "";

const fwdMatch = bodyText.match(/---------- Forwarded message ---------([\s\S]*)/i);
if (fwdMatch) {
  bodyText = fwdMatch[1];
  const fwdFrom = bodyText.match(/From:\s*(.+)/i);
  const fwdSubject = bodyText.match(/Subject:\s*(.+)/i);
  if (fwdFrom) from = fwdFrom[1].trim();
  if (fwdSubject) subject = fwdSubject[1].trim();
}

const body = bodyText.toLowerCase();

function extractCompany(from, bodyText) {
  const displayPatterns = [
    [/^"?(.+?),?\s+Inc\.?\s*@\s*icims/i, 1],
    [/^"?(.+?)\s*@\s*icims/i, 1],
    [/^"?(.+?)\s+recruiting/i, 1],
    [/^"?(.+?)\s+talent/i, 1],
  ];
  for (const [re, g] of displayPatterns) {
    const m = from.match(re);
    if (m) return m[g].replace(/,?\s*Inc\.?/i, "").trim();
  }

  const bodyPatterns = [
    /join us at ([A-Z][a-zA-Z]+)/,
    /interest in ([A-Z][a-zA-Z]+)/,
    /application (?:to|at|with) ([A-Z][a-zA-Z]+)/,
    /team at ([A-Z][a-zA-Z]+)/,
    /at ([A-Z][a-zA-Z]+),? we/,
  ];
  for (const re of bodyPatterns) {
    const m = bodyText.match(re);
    if (m) return m[1].trim();
  }

  const emailMatch = from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
  if (emailMatch) {
    const addr = emailMatch[1].toLowerCase();
    const username = addr.split("@")[0];
    const domain = addr.split("@")[1];

    const usernameMap = {
      "accenture": "Accenture",
      "talentattractionandacquisition": "EY",
    };
    if (usernameMap[username]) return usernameMap[username];

    const domainMap = {
      "ey.com": "EY",
      "microsoft.com": "Microsoft",
      "abrdn.com": "Aberdeen",
      "nokia.com": "Nokia",
      "arm.com": "Arm",
      "github.com": "GitHub",
      "accenture.com": "Accenture",
      "amazon.com": "Amazon",
      "google.com": "Google",
      "meta.com": "Meta",
      "apple.com": "Apple",
    };
    const rootDomain = domain.split(".").slice(-2).join(".");
    if (domainMap[rootDomain]) return domainMap[rootDomain];

    const name = rootDomain.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return "Unknown";
}

function extractPlatform(from, body) {
  const checks = [
    ["myworkday.com", "Workday"],
    ["icims", "iCIMS"],
    ["linkedin.com", "LinkedIn"],
    ["naukri.com", "Naukri"],
    ["greenhouse.io", "Greenhouse"],
    ["lever.co", "Lever"],
    ["smartrecruiters.com", "SmartRecruiters"],
    ["workable.com", "Workable"],
  ];
  const combined = (from + " " + body).toLowerCase();
  for (const [kw, label] of checks) {
    if (combined.includes(kw)) return label;
  }
  return "Direct";
}

function extractStatus(subject, body) {
  const text = (subject + " " + body).toLowerCase();

  if (/aced it|love you to join|pleased to offer|offer of employment|extend.*offer|formal offer/.test(text))
    return "Offer Received";
  if (/move forward|invite you to an interview|finalized your interview|impressed with your application|schedule.*interview|next.*round|technical.*interview|hiring.*manager/.test(text))
    return "Interview Scheduled";
  if (/regret|not moving forward|pursued other candidates|unfortunately|not been selected|unable to.*offer|other candidates/.test(text))
    return "Rejected";
  if (/received your application|successfully submitted|thank you for applying|application.*received|we.*received.*your|confirmed.*application/.test(text))
    return "Applied";
  if (/came across your profile|open to opportunities|exciting opportunity|reach out.*role|would you be interested/.test(text))
    return "Recruiter Outreach";

  return null;
}

function extractRole(subject, bodyText) {
  const combined = subject + " " + bodyText;
  const patterns = [
    /(?:position|role|job)[:\s]+([^,\n.]{5,60})/i,
    /applying for[:\s]+([^,\n.]{5,60})/i,
    /application for[:\s]+([^,\n.]{5,60})/i,
    /for the ([^,\n.]{5,60}) (?:position|role)/i,
    /re:\s+([^,\n.]{5,60})/i,
  ];
  for (const re of patterns) {
    const m = combined.match(re);
    if (m) return m[1].trim();
  }
  return "Unknown";
}

const status = extractStatus(subject, body);
if (!status) return [];

const company = extractCompany(from, bodyText);
const role = extractRole(subject, bodyText);
const platform = extractPlatform(from, body);
const today = new Date().toISOString().split("T")[0];
const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const jobKey = `${company}|${role}`;

return [{
  json: {
    dateApplied: today,
    company,
    role,
    platform,
    status,
    lastUpdated: today,
    followUpDate,
    priority: "Normal",
    jobKey,
  }
}];
