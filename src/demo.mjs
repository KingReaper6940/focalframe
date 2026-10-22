// A deterministic, code-drawn scene for trying the tool without uploading a photo.
export function demoArtwork(width=2400,height=1600) {
  const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d'); ctx.scale(width/2400,height/1600);
  ctx.fillStyle='#b5c9c3';ctx.fillRect(0,0,2400,1600);
  ctx.fillStyle='#efcd86';ctx.beginPath();ctx.arc(1770,380,180,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#778e83';ctx.beginPath();ctx.moveTo(0,950);ctx.quadraticCurveTo(650,280,1300,820);ctx.quadraticCurveTo(1850,540,2400,840);ctx.lineTo(2400,1600);ctx.lineTo(0,1600);ctx.fill();
  ctx.fillStyle='#d8bb96';ctx.beginPath();ctx.moveTo(0,1150);ctx.quadraticCurveTo(950,610,2400,1130);ctx.lineTo(2400,1600);ctx.lineTo(0,1600);ctx.fill();
  ctx.fillStyle='#a78167';ctx.beginPath();ctx.moveTo(0,1410);ctx.quadraticCurveTo(1400,900,2400,1370);ctx.lineTo(2400,1600);ctx.lineTo(0,1600);ctx.fill();
  ctx.fillStyle='#2b4542';ctx.fillRect(1650,845,220,400);ctx.beginPath();ctx.arc(1760,800,104,Math.PI,0);ctx.fill();ctx.fillStyle='#efcd86';ctx.beginPath();ctx.arc(1760,720,65,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#273a39';ctx.fillRect(1670,1230,60,220);ctx.fillRect(1790,1230,60,220);
  ctx.fillStyle='#f2dfba';ctx.fillRect(250,270,200,12);ctx.fillRect(250,305,120,12);
  return canvas;
}
