const elementAffinity = {
  Air: { France: 4, Belgique: 5, Canada: 5, USA: 3, Australie: 4, Espagne: 4, Portugal: 3, Luxembourg: 4, Italie: 4 },
  Feu: { France: 3, Belgique: 2, Canada: 3, USA: 5, Australie: 5, Espagne: 5, Portugal: 4, Luxembourg: 2, Italie: 5 },
  Terre: { France: 4, Belgique: 4, Canada: 4, USA: 3, Australie: 3, Espagne: 3, Portugal: 4, Luxembourg: 5, Italie: 4 },
  Eau: { France: 4, Belgique: 3, Canada: 4, USA: 2, Australie: 4, Espagne: 4, Portugal: 5, Luxembourg: 3, Italie: 5 }
};

export function scoreDestination(profile, country) {
  const affinity = elementAffinity[profile?.element]?.[country.name] || 3;
  const preferenceBoost = profile?.preferences?.includes('Mobilité') ? 2 : 0;
  return Math.min(99, Math.max(70, country.score - 4 + affinity + preferenceBoost));
}

export function rankDestinations(profile, countries) {
  return countries.map(country => ({ ...country, personalizedScore: scoreDestination(profile, country) })).sort((a, b) => b.personalizedScore - a.personalizedScore);
}
