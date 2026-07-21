export function validateComparison(input){
  const errors=[];
  const required=['originCountry','destinationCountry','currentCompany','insuredYears','bonusMalus','licenceDate','driverAge','vehicleType','vehicleValue','vehicleUse','annualMileage','claimsCount','nonFaultClaimsCount','coverageType','preferredLanguage','needsOfficialTranslation'];
  required.forEach(key=>{if(input[key]===''||input[key]==null)errors.push(`${key} is required.`)});
  if(input.originCountry===input.destinationCountry)errors.push('Origin and destination countries must be different.');
  if(Number(input.driverAge)<18||Number(input.driverAge)>100)errors.push('Driver age must be between 18 and 100.');
  if(Number(input.insuredYears)<0||Number(input.insuredYears)>60)errors.push('Insured years must be between 0 and 60.');
  if(Number(input.claimsCount)<0||Number(input.claimsCount)>20)errors.push('At-fault claims must be between 0 and 20.');
  if(Number(input.nonFaultClaimsCount)<0||Number(input.nonFaultClaimsCount)>20)errors.push('Non-fault claims must be between 0 and 20.');
  if(Number(input.vehicleValue)<500||Number(input.vehicleValue)>500000)errors.push('Vehicle value must be between 500 and 500,000.');
  if(Number(input.annualMileage)<1000||Number(input.annualMileage)>100000)errors.push('Annual mileage must be between 1,000 and 100,000.');
  if(input.licenceDate&&new Date(input.licenceDate)>new Date())errors.push('The licence date cannot be in the future.');
  if(input.lastClaimDate&&new Date(input.lastClaimDate)>new Date())errors.push('The last claim date cannot be in the future.');
  return errors;
}
