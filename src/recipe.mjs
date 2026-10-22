import { validateSize, validatePoint, planAll } from './core.mjs';
export const FORMATS = Object.freeze(['image/png', 'image/jpeg']);
export function validateRecipe(input, expectedSize) {
  if (!input || input.version !== 1 || !input.source) throw new Error('Use a Focalframe version 1 crop recipe.');
  const { width, height } = input.source;
  validateSize(width, height); validatePoint(input.point);
  if (typeof input.allowUpscale !== 'boolean' || !FORMATS.includes(input.format)) throw new Error('Recipe format or upscaling setting is invalid.');
  if (expectedSize && (width !== expectedSize.width || height !== expectedSize.height)) throw new Error('Recipe dimensions do not match the current image.');
  return { version: 1, source: { width, height }, point: { x: input.point.x, y: input.point.y }, allowUpscale: input.allowUpscale, format: input.format };
}
export function readRecipe(text, expectedSize) {
  if (typeof text !== 'string' || text.length > 10000) throw new Error('Recipes must be JSON text under 10,000 characters.');
  let input;
  try { input=JSON.parse(text.replace(/^\uFEFF/,'')); }
  catch { throw new Error('Invalid JSON. Use a crop recipe saved by Focalframe.'); }
  return validateRecipe(input, expectedSize);
}
export function writeRecipe(input) {
  return JSON.stringify(validateRecipe(input),null,2)+'\n';
}
export function recipeReport(input) {
  const recipe=validateRecipe(input);
  return { ...recipe, crops: planAll(recipe.source.width,recipe.source.height,recipe.point,recipe.allowUpscale) };
}
