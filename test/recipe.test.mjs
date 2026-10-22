import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecipe, writeRecipe, recipeReport } from '../src/recipe.mjs';
const recipe=()=>({version:1,source:{width:2400,height:1600},point:{x:.8,y:.45},allowUpscale:false,format:'image/png'});
test('recipes round trip and normalize away unrelated metadata',()=>{
  const input=recipe(); input.filename='private-name.jpg'; input.source.extra='discard';
  const output=writeRecipe(input);
  assert.equal(output.includes('private-name'),false);
  assert.deepEqual(readRecipe('\uFEFF'+output),recipe());
});
test('rejects incompatible image dimensions, unknown format, version and malformed input',()=>{
  assert.throws(()=>readRecipe(writeRecipe(recipe()),{width:1600,height:2400}),/dimensions/);
  for(const text of ['null','[]','{','x'.repeat(10001)]) assert.throws(()=>readRecipe(text));
  for(const mutate of [p=>{p.version=2;},p=>{p.format='image/svg+xml';},p=>{p.point.x=Infinity;},p=>{p.allowUpscale='true';}]) {
    const input=recipe(); mutate(input); assert.throws(()=>writeRecipe(input));
  }
});
test('receipt records reproducible crop windows and export readiness',()=>{
  const report=recipeReport(recipe());
  assert.equal(report.crops.length,3);
  const square=report.crops[0];
  assert.deepEqual(square.source,{x:800,y:0,width:1600,height:1600});
  assert.equal(square.canExport,true);
  const small=recipe(); small.source={width:400,height:300};
  assert.equal(recipeReport(small).crops.every(p=>!p.canExport),true);
});
