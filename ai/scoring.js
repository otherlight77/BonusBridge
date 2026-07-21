const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function scoreBreakdown(input,rule,company){
  const requestedYears=Number(input.insuredYears||0);
  const recognizedYears=Math.min(requestedYears,Number(rule.maximumYearsRecognized||0));
  const availableDocuments=['hasExperienceLetter','hasInformationStatement','hasClaimsHistory'].filter(key=>input[key]===true||input[key]==='on').length;
  const languageCompatible=(rule.acceptedLanguages||[]).includes(input.preferredLanguage||input.documentLanguage);
  const history=rule.recognized?30:0;
  const years=requestedYears?Math.round(20*(recognizedYears/requestedYears)):0;
  const bonus=Math.round(20*clamp(Number(rule.retainedBonusPercent||0)/100,0,1));
  const documents=Math.round(10*(availableDocuments/3));
  const translation=rule.translationRequired?0:5;
  const processing=clamp(Math.round(5-(Number(rule.estimatedProcessingDays||15)-5)/4),0,5);
  const coverage=company?5:0;
  const language=languageCompatible?5:0;
  return{history,years,bonus,documents,translation,processing,coverage,language,total:clamp(history+years+bonus+documents+translation+processing+coverage+language,0,100)};
}

export function scoreMatch(input,rule,company){
  const base=scoreBreakdown(input,rule,company).total;
  const claimsPenalty=Number(input.claimsCount||0)*3+Number(input.nonFaultClaimsCount||0);
  const youngDriverPenalty=input.youngDriver?3:0;
  return clamp(Math.round(base-claimsPenalty-youngDriverPenalty),0,99);
}

export function estimateSavings(input,rule,score,catalog){
  const vehicle=catalog.vehicles.find(item=>item.id===input.vehicleType)?.factor||1;
  const coverage=catalog.coverages.find(item=>item.id===input.coverageType)?.factor||1;
  const valueFactor=clamp(Number(input.vehicleValue||20000)/20000,.65,2);
  const mileageFactor=clamp(Number(input.annualMileage||12000)/12000,.7,1.5);
  const years=Math.min(Number(input.insuredYears||0),Number(rule.maximumYearsRecognized||0));
  const estimate=Math.round((220+years*30+Number(rule.retainedBonusPercent||0)*9+score*2.5)*vehicle*coverage*valueFactor*mileageFactor/10)*10;
  return Math.max(180,Math.min(3200,estimate));
}

export function difficultyLabel(rule,input){
  const missing=['hasExperienceLetter','hasInformationStatement','hasClaimsHistory'].filter(key=>!(input[key]===true||input[key]==='on')).length;
  const weight=(rule.translationRequired?1:0)+(rule.acceptedDocuments?.length>3?1:0)+(Number(input.claimsCount||0)>1?1:0)+(missing>1?1:0);
  return['Easy','Moderate','Advanced','Complex'][Math.min(3,weight)];
}
