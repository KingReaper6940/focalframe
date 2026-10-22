import { planCrop } from './core.mjs';
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
