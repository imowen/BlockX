import React, { useRef } from 'react';
import { GridSettings, ImageInfo, ProcessingState } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { RefreshCw, Download, Grid, Crop, AlertCircle, ImageOff } from 'lucide-react';
import { processAndDownload } from '../utils/imageProcessing';

interface SidebarProps {
  imageInfo: ImageInfo | null;
  settings: GridSettings;
  setSettings: React.Dispatch<React.SetStateAction<GridSettings>>;
  onReset: () => void;
  selectedCount: number;
  totalSlices: number;
  processingState: ProcessingState;
  setProcessingState: React.Dispatch<React.SetStateAction<ProcessingState>>;
  selectedIndices: Set<number>;
  onSelectAll: () => void;
  onResetSelection: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  imageInfo,
  settings,
  setSettings,
  onReset,
  selectedCount,
  totalSlices,
  processingState,
  setProcessingState,
  selectedIndices,
  onSelectAll,
  onResetSelection
}) => {
  const isDisabled = !imageInfo;

  const handleDownload = async () => {
    if (!imageInfo) return;

    setProcessingState({ isProcessing: true, progress: 0, error: null });
    try {
      await processAndDownload(
        imageInfo, 
        settings, 
        selectedIndices, 
        (p) => setProcessingState(prev => ({ ...prev, progress: p }))
      );
    } catch (e) {
      setProcessingState(prev => ({ ...prev, error: '下载失败，请重试。' }));
    } finally {
      setTimeout(() => {
        setProcessingState({ isProcessing: false, progress: 0, error: null });
      }, 1000);
    }
  };

  const handleInputChange = (field: keyof GridSettings, value: number | string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-10 transition-opacity duration-300 ${isDisabled ? 'opacity-75' : 'opacity-100'}`}>
      
      {/* 1. Image Info Module */}
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 overflow-hidden">
            <h4 className="font-semibold text-sm text-apple-subtext uppercase tracking-wider mb-1">图片来源</h4>
            {imageInfo ? (
              <>
                <p className="font-medium truncate" title={imageInfo.originalName}>
                  {imageInfo.originalName}
                </p>
                <p className="text-xs text-apple-subtext mt-1">
                  {imageInfo.width} × {imageInfo.height} px
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-apple-subtext py-1">
                <ImageOff size={16} />
                <span className="text-sm">等待上传...</span>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            onClick={onReset} 
            className="h-8 w-8 p-0 rounded-full" 
            title="重新上传"
            disabled={isDisabled}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </Card>

      {/* 2. Slicing Parameters */}
      <Card>
         <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm text-apple-subtext uppercase tracking-wider flex items-center gap-2">
                <Grid size={14} /> 网格布局
            </h4>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className={`text-xs font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>列数 (横向)</label>
               <input 
                 type="number" 
                 min="1" 
                 max="20"
                 disabled={isDisabled}
                 value={settings.cols}
                 onChange={(e) => handleInputChange('cols', Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-full px-3 py-2 bg-apple-gray rounded-lg text-center font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               />
            </div>
            <div className="space-y-1">
               <label className={`text-xs font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>行数 (纵向)</label>
               <input 
                 type="number" 
                 min="1" 
                 max="20"
                 disabled={isDisabled}
                 value={settings.rows}
                 onChange={(e) => handleInputChange('rows', Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-full px-3 py-2 bg-apple-gray rounded-lg text-center font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               />
            </div>
         </div>

         <div className="flex gap-2 mt-4">
            <Button 
                variant="secondary" 
                onClick={onSelectAll} 
                className="flex-1 text-xs py-2 h-auto"
                disabled={isDisabled}
            >
               全选
            </Button>
            <Button 
                variant="outline" 
                onClick={onResetSelection} 
                className="flex-1 text-xs py-2 h-auto"
                disabled={isDisabled}
            >
               重置选中
            </Button>
         </div>

         <div className="mt-4 pt-4 border-t border-apple-border/40 text-center">
            <span className="text-xs text-apple-subtext">切片总数: </span>
            <span className="font-semibold text-apple-text">{settings.cols * settings.rows}</span>
         </div>
      </Card>

      {/* 3. Crop & Format */}
      <Card>
        <h4 className="font-semibold text-sm text-apple-subtext uppercase tracking-wider mb-4 flex items-center gap-2">
            <Crop size={14} /> 设置
         </h4>

         <div className="space-y-4">
            <div className="flex flex-col gap-2">
               <label className={`text-xs font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>裁剪模式</label>
               <div className="flex bg-apple-gray p-1 rounded-xl">
                  <button 
                    disabled={isDisabled}
                    onClick={() => handleInputChange('cropMode', 'original')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${settings.cropMode === 'original' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-subtext hover:text-apple-text'}`}
                  >
                    原比例
                  </button>
                  <button 
                    disabled={isDisabled}
                    onClick={() => handleInputChange('cropMode', 'square')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${settings.cropMode === 'square' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-subtext hover:text-apple-text'}`}
                  >
                    正方形
                  </button>
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <label className={`text-xs font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>导出格式</label>
               <div className="flex bg-apple-gray p-1 rounded-xl">
                  {(['png', 'jpg', 'webp'] as const).map(fmt => (
                    <button 
                      key={fmt}
                      disabled={isDisabled}
                      onClick={() => handleInputChange('format', fmt)}
                      className={`flex-1 py-1.5 text-xs font-medium uppercase rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${settings.format === fmt ? 'bg-white shadow-sm text-apple-text' : 'text-apple-subtext hover:text-apple-text'}`}
                    >
                      {fmt}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </Card>

      {/* 4. Download Action */}
      <div className="mt-auto">
        {processingState.error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {processingState.error}
            </div>
        )}

        <Button 
            onClick={handleDownload} 
            variant="primary" 
            className="w-full h-14 text-base shadow-lg shadow-apple-blue/20"
            isLoading={processingState.isProcessing}
            disabled={isDisabled || processingState.isProcessing}
        >
            {!processingState.isProcessing && (
                <>
                    <Download size={20} className="mr-2" />
                    {selectedCount > 0 
                      ? `下载选中 (${selectedCount})` 
                      : `下载全部 (${totalSlices})`
                    }
                </>
            )}
        </Button>
        
        {processingState.isProcessing && (
            <div className="mt-3">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-apple-blue transition-all duration-300 ease-out"
                        style={{ width: `${processingState.progress}%` }}
                    />
                </div>
                <p className="text-center text-xs text-apple-subtext mt-2">正在打包 ZIP... {processingState.progress}%</p>
            </div>
        )}

        <p className="text-center text-[10px] text-apple-subtext mt-4 opacity-60">
            全部在本地浏览器中处理，保护您的隐私。
        </p>
      </div>
    </div>
  );
};

export default Sidebar;