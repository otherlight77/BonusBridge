export function ruleCountForCountry(id,rules){return rules.filter(rule=>rule.originCountry===id||rule.destinationCountry===id).length}
export function routePath(origin,destination){if(!origin?.map||!destination?.map)return'';const x1=origin.map.x*10,y1=origin.map.y*5.2,x2=destination.map.x*10,y2=destination.map.y*5.2;return`M${x1} ${y1} Q${(x1+x2)/2} ${Math.min(y1,y2)-55} ${x2} ${y2}`}
