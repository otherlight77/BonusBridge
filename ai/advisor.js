export function createAdvice(input,matches,countries){
  const origin=countries.find(item=>item.id===input.originCountry)?.name||input.originCountry;
  const destination=countries.find(item=>item.id===input.destinationCountry)?.name||input.destinationCountry;
  const best=matches[0];
  if(!best)return{title:`No documented rule is available for ${origin} → ${destination}.`,copy:'Ask insurers whether they accept a foreign claims experience letter, which format they require, and whether a certified translation is necessary. Any answer should be confirmed in writing.'};
  const checks=[];
  checks.push(`Request ${best.documents.map(item=>item.name).join(', ')}.`);
  if(best.translationRequired)checks.push('Confirm which certified translators are accepted.');
  if(!best.verified)checks.push('This demonstration rule still requires official verification with the insurer.');
  return{title:`Prepare your evidence before contacting ${best.company.name}.`,copy:checks.join(' ')};
}
