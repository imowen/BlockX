export type ExportFormat = 'png' | 'jpg' | 'webp';
export type CropMode = 'original' | 'square';
export type SquareFit = 'center' | 'stretch';

export interface ImageInfo {
  src: string;
  file: File;
  width: number;
  height: number;
  originalName: string;
}

export interface GridSettings {
  rows: number;
  cols: number;
  format: ExportFormat;
  cropMode: CropMode;
  squareFit: SquareFit;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0-100
  error: string | null;
}