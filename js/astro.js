import { zodiac } from './data.js';

export function getSunSign(dateValue) {
  if (!dateValue) return zodiac[0];
  const date = new Date(`${dateValue}T12:00:00`);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return zodiac.find(sign => {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (sm > em) return (month === sm && day >= sd) || (month === em && day <= ed);
    return (month === sm && day >= sd) || (month === em && day <= ed) || (month > sm && month < em);
  }) || zodiac[0];
}

export function estimateAscendant(dateValue, timeValue, city = '') {
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
  const [hours = 12, minutes = 0] = (timeValue || '12:00').split(':').map(Number);
  const citySeed = [...city].reduce((total, char) => total + char.charCodeAt(0), 0) % 12;
  const daySeed = Math.floor((date.getMonth() * 30 + date.getDate()) / 30);
  const index = (Math.floor((hours * 60 + minutes) / 120) + citySeed + daySeed) % 12;
  return zodiac[index];
}

export function buildProfile(form) {
  const data = new FormData(form);
  const calculatedSign = getSunSign(data.get('birthDate'));
  const selectedSign = data.get('sign') === 'auto' ? calculatedSign : zodiac.find(item => item.name === data.get('sign')) || calculatedSign;
  const calculatedAscendant = estimateAscendant(data.get('birthDate'), data.get('birthTime'), data.get('city'));
  const ascendant = data.get('ascendant') === 'auto' ? calculatedAscendant : zodiac.find(item => item.name === data.get('ascendant')) || calculatedAscendant;
  const firstName = String(data.get('firstName') || 'Profil').trim();
  return {
    id: `${firstName.toLowerCase().replace(/[^a-z0-9à-ÿ]/g, '-')}-${Date.now()}`,
    firstName,
    lastName: String(data.get('lastName') || '').trim(),
    birthDate: data.get('birthDate'),
    birthTime: data.get('birthTime'),
    country: data.get('country'),
    city: String(data.get('city') || '').trim(),
    sign: selectedSign.name,
    ascendant: ascendant.name,
    element: selectedSign.element,
    symbol: selectedSign.symbol,
    icon: selectedSign.name === 'Gémeaux' ? 'assets/icons/gemini.svg' : selectedSign.name === 'Balance' ? 'assets/icons/libra.svg' : '',
    preferences: data.getAll('preferences'),
    detail: Number(data.get('detail') || 2),
    score: 90 + Math.floor(Math.random() * 9),
    createdAt: new Date().toISOString()
  };
}

export function buildWheel(svg) {
  const segments = svg.querySelector('#zodiac-segments');
  const labels = svg.querySelector('#zodiac-labels');
  const center = 250;
  const inner = 116;
  const outer = 220;
  zodiac.forEach((sign, index) => {
    const angle = (index * 30 - 90) * Math.PI / 180;
    const x1 = center + Math.cos(angle) * inner;
    const y1 = center + Math.sin(angle) * inner;
    const x2 = center + Math.cos(angle) * outer;
    const y2 = center + Math.sin(angle) * outer;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2); line.setAttribute('class', 'segment-line');
    segments.append(line);
    const labelAngle = ((index * 30) - 75) * Math.PI / 180;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', center + Math.cos(labelAngle) * 151); text.setAttribute('y', center + Math.sin(labelAngle) * 151); text.setAttribute('class', 'zodiac-label');
    text.textContent = sign.symbol;
    labels.append(text);
  });
}
