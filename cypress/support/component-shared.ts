// Shared test data and utilities for component tests

export const cardSizes = [
  { sizeKey: 'tiny', height: '96px' },
  { sizeKey: 'small', height: '336px' },
  { sizeKey: 'meduim', height: '456px' },
  { sizeKey: 'large', height: '576px' },
  { sizeKey: 'giant', height: '696px' },
];

export const alertSizes = [
  { sizeKey: 'tiny', height: '72px' },
  { sizeKey: 'small', height: '92px' },
  { sizeKey: 'meduim', height: '112px' },
  { sizeKey: 'large', height: '132px' },
  { sizeKey: 'giant', height: '152px' },
];

export const colors = [
  { colorKey: 'primary', color: 'rgba(51, 102, 255, 1)' },
  { colorKey: 'success', color: 'rgba(0, 214, 143, 1)' },
  { colorKey: 'info', color: 'rgba(0, 149, 255, 1)' },
  { colorKey: 'warning', color: 'rgba(255, 170, 0, 1)' },
  { colorKey: 'danger', color: 'rgba(255, 61, 113, 1)' },
];

export const chatSizes = [
  { sizeKey: 'tiny', height: '216px' },
  { sizeKey: 'small', height: '336px' },
  { sizeKey: 'meduim', height: '456px' },
  { sizeKey: 'large', height: '576px' },
  { sizeKey: 'giant', height: '696px' },
];

// Helper function to convert hex to rgba
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#([A-Fa-f0-9]{3}){1,2}$/.exec(hex);
  if (!result) {
    throw new Error('Bad Hex');
  }

  let c = result[1].split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const color = parseInt(c.join(''), 16);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
