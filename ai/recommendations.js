import { rankDestinations } from './scoring.js';

export function createRecommendation(profile, countries) {
  const [best] = rankDestinations(profile, countries);
  const name = profile?.firstName || 'Votre profil';
  return {
    title: `Cap sur ${best.cities[0]}`,
    copy: `${name}, votre signature ${profile?.element || 'personnelle'} résonne avec ${best.name} : ${best.tags.join(', ').toLowerCase()}.`,
    confidence: best.personalizedScore,
    destination: best
  };
}
