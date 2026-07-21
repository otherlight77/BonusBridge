import{validateComparison}from'./validation.js';
export function readComparison(form){const input=Object.fromEntries(new FormData(form));input.youngDriver=form.elements.youngDriver.checked;input.mainDriver=form.elements.mainDriver.checked;return input}
export function prepareComparison(form){const input=readComparison(form);return{input,errors:validateComparison(input)}}
