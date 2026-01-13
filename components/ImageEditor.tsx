
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MousePointer2, Maximize2 } from 'lucide-react';
import { FashionItem, GlobalSettings } from '../types';

interface ImageEditorProps {
  image: string;
  items: FashionItem[];
  selectedIndices: number[];
  onSelect: (index: number) => void;
  showMasks: boolean;
  globalSettings: GlobalSettings;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  image, 
  items, 
  selectedIndices, 
  onSelect, 
  showMasks,
  globalSettings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tính toán bộ lọc CSS dựa trên cài đặt toàn cục
  const imageFilter = useMemo(() => {
    const { brightness, contrast, saturation, sharpness } = globalSettings;
    const effectiveContrast = contrast + (sharpness * 0.2);
    const effectiveBrightness = brightness - (sharpness * 0.05);
    
    return `brightness(${effectiveBrightness}%) contrast(${effectiveContrast}%) saturate(${saturation}%)`;
  }, [globalSettings]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoom = e.deltaY > 0 ? 0.9 : 1.1;
      applyZoom(zoom);
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const applyZoom = (factor: number) => {
    setScale(prev => Math.min(Math.max(0.1, prev * factor), 10));
  };

  const handleZoomIn = () => applyZoom(1.2);
  const handleZoomOut = () => applyZoom(0.8);
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Kéo bằng chuột giữa, phím Alt hoặc khi click vào nền (không có mask)
    if (e.button === 1 || e.altKey || (e.button === 0 && !showMasks)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden bg-[#0a0a0c]"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="relative shadow-2xl transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center'
        }}
      >
        <img 
          src={image} 
          alt="Original" 
          className="max-h-[85vh] w-auto block pointer-events-none rounded-lg transition-[filter] duration-200"
          style={{ filter: imageFilter }}
          onLoad={(e) => {
            const img = e.currentTarget;
            const container = containerRef.current;
            if (container) {
              const s = Math.min(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight) * 0.85;
              setScale(s);
            }
          }}
        />

        {showMasks && items.map((item, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(idx);
              }}
              className={`absolute cursor-pointer transition-all border-2 rounded-sm ${
                isSelected 
                  ? 'bg-indigo-500/30 border-indigo-400 ring-4 ring-indigo-400/20 z-20' 
                  : 'bg-transparent border-transparent hover:border-white/50 hover:bg-white/10 z-10'
              }`}
              style={{
                top: `${item.box.ymin / 10}%`,
                left: `${item.box.xmin / 10}%`,
                height: `${(item.box.ymax - item.box.ymin) / 10}%`,
                width: `${(item.box.xmax - item.box.xmin) / 10}%`,
              }}
            >
              {isSelected && (
                <div className="absolute -top-8 left-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bộ điều khiển Zoom nâng cao */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-50">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-2xl min-w-[300px]">
          <button 
            onClick={handleZoomOut}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Thu nhỏ"
          >
            <ZoomOut size={18} />
          </button>
          
          <div className="flex-1 flex flex-col gap-1">
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.01" 
              value={scale} 
              onChange={handleSliderChange}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
              <span>10%</span>
              <span className="text-indigo-400 font-mono">{(scale * 100).toFixed(0)}%</span>
              <span>500%</span>
            </div>
          </div>

          <button 
            onClick={handleZoomIn}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Phóng to"
          >
            <ZoomIn size={18} />
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-1" />

          <button 
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Khớp khung hình"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 z-50 flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800/50 shadow-lg">
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Ctrl + Wheel</kbd>
          <span>Zoom</span>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Chuột giữa / Alt</kbd>
          <span>Di chuyển</span>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
