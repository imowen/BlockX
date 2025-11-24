import { GridSettings } from './types';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const DEFAULT_SETTINGS: GridSettings = {
  rows: 3,
  cols: 3,
  format: 'png',
  cropMode: 'original',
  squareFit: 'center',
};

export const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
