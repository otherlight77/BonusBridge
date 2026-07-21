export function validateComparison(input){
  const errors=[];
  const required=['originCountry','destinationCountry','currentCompany','insuredYears','bonusMalus','licenceDate','driverAge','vehicleType','claimsCount','coverageType','preferredLanguage'];
  required.forEach(key=>{if(input[key]===''||input[key]==null)errors.push(`${key} is required.`)});
  if(input.originCountry===input.destinationCountry)errors.push('Origin and destination countries must be different.');
  if(Number(input.driverAge)<18||Number(input.driverAge)>100)errors.push('Driver age must be between 18 and 100.');
  if(Number(input.insuredYears)<0||Number(input.insuredYears)>60)errors.push('Insured years must be between 0 and 60.');
  if(Number(input.claimsCount)<0||Number(input.claimsCount)>20)errors.push('Claims count must be between 0 and 20.');
  if(input.licenceDate&&new Date(input.licenceDate)>new Date())errors.push('The licence date cannot be in the future.');
  return errors;
}
