import { ResumeContent } from "./resume-types";

export function scoreResume(c: ResumeContent): { score: number; tips: string[] } {
  let score = 0;
  const tips: string[] = [];

  if (c.personal.fullName) score += 5; else tips.push("Add your full name.");
  if (c.personal.email) score += 5; else tips.push("Add a professional email.");
  if (c.personal.phone) score += 3; else tips.push("Add a phone number.");
  if (c.personal.title) score += 5; else tips.push("Add a target job title.");
  if (c.personal.summary && c.personal.summary.length > 60) score += 12;
  else tips.push("Write a 2–3 sentence professional summary.");

  if (c.experience.length === 0) tips.push("Add at least one work experience.");
  else {
    score += Math.min(c.experience.length * 8, 24);
    const totalBullets = c.experience.reduce((a, e) => a + e.bullets.filter(Boolean).length, 0);
    if (totalBullets >= 6) score += 12;
    else tips.push("Add 3+ achievement bullets per role with metrics.");
    const hasMetrics = c.experience.some((e) => e.bullets.some((b) => /\d/.test(b)));
    if (hasMetrics) score += 8;
    else tips.push("Quantify achievements (e.g. '20% faster', '$1M revenue').");
  }

  if (c.education.length > 0) score += 8; else tips.push("Add education details.");
  if (c.skills.length >= 5) score += 10;
  else tips.push("List at least 5 relevant skills.");
  if (c.projects.length > 0) score += 5;

  // Certifications — moderately weighted: ATS parsers reward role-relevant certs (AWS, PMP, Scrum, etc.)
  // but they're a supporting signal, not a primary one. Cap to avoid cert-stuffing.
  if (c.certifications.length > 0) {
    score += Math.min(c.certifications.length * 3, 9);
    const wellFormed = c.certifications.filter((cert) => cert.name && cert.issuer).length;
    if (wellFormed === c.certifications.length) score += 2;
    else tips.push("Add issuer and date for each certification — ATS parses these fields separately.");
  } else {
    tips.push("Add 1–3 role-relevant certifications (e.g. AWS, PMP, Scrum) to strengthen ATS match.");
  }

  // Languages — lower weight: only material for global/customer-facing roles, but proficiency
  // level is what ATS filters on, so reward structured entries more than raw count.
  if (c.languages.length > 0) {
    score += Math.min(c.languages.length * 1.5, 4);
    const withProficiency = c.languages.filter((l) => l.name && l.proficiency).length;
    if (withProficiency === c.languages.length) score += 2;
    else tips.push("Specify proficiency (Elementary→Native) for every language so ATS can filter correctly.");
  }

  const actionVerbs = ["led", "built", "shipped", "designed", "launched", "owned", "drove", "scaled", "improved", "reduced", "increased"];
  const allText = c.experience.flatMap((e) => e.bullets).join(" ").toLowerCase();
  const verbHits = actionVerbs.filter((v) => allText.includes(v)).length;
  score += Math.min(verbHits * 1.5, 8);
  if (verbHits < 3) tips.push("Start bullets with strong action verbs (Led, Built, Shipped).");

  return { score: Math.min(Math.round(score), 100), tips: tips.slice(0, 6) };
}