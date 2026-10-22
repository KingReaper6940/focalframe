export const MAX_SIDE = 8000;
export const MAX_PIXELS = 16000000;
export const MAX_BYTES = 10 * 1024 * 1024;
export const PRESETS = Object.freeze([
  Object.freeze({ id: 'square', name: 'Square', width: 1080, height: 1080, ratio: '1:1' }),
  Object.freeze({ id: 'portrait', name: 'Portrait', width: 1080, height: 1350, ratio: '4:5' }),
  Object.freeze({ id: 'wide', name: 'Wide', width: 1600, height: 900, ratio: '16:9' })
]);
export function validateSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS) {
    throw new Error('Use an image up to 8,000 pixels per side and 16 megapixels in total.');
  }
}
export function validatePoint(point) {
  if (!point || typeof point !== 'object' || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
    throw new Error('Focal coordinates must be numbers between 0 and 1.');
  }
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function planCrop(width, height, point, presetId, allowUpscale = false) {
  validateSize(width, height); validatePoint(point);
  if (typeof allowUpscale !== 'boolean') throw new Error('Upscaling must be true or false.');
  const preset = PRESETS.find(item => item.id === presetId);
  if (!preset) throw new Error('Unknown crop format.');
  const ratio = preset.width / preset.height;
  const cropWidth = Math.min(width, height * ratio);
  const cropHeight = cropWidth / ratio;
  const x = clamp(point.x * width - cropWidth / 2, 0, width - cropWidth);
  const y = clamp(point.y * height - cropHeight / 2, 0, height - cropHeight);
  const scale = preset.width / cropWidth;
  const upscaled = scale > 1 + 1e-9;
  return { preset: { ...preset }, source: { x, y, width: cropWidth, height: cropHeight }, scale, upscaled, canExport: allowUpscale || !upscaled };
}
export function planAll(width, height, point, allowUpscale = false) {
  return PRESETS.map(preset => planCrop(width, height, point, preset.id, allowUpscale));
}
