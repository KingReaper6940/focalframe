import { encodeCrop, encodeComparison } from './raster.mjs';
import { planAll, planCrop, validateSize, MAX_BYTES, PRESETS } from './core.mjs';
import { readRecipe, writeRecipe, recipeReport } from './recipe.mjs';
import { demoArtwork } from './demo.mjs';
const $=id=>document.getElementById(id);
let source=null;
let point={x:.5,y:.5};
let revision=0;
let exportUrl=null;
const cards=new Map();
function announce(text,error=false) { $('message').textContent=text;$('message').classList.toggle('error',error); }
function invalidateExport() {
  revision++;
  if(exportUrl) URL.revokeObjectURL(exportUrl);
  exportUrl=null; $('export-ready').hidden=true;
  $('export-image').removeAttribute('src'); $('download').removeAttribute('href');
}
function recipe() { return {version:1,source:{width:source.width,height:source.height},point:{...point},allowUpscale:$('upscale').checked,format:$('format').value}; }
function drawSource() {
  const canvas=$('source-canvas');
  const scale=Math.min(900/source.width,520/source.height);
  canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));
  const ctx=canvas.getContext('2d');ctx.drawImage(source.image,0,0,canvas.width,canvas.height);
  const plan=planCrop(source.width,source.height,point,$('guide').value,true);
  const rx=plan.source.x/source.width*canvas.width,ry=plan.source.y/source.height*canvas.height;
  const rw=plan.source.width/source.width*canvas.width,rh=plan.source.height/source.height*canvas.height;
  ctx.strokeStyle='#f4ca78';ctx.lineWidth=3;ctx.strokeRect(rx+1,ry+1,Math.max(0,rw-2),Math.max(0,rh-2));
  const x=point.x*canvas.width,y=point.y*canvas.height;
  ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.moveTo(x-17,y);ctx.lineTo(x+17,y);ctx.moveTo(x,y-17);ctx.lineTo(x,y+17);ctx.stroke();
}
function drawPreview(canvas,plan) {
  canvas.width=320;canvas.height=Math.round(320*plan.preset.height/plan.preset.width);
  const ctx=canvas.getContext('2d');
  if($('format').value==='image/jpeg') {ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);}
  const r=plan.source;ctx.drawImage(source.image,r.x,r.y,r.width,r.height,0,0,canvas.width,canvas.height);
}
function render() {
  if(!source) return;
  invalidateExport(); drawSource();
  $('x').value=Math.round(point.x*100);$('y').value=Math.round(point.y*100);
  $('x-value').textContent=Math.round(point.x*100)+'%';$('y-value').textContent=Math.round(point.y*100)+'%';
  for(const plan of planAll(source.width,source.height,point,$('upscale').checked)) {
    const card=cards.get(plan.preset.id);drawPreview(card.canvas,plan);
    card.status.textContent=plan.upscaled ? (plan.canExport?'Upscaling enabled · output may look softer.':'Too small for this output. Allow upscaling or use a larger image.') : 'Native resolution available · no upscaling.';
    card.status.classList.toggle('warning',plan.upscaled);
    card.button.disabled=exporting||!plan.canExport;
  }
  $('receipt').value=JSON.stringify(recipeReport(recipe()),null,2);
}
function setSource(image,label) {
  if(source?.image?.close) source.image.close();
  source={image,width:image.width,height:image.height};
  point={x:.5,y:.5}; $('upscale').checked=false;
  $('source-meta').textContent=label+' · '+image.width+' × '+image.height;
  render();
}
function buildCards() {
  for(const preset of PRESETS) {
    const card=document.createElement('article');card.className='crop-card';
    const head=document.createElement('div');head.className='crop-heading';
    const title=document.createElement('h3');title.textContent=preset.name;
    const ratio=document.createElement('span');ratio.className='ratio';ratio.textContent=preset.ratio;head.append(title,ratio);
    const canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label',preset.name+' crop preview');
    const info=document.createElement('div');info.className='crop-info';
    const size=document.createElement('p');size.className='size';size.textContent=preset.width+' × '+preset.height+' px';
    const status=document.createElement('p');
    const button=document.createElement('button');button.textContent='Prepare '+preset.name.toLowerCase()+' export';button.dataset.preset=preset.id;
    info.append(size,status,button);card.append(head,canvas,info);$('crop-grid').append(card);
    cards.set(preset.id,{canvas,status,button});
  }
}
function loadDemo() { const image=demoArtwork();setSource(image,'Demo artwork');point={x:.72,y:.5};render();announce('Demo ready. Move the focal point to explore your crops.'); }
function changeFocus(x,y) { point={x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))};render();announce('Focus updated. Review each crop before exporting.'); }
$('source-canvas').addEventListener('pointerdown',event=>{if(!source)return;const r=event.currentTarget.getBoundingClientRect();changeFocus((event.clientX-r.left)/r.width,(event.clientY-r.top)/r.height);});
$('source-canvas').addEventListener('keydown',event=>{
  const amount=event.shiftKey?.05:.01;let x=point.x,y=point.y;
  if(event.key==='ArrowLeft')x-=amount;else if(event.key==='ArrowRight')x+=amount;else if(event.key==='ArrowUp')y-=amount;else if(event.key==='ArrowDown')y+=amount;else if(event.key==='Enter'||event.key===' '){x=.5;y=.5;}else return;
  event.preventDefault();changeFocus(x,y);
});
$('x').addEventListener('input',()=>changeFocus(Number($('x').value)/100,point.y));
$('y').addEventListener('input',()=>changeFocus(point.x,Number($('y').value)/100));
$('center').addEventListener('click',()=>changeFocus(.5,.5));
for(const id of ['guide','format','upscale']) $(id).addEventListener('change',()=>{render();announce('Settings updated. Review all three crops.');});
$('demo').addEventListener('click',loadDemo);
$('file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  invalidateExport();const token=revision;let image;
  try{
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a PNG, JPEG, or WebP image.');
    if(file.size>MAX_BYTES)throw new Error('Image exceeds the 10 MiB file limit.');
    image=await createImageBitmap(file,{imageOrientation:'from-image'});
    if(token!==revision){image.close();return;}
    validateSize(image.width,image.height);
    setSource(image,'Local image');image=null;announce('Image opened locally. Choose a focal point; nothing was uploaded.');
  }catch(error){if(image)image.close();if(token===revision)announce(error.message,true);}
  finally{event.target.value='';}
});
$('recipe').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file || !source)return;
  const token=++revision;
  try{
    if(file.size>40000)throw new Error('Recipe file is too large.');
    const text=await file.text();if(token!==revision)return;
    const next=readRecipe(text,{width:source.width,height:source.height});
    point=next.point;$('upscale').checked=next.allowUpscale;$('format').value=next.format;
    render();announce('Recipe applied. Matching dimensions do not prove it is the same image; check the previews.');
  }catch(error){if(token===revision)announce(error.message,true);}
  finally{event.target.value='';}
});
function downloadText(text,name) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('save-recipe').addEventListener('click',()=>{if(source)downloadText(writeRecipe(recipe()),'focalframe-recipe.json');});
let exporting=false;
buildCards();loadDemo();

function refreshExportButtons() {
  if(!source)return;
  $('comparison').disabled=exporting;
  for(const plan of planAll(source.width,source.height,point,$('upscale').checked))cards.get(plan.preset.id).button.disabled=exporting||!plan.canExport;
}
$('outputs-section').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-preset]');if(!button||exporting||!source)return;
  invalidateExport();const token=revision;exporting=true;refreshExportButtons();announce('Preparing crop locally…');
  try {
    const result=button.dataset.preset==='comparison' ? await encodeComparison(source,point) : await encodeCrop(source,point,button.dataset.preset,$('upscale').checked,$('format').value);
    const output=result.output ?? result.plan.preset;
    if(token!==revision)return;
    exportUrl=URL.createObjectURL(result.blob);
    const extension=result.blob.type==='image/png'?'png':'jpg';
    $('export-image').src=exportUrl;
    $('export-image').alt=output.name+' prepared crop';
    $('download').href=exportUrl;$('download').download='focalframe-'+output.id+'.'+extension;
    $('download').textContent='Download '+extension.toUpperCase()+' ↓';
    $('export-details').textContent=output.name+' · '+output.width+' × '+output.height+' px · '+(result.blob.size/1024).toFixed(1)+' KiB · '+result.blob.type;
    $('export-ready').hidden=false;
    announce('Export ready. Inspect the preview and use Download image to save it.');
  }catch(error){if(token===revision)announce(error.message,true);}
  finally{exporting=false;refreshExportButtons();}
});
