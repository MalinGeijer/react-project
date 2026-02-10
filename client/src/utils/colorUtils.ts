export function probabilityToColor(prob: number) {
  // clamp
  const p = Math.max(0, Math.min(1, prob));

  const hueStart = 100;       // röd (spelar mindre roll för grå)
  const hueEnd = 140;         // röd
  const saturationStart = 10;
  const saturationEnd = 85;
  const lightnessStart = 80;
  const lightnessEnd = 35;

  const hue = hueStart + (hueEnd - hueStart) * p;
  const saturation = saturationStart + (saturationEnd - saturationStart) * p;
  const lightness = lightnessStart + (lightnessEnd - lightnessStart) * p;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
