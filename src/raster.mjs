import { planCrop, planAll } from './core.mjs';
import { FORMATS } from './recipe.mjs';
export async function encodeCrop(source,point,presetId,allowUpscale,format,makeCanvas=()=>document.createElement('canvas')) {
  if(!FORMATS.includes(format))throw new Error('Unsupported export format.');
  const plan=planCrop(source.width,source.height,point,presetId,allowUpscale);
  if(!plan.canExport)throw new Error('This crop needs upscaling. Use a larger image or explicitly allow upscaling.');
  const canvas=makeCanvas();canvas.width=plan.preset.width;canvas.height=plan.preset.height;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas rendering is unavailable in this browser.');
  if(format==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const r=plan.source;ctx.drawImage(source.image,r.x,r.y,r.width,r.height,0,0,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>{
    canvas.toBlob(value=>value?resolve(value):reject(new Error('The browser could not encode this crop.')),format,.9);
  });
  if(blob.type!==format)throw new Error('This browser does not support the requested image encoder.');
  return {blob,plan};
}

export async function encodeComparison(source,point,makeCanvas=()=>document.createElement('canvas')) {
  const plans=planAll(source.width,source.height,point,true);
  const canvas=makeCanvas();canvas.width=1800;canvas.height=1000;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas rendering is unavailable.');
  ctx.fillStyle='#f8f7f3';ctx.fillRect(0,0,1800,1000);
  ctx.fillStyle='#332d4e';ctx.font='bold 34px system-ui';ctx.fillText('Focalframe / crop comparison',50,65);
  ctx.font='20px system-ui';ctx.fillText('Focal point '+Math.round(point.x*100)+'%, '+Math.round(point.y*100)+'% · Preview sheet; labels show target dimensions.',50,108);
  for(let index=0;index<plans.length;index++) {
    const plan=plans[index];const left=50+index*580;
    ctx.fillStyle='#332d4e';ctx.font='bold 25px system-ui';ctx.fillText(plan.preset.name+' / '+plan.preset.ratio,left,170);
    ctx.font='18px system-ui';ctx.fillText(plan.preset.width+' × '+plan.preset.height+' target px',left,203);
    const scale=Math.min(540/plan.preset.width,680/plan.preset.height);
    const width=plan.preset.width*scale,height=plan.preset.height*scale;
    const x=left+(540-width)/2,y=230+(680-height)/2;
    ctx.fillStyle='#ffffff';ctx.fillRect(x,y,width,height);
    const r=plan.source;ctx.drawImage(source.image,r.x,r.y,r.width,r.height,x,y,width,height);
    ctx.fillStyle='#706c78';ctx.font='18px system-ui';
    ctx.fillText(plan.upscaled?'Full-size export would upscale.':'Full-size export needs no upscaling.',left,955);
  }
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not encode comparison sheet.')),'image/png'));
  if(blob.type!=='image/png')throw new Error('PNG encoding is unavailable.');
  return {blob,output:{id:'comparison',name:'Comparison sheet',width:1800,height:1000}};
}
