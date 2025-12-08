export function extractTopicsFromText(text) {
  if (!text) return [];

  const lowered = text.toLowerCase();
  const candidates = [];
  const keywords = [
    "login","auth","api","database","react","node","express",
    "docker","sql","mongo","firebase","css","html","typescript",
    "password","jwt","token","oauth","deployment","performance",
    "optimization","security","encryption","algorithm","component"
  ];

  for (const kw of keywords) {
    if (lowered.includes(kw)) candidates.push(kw);
  }

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const l of lines.slice(0, 12)) {
    const words = l.split(/\s+/);
    if (words.length <= 6 && /[A-Z]/.test(l[0])) {
      candidates.push(l);
    }
  }

  return [...new Set(candidates)].slice(0, 10);
}
