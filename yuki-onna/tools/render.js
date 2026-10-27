// node tools/render.js <out.mp4> <startFrame> <endFrame>  — renders frames [start,end) at 60 fps into a high-quality intermediate
const {chromium}=require('playwright'); const path=require('path'); const {spawn}=require('child_process');
(async()=>{ const [out,s0,s1]=process.argv.slice(2); const a=+s0, b=+s1, FPS=60;
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','12','-pix_fmt','yuv420p','-r',String(FPS),out],{stdio:['pipe','inherit','inherit']});
const br=await chromium.launch(); const p=await br.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('pageerror:',e.message));
await p.goto('file://'+path.resolve(__dirname,'..','index.html')+'?render=1'); await p.waitForFunction(()=>window.LOADED===true);
const T0=Date.now();
for(let f=a; f<b; f++){ await p.evaluate(t=>renderAt(t),f/FPS); const buf=await p.screenshot({type:'jpeg',quality:95});
  if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
  if((f-a)%120===0) console.log(out.split('/').pop(),f,((Date.now()-T0)/(f-a+1)).toFixed(0)+'ms/f'); }
ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await br.close(); console.log('done',out); })();
