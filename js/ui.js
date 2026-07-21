export function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]))}
export function statusLabel(record){if(record.verified)return'Verified';if(record.status==='demo')return'Demonstration';return'To confirm'}
export function announce(node,message){node.textContent=message;node.focus?.()}
