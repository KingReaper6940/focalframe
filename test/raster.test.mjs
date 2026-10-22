import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeCrop } from '../src/raster.mjs';
const source={width:400,height:300,image:{}};
test('blocked upscaling and unsupported format fail before allocating a canvas',async()=>{
  const forbidden=()=>{throw new Error('should not allocate');};
  await assert.rejects(encodeCrop(source,{x:.5,y:.5},'square',false,'image/png',forbidden),/needs upscaling/);
  await assert.rejects(encodeCrop(source,{x:.5,y:.5},'square',true,'image/gif',forbidden),/Unsupported/);
});
test('encoder fallback is rejected so file extensions never mislabel PNG as JPEG',async()=>{
  const canvas={getContext:()=>({drawImage(){},fillRect(){}}),toBlob:callback=>callback(new Blob(['pixels'],{type:'image/png'}))};
  await assert.rejects(encodeCrop(source,{x:.5,y:.5},'square',true,'image/jpeg',()=>canvas),/does not support/);
});
test('null encoding result produces a bounded useful error',async()=>{
  const canvas={getContext:()=>({drawImage(){},fillRect(){}}),toBlob:callback=>callback(null)};
  await assert.rejects(encodeCrop(source,{x:.5,y:.5},'square',true,'image/png',()=>canvas),/could not encode/);
});
