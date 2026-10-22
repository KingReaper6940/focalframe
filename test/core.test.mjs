import test from 'node:test';
import assert from 'node:assert/strict';
import { planCrop, planAll, validateSize, PRESETS } from '../src/core.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('square center crop from landscape uses full source height',()=>{
  const p=planCrop(2400,1600,{x:.5,y:.5},'square');
  assert.deepEqual(p.source,{x:400,y:0,width:1600,height:1600});
  near(p.scale,.675); assert.equal(p.canExport,true);
});
test('focal point moves crop to edges without leaving the source',()=>{
  assert.equal(planCrop(2400,1600,{x:0,y:.5},'square').source.x,0);
  assert.equal(planCrop(2400,1600,{x:1,y:.5},'square').source.x,800);
  const p=planCrop(1200,2400,{x:.5,y:1},'wide');
  near(p.source.y,1725); near(p.source.height,675);
});
test('each rectangle preserves output aspect ratio and contains the focal point',()=>{
  for(const [w,h] of [[2400,1600],[1200,2400],[1333,777]]) for(const x of [0,.23,.5,1]) for(const y of [0,.4,1]) {
    for(const p of planAll(w,h,{x,y})) {
      const r=p.source;
      near(r.width/r.height,p.preset.width/p.preset.height);
      assert.ok(r.x>=-1e-7 && r.y>=-1e-7 && r.x+r.width<=w+1e-7 && r.y+r.height<=h+1e-7);
      assert.ok(x*w>=r.x-1e-7 && x*w<=r.x+r.width+1e-7 && y*h>=r.y-1e-7 && y*h<=r.y+r.height+1e-7);
    }
  }
});
test('upscaling is blocked by default and requires an explicit setting',()=>{
  const blocked=planCrop(500,400,{x:.5,y:.5},'portrait');
  assert.equal(blocked.upscaled,true); assert.equal(blocked.canExport,false);
  assert.equal(planCrop(500,400,{x:.5,y:.5},'portrait',true).canExport,true);
  assert.equal(planCrop(1080,1080,{x:.5,y:.5},'square').upscaled,false);
});
test('rejects oversized images, invalid focal points, formats and flags',()=>{
  for(const [w,h] of [[0,1],[8001,1],[5000,5000],[1.5,20]]) assert.throws(()=>validateSize(w,h));
  for(const point of [{x:NaN,y:.5},{x:-.1,y:.5},{x:.5,y:2},null]) assert.throws(()=>planCrop(1200,1200,point,'square'));
  assert.throws(()=>planCrop(1200,1200,{x:.5,y:.5},'unknown'));
  assert.throws(()=>planCrop(1200,1200,{x:.5,y:.5},'square','yes'));
});
test('plans do not mutate focal input or shared presets',()=>{
  const point={x:.5,y:.5}; const plan=planCrop(2000,2000,point,'square');
  plan.preset.width=1; assert.equal(PRESETS[0].width,1080); assert.deepEqual(point,{x:.5,y:.5});
});
