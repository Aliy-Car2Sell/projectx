import fs from 'node:fs';const load=l=>JSON.parse(fs.readFileSync('messages/'+l+'.json','utf8'));
const keys=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v,p+k+'.'):[p+k]);
const uz=new Set(keys(load('uz')));let ok=true;
for(const l of ['ru','en']){const s=new Set(keys(load(l)));const miss=[...uz].filter(k=>!s.has(k));const extra=[...s].filter(k=>!uz.has(k));if(miss.length||extra.length){ok=false;console.log(l,'missing',miss,'extra',extra);}}
console.log(ok?'message keys in sync':'KEY MISMATCH');
