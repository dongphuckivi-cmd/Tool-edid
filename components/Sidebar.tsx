
import React, { useState, useRef } from 'react';
import { Layers, Palette, CheckCircle2, ChevronRight, Eye, EyeOff, Wand2, CheckSquare, Square, Image as ImageIcon, X, Sliders, Sun, Contrast, Zap, Copy, Check, Loader2, Grid3X3, Minus, Hash, Cloud, Scissors, Link as LinkIcon, AlignJustify } from 'lucide-react';
import { FashionItem, GlobalSettings } from '../types';

interface SidebarProps {
  items: FashionItem[];
  selectedIndices: number[];
  onSelect: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateItem: (index: number, updates: Partial<FashionItem>) => void;
  onUpdateSelectedItems: (updates: Partial<FashionItem>) => void;
  onApply: () => void;
  isProcessing: boolean;
  toggleMasks: () => void;
  showMasks: boolean;
  globalSettings: GlobalSettings;
  onUpdateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
}

const FABRIC_PATTERNS = [
  { id: 'none', name: 'Trơn', icon: <Minus size={14} /> },
  { id: 'ribbed', name: 'Bo gân', icon: <AlignJustify size={14} className="rotate-90" /> },
  { id: 'stripes', name: 'Kẻ sọc', icon: <Hash size={14} /> },
  { id: 'plaid', name: 'Caro', icon: <Grid3X3 size={14} /> },
  { id: 'dots', name: 'Chấm bi', icon: <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center"><div className="w-1 h-1 bg-current rounded-full" /></div> },
  { id: 'floral', name: 'Hoa văn', icon: <Cloud size={14} /> }
];

const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  selectedIndices, 
  onSelect, 
  onSelectAll,
  onDeselectAll,
  onUpdateItem,
  onUpdateSelectedItems, 
  onApply, 
  isProcessing,
  toggleMasks,
  showMasks,
  globalSettings,
  onUpdateGlobalSettings
}) => {
  const isAllSelected = selectedIndices.length === items.length && items.length > 0;
  const hasSelection = selectedIndices.length > 0;
  
  const [refImage, setRefImage] = useState<string | null>(null);
  const refCanvasRef = useRef<HTMLCanvasElement>(null);
  const refImgRef = useRef<HTMLImageElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mainItems = items.filter(i => i.category === 'main');
  const detailItems = items.filter(i => i.category === 'detail');

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setRefImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const pickColorFromImage = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!refImgRef.current || !refCanvasRef.current) return;
    const img = refImgRef.current;
    const canvas = refCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
    onUpdateSelectedItems({ color: hex });
  };

  const syncDetailWithMain = (detailIdxInItems: number) => {
    // Tìm trang phục chính đầu tiên trong danh sách items
    const mainItem = items.find(i => i.category === 'main');
    if (mainItem) {
      onUpdateItem(detailIdxInItems, { 
        color: mainItem.color,
        pattern: mainItem.pattern,
        settings: { ...mainItem.settings }
      });
    }
  };

  const copyColorToAll = (color: string, id: string) => {
    onUpdateSelectedItems({ color });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const renderItemCard = (item: FashionItem) => {
    const itemIdx = items.findIndex(i => i.id === item.id);
    const isSelected = selectedIndices.includes(itemIdx);
    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => onSelect(itemIdx)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
            isSelected 
              ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/20' 
              : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'
          }`}>
            {item.category === 'main' ? <Palette size={12} /> : <Scissors size={12} />}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-[11px] font-semibold block truncate ${isSelected ? 'text-white' : 'text-slate-500'}`}>
              {item.name}
            </span>
            {item.category === 'detail' && (
              <span className="text-[8px] text-slate-600 uppercase font-bold tracking-wider">Vùng bo / Phụ trợ</span>
            )}
          </div>
          <div className="w-2.5 h-2.5 rounded-full border border-slate-700 shrink-0" style={{ backgroundColor: item.color }} />
        </button>
        {item.category === 'detail' && isSelected && (
          <button 
            onClick={(e) => { e.stopPropagation(); syncDetailWithMain(itemIdx); }}
            className="absolute -right-2 -top-2 p-1.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:scale-110 transition-transform z-30"
            title="Đồng bộ màu với thân áo"
          >
            <LinkIcon size={10} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. HẬU KỲ */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          <Sliders size={14} />
          Hậu kỳ hình ảnh
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Sun size={10} /> Độ sáng</span>
              <span>{globalSettings.brightness}%</span>
            </div>
            <input type="range" min="50" max="150" value={globalSettings.brightness} onChange={(e) => onUpdateGlobalSettings({ brightness: Number(e.target.value) })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Contrast size={10} /> Tương phản</span>
              <span>{globalSettings.contrast}%</span>
            </div>
            <input type="range" min="50" max="150" value={globalSettings.contrast} onChange={(e) => onUpdateGlobalSettings({ contrast: Number(e.target.value) })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>
        </div>
      </div>

      {/* 2. LỚP TRANG PHỤC PHÂN LOẠI */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Layers size={14} />
            Quản lý lớp ({items.length})
          </h3>
          <button onClick={toggleMasks} className={`p-2 rounded-lg transition-all ${showMasks ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
            {showMasks ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <div className="space-y-4">
          {mainItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight pl-1">Trang phục chính</span>
              <div className="grid gap-2">{mainItems.map(renderItemCard)}</div>
            </div>
          )}

          {detailItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight pl-1">Bo cổ, tay & Chi tiết</span>
              <div className="grid gap-2">{detailItems.map(renderItemCard)}</div>
            </div>
          )}
        </div>
        
        <button onClick={isAllSelected ? onDeselectAll : onSelectAll} className="w-full text-[10px] font-bold uppercase py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
          {isAllSelected ? <CheckSquare size={12} /> : <Square size={12} />}
          {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả vật thể'}
        </button>
      </div>

      {/* 3. BẢNG ĐIỀU KHIỂN CHI TIẾT */}
      {hasSelection && (
        <div className="flex flex-col gap-6 pt-6 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Wand2 size={14} />
              Chế độ phối màu AI
            </h3>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <Zap size={10} className="inline mr-1 text-amber-500" />
            Sử dụng họa tiết <b>Bo gân</b> cho vùng cổ/tay để đạt độ chân thực tối đa.
          </p>

          <div className="space-y-3">
            {!refImage ? (
              <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-900/50 transition-all cursor-pointer">
                <ImageIcon size={18} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Lấy màu từ mẫu</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleRefImageUpload} />
              </label>
            ) : (
              <div className="relative group overflow-hidden rounded-2xl border border-slate-800">
                <img ref={refImgRef} src={refImage} className="w-full max-h-32 object-contain bg-black cursor-crosshair" onClick={pickColorFromImage} />
                <button onClick={() => setRefImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {selectedIndices.map(idx => {
              const item = items[idx];
              return (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase truncate pr-2">
                      {item.category === 'detail' ? '⚪ ' : '👕 '}{item.name}
                    </span>
                    <button onClick={() => copyColorToAll(item.color, item.id)} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
                      {copiedId === item.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                      <input type="color" value={item.color} onChange={(e) => onUpdateItem(idx, { color: e.target.value })} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" />
                    </div>
                    <input type="text" value={item.color.toUpperCase()} onChange={(e) => onUpdateItem(idx, { color: e.target.value })} className="flex-1 bg-slate-800/50 border-none rounded-lg text-[11px] font-mono text-slate-300 py-2 px-3 uppercase focus:ring-1 focus:ring-indigo-500" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Họa tiết vải / Kết cấu</span>
                    <div className="grid grid-cols-3 gap-2">
                      {FABRIC_PATTERNS.map(pattern => (
                        <button key={pattern.id} onClick={() => onUpdateItem(idx, { pattern: pattern.id })} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${ (item.pattern || 'none') === pattern.id ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600' }`}>
                          {pattern.icon}
                          <span className="text-[8px] font-bold uppercase">{pattern.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500">
                        <span>Độ sáng</span>
                        <span>{item.settings.brightness}%</span>
                      </div>
                      <input type="range" min="0" max="200" value={item.settings.brightness} onChange={(e) => onUpdateItem(idx, { settings: { ...item.settings, brightness: Number(e.target.value) }})} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500">
                        <span>Bão hòa</span>
                        <span>{item.settings.saturation}%</span>
                      </div>
                      <input type="range" min="0" max="200" value={item.settings.saturation} onChange={(e) => onUpdateItem(idx, { settings: { ...item.settings, saturation: Number(e.target.value) }})} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={onApply} disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang Render 3D...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Xác nhận thay đổi ({selectedIndices.length})
              </>
            )}
          </button>
        </div>
      )}
      
      {!hasSelection && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <ChevronRight size={24} />
          </div>
          <p className="text-xs text-slate-500 px-8 leading-relaxed">Chọn trang phục chính hoặc vùng Bo cổ/tay để bắt đầu thiết kế</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
