import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { GridSettings, ImageInfo } from '../types';

/**
 * loads an image from a source string into an HTMLImageElement
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Calculates the dimensions of the image to be processed based on crop mode
 */
export const getProcessedDimensions = (
  imgWidth: number,
  imgHeight: number,
  cropMode: string
) => {
  let processWidth = imgWidth;
  let processHeight = imgHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (cropMode === 'square') {
    const minDim = Math.min(imgWidth, imgHeight);
    processWidth = minDim;
    processHeight = minDim;
    offsetX = (imgWidth - minDim) / 2;
    offsetY = (imgHeight - minDim) / 2;
  }

  return { width: processWidth, height: processHeight, offsetX, offsetY };
};

export const processAndDownload = async (
  imageInfo: ImageInfo,
  settings: GridSettings,
  selectedIndices: Set<number>,
  onProgress: (percent: number) => void
) => {
  const { src, originalName } = imageInfo;
  const { rows, cols, format, cropMode } = settings;

  try {
    const img = await loadImage(src);
    const zip = new JSZip();
    
    // Determine effective image area
    const { width: effectiveWidth, height: effectiveHeight, offsetX, offsetY } = 
      getProcessedDimensions(img.width, img.height, cropMode);

    const sliceWidth = effectiveWidth / cols;
    const sliceHeight = effectiveHeight / rows;

    const totalSlices = rows * cols;
    const slicesToExport = selectedIndices.size > 0 
      ? Array.from(selectedIndices) 
      : Array.from({ length: totalSlices }, (_, i) => i);

    let processedCount = 0;

    // We can't use OffscreenCanvas in all browsers reliably with strictly typed TS without config,
    // so we use a standard canvas element.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Could not create canvas context");

    canvas.width = sliceWidth;
    canvas.height = sliceHeight;

    for (const index of slicesToExport) {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Clear previous
      ctx.clearRect(0, 0, sliceWidth, sliceHeight);

      // Source X/Y calculation
      // sourceX = globalOffset + (col * sliceWidth)
      const sx = offsetX + (col * sliceWidth);
      const sy = offsetY + (row * sliceHeight);

      ctx.drawImage(
        img,
        sx, sy, sliceWidth, sliceHeight, // Source
        0, 0, sliceWidth, sliceHeight    // Dest
      );

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        canvas.toBlob(resolve, mimeType, 0.92);
      });

      if (blob) {
        const ext = format === 'jpg' ? 'jpg' : format;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const filename = `${nameWithoutExt}_${row + 1}_${col + 1}.${ext}`;
        zip.file(filename, blob);
      }

      processedCount++;
      onProgress(Math.round((processedCount / slicesToExport.length) * 50)); // First 50% is generation
    }

    onProgress(60);
    
    // Generate Zip
    const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        onProgress(60 + Math.round(metadata.percent * 0.4));
    });

    onProgress(100);
    const zipName = `${originalName.substring(0, originalName.lastIndexOf('.')) || 'sliced'}_grid.zip`;
    
    // Fix for file-saver export structure on some CDNs
    const saveAs = (FileSaver as any).saveAs || FileSaver;
    saveAs(content, zipName);

  } catch (error) {
    console.error("Slice generation failed", error);
    throw error;
  }
};