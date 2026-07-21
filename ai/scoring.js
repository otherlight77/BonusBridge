const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function scoreMatch(input,rule,company){
  if(!rule.recognized)return 0;
  const requestedYears=Number(input.insuredYears||0);
  const recognizedYears=Math.min(requestedYears,Number(rule.maximumYearsRecognized||0));
  let score=58;
  score+=Math.min(18,recognizedYears*1.5);
  score+=Number(rule.retainedBonusPercent||0)*.22;
  score-=Number(input.claimsCount||0)*5;
  score-=input.youngDriver?7:0;
  score-=rule.translationRequired?3:0;
  score+=company.digitalOnboarding?2:0;
  score+=company.internationalDesk?3:0;
  return clamp(Math.round(score),0,99);
}

export function estimateSavings(input,rule,score,catalog){
  const vehicle=catalog.vehicles.find(item=>item.id===input.vehicleType)?.factor||1;
  const coverage=catalog.coverages.find(item=>item.id===input.coverageType)?.factor||1;
  const years=Math.min(Number(input.insuredYears||0),Number(rule.maximumYearsRecognized||0));
  const estimate=Math.round((300+years*38+Number(rule.retainedBonusPercent||0)*12+score*3)*vehicle*coverage/10)*10;
  return Math.max(250,Math.min(2600,estimate));
}

export function difficultyLabel(rule,input){
  const weight=(rule.translationRequired?1:0)+(rule.acceptedDocuments?.length>3?1:0)+(Number(input.claimsCount||0)>1?1:0);
  return ['Easy','Moderate','Advanced','Complex'][Math.min(3,weight)];
}
