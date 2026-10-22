import { mkdir, writeFile } from 'node:fs/promises';
import { writeRecipe, recipeReport } from '../src/recipe.mjs';
const recipe={version:1,source:{width:2400,height:1600},point:{x:.72,y:.5},allowUpscale:false,format:'image/png'};
await mkdir('examples',{recursive:true});
await writeFile('examples/demo-recipe.json',writeRecipe(recipe));
await writeFile('examples/demo-report.json',JSON.stringify(recipeReport(recipe),null,2)+'\n');
console.log('Generated demo recipe and pixel-coordinate report.');
