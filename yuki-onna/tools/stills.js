// node tools/stills.js out_dir t1 t2 ... → PNG/JPG stills
const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{ const [out,...ts]=process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('console',m=>{ if(m.type()==='error') console.log('console:',m.text()); }); p.on('pageerror',e=>console.log('pageerror:',e.message));
await p.goto('file://'+path.resolve(__dirname,'..','index.html')+'?render=1'); await p.waitForFunction(()=>window.LOADED===true);
for(const t of ts){ const T=Date.now(); await p.evaluate(t=>renderAt(t),parseFloat(t)); await p.screenshot({path:`${out}/f_${parseFloat(t).toFixed(2).padStart(6,'0')}.jpg`,type:'jpeg',quality:88}); console.log(t,Date.now()-T,'ms'); }
await b.close(); })();
