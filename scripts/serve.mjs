import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const paths=new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/favicon.svg','favicon.svg'],...['core','recipe','demo','app','raster'].map(name=>['/src/'+name+'.mjs','src/'+name+'.mjs'])]);
const mime={html:'text/html; charset=utf-8',css:'text/css',svg:'image/svg+xml',mjs:'text/javascript'};
createServer(async(req,res)=>{
  const path=paths.get(new URL(req.url,'http://localhost').pathname);
  if(!path){res.writeHead(404);res.end('Not found');return;}
  try{const body=await readFile(new URL(path,root));res.writeHead(200,{'Content-Type':mime[path.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}
  catch{res.writeHead(500);res.end('Preview unavailable');}
}).listen(4182,'127.0.0.1',()=>console.log('Focalframe preview: http://127.0.0.1:4182'));
