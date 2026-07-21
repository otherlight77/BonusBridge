import{scoreMatch,estimateSavings,difficultyLabel}from'./scoring.js';

export function findMatches(input,catalog){
  const rules=catalog.rules.filter(rule=>rule.originCountry===input.originCountry&&rule.destinationCountry===input.destinationCountry);
  return rules.map(rule=>{
    const company=catalog.companies.find(item=>item.id===rule.insurerId);
    if(!company)return null;
    const score=scoreMatch(input,rule,company);
    const recognizedYears=Math.min(Number(input.insuredYears||0),Number(rule.maximumYearsRecognized||0));
    const documents=(rule.acceptedDocuments||[]).map(id=>catalog.documents.find(item=>item.id===id)).filter(Boolean);
    return{rule,company,score,recognized:rule.recognized,recognizedBonus:Number(rule.retainedBonusPercent||0),lostBonus:Math.max(0,100-Number(rule.retainedBonusPercent||0)),recognizedYears,documents,translationRequired:rule.translationRequired,acceptedLanguages:rule.acceptedLanguages||[],processingDays:rule.estimatedProcessingDays,savings:estimateSavings(input,rule,score,catalog),difficulty:difficultyLabel(rule,input),officialSourceUrl:rule.officialSourceUrl,verified:rule.verified===true,status:rule.status||'pending',lastVerified:rule.lastVerified};
  }).filter(Boolean).sort((a,b)=>b.score-a.score);
}
