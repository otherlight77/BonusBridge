const files={countries:'countries.json',companies:'insurance-companies.json',rules:'recognition-rules.json',documents:'required-documents.json',languages:'languages.json',currencies:'currencies.json',samples:'sample-comparisons.json',vehicles:'vehicle-types.json',coverages:'coverage-types.json',countryGuides:'country-guides.json',documentGuides:'document-guides.json',faqs:'faq.json',sourcedInsurers:'insurers.json',insurerSources:'insurer-sources.json',sourceHistory:'source-history.json',canadaProvinces:'provinces-canada.json',franceRegions:'regions-france.json'};

export async function loadCatalog(){
  const entries=await Promise.all(Object.entries(files).map(async([key,file])=>{
    const response=await fetch(`./data/${file}`);
    if(!response.ok)throw new Error(`The local dataset ${file} could not be loaded (${response.status}).`);
    const payload=await response.json();
    if(!Array.isArray(payload.records))throw new Error(`The local dataset ${file} has an invalid records envelope.`);
    return[key,payload.records];
  }));
  return Object.fromEntries(entries);
}

export function createSearchIndex(catalog){
  const product=[{icon:'◎',title:'Comparison engine',description:'Find documented insurer rules',target:'#compare'},{icon:'⌖',title:'Global rules map',description:'Explore demonstration coverage',target:'#coverage'},{icon:'▤',title:'Local workspace',description:'History, favorites and settings',view:'overview'},{icon:'◇',title:'Local data administration',description:'Review rules and provenance',view:'admin'}];
  const countries=catalog.countries.map(item=>({icon:item.flag,title:item.name,description:`${catalog.rules.filter(rule=>rule.originCountry===item.id||rule.destinationCountry===item.id).length} available rules`,country:item.id}));
  const companies=catalog.companies.map(item=>({icon:item.initials,title:item.name,description:`${item.countries.length} listed markets · ${item.status}`,company:item.id}));
  return[...product,...countries,...companies];
}
