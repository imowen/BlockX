import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FORMATS } from '../constants';
import { ImageInfo } from '../types';
import Button from './ui/Button';

interface ImageUploaderProps {
  onImageSelected: (img: ImageInfo) => void;
  onError: (msg: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onError }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      onError("不支持的文件格式。请使用 PNG, JPG 或 WEBP。");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      onError("文件过大。最大限制为 10MB。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          src,
          file,
          width: img.width,
          height: img.height,
          originalName: file.name
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-300 ${
        isDragging ? 'border-apple-blue bg-apple-blue/5' : 'border-apple-border bg-white'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center mb-6 text-apple-subtext">
        <ImageIcon size={32} />
      </div>
      <h3 className="text-xl font-medium text-apple-text mb-2">上传图片</h3>
      <p className="text-apple-subtext mb-8 text-center max-w-xs">
        拖拽图片到这里，或者点击选择
        <br />
        <span className="text-xs mt-2 block">支持 JPG, PNG, WEBP (最大 10MB)</span>
      </p>
      
      <input 
        type="file" 
        ref={inputRef}
        className="hidden" 
        accept={SUPPORTED_FORMATS.join(',')}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      
      <Button onClick={() => inputRef.current?.click()} variant="primary" className="shadow-lg">
        <Upload size={18} className="mr-2" />
        选择照片
      </Button>
    </div>
  );
};

export default ImageUploader;