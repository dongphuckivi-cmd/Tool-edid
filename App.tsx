
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, RotateCw, Download, Layers, Settings2, Trash2, CheckCircle2, Loader2, Sparkles, ChevronRight, History } from 'lucide-react';
import { detectFashionItems, recolorItemsWithAI } from './geminiService';
import { AppState, FashionItem, ProcessStatus, GlobalSettings } from './types';

// Components
import Sidebar from './components/Sidebar';
import ImageEditor from './components/ImageEditor';
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    items: [],
    selectedIndices: [],
    isProcessing: false,
    history: [],
    historyIndex: -1,
    showMasks: true,
    globalSettings: { ...DEFAULT_GLOBAL_SETTINGS }
  });

  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const addToHistory = (items: FashionItem[]) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push([...items.map(item => ({ ...item }))]);
    setState(prev => ({
      ...prev,
      history: newHistory,
      historyIndex: newHistory.length - 1
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setState(prev => ({ 
        ...prev, 
        image: base64, 
        items: [], 
        selectedIndices: [], 
        history: [], 
        historyIndex: -1,
        globalSettings: { ...DEFAULT_GLOBAL_SETTINGS }
      }));
      setStatus(ProcessStatus.DETECTING);
      setError(null);
      
      try {
        const detected = await detectFashionItems(base64);
        setState(prev => ({ ...prev, items: detected }));
        addToHistory(detected);
        setStatus(ProcessStatus.IDLE);
      } catch (err) {
        setError("Không thể phân tích hình ảnh. Vui lòng thử lại.");
        setStatus(ProcessStatus.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSelect = (index: number) => {
    setState(prev => {
      const newIndices = prev.selectedIndices.includes(index)
        ? prev.selectedIndices.filter(i => i !== index)
        : [...prev.selectedIndices, index];
      return { ...prev, selectedIndices: newIndices };
    });
  };

  const handleUpdateItem = (index: number, updates: Partial<FashionItem>) => {
    setState(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], ...updates };
      return { ...prev, items: newItems };
    });
  };

  const handleUpdateSelectedItems = (updates: Partial<FashionItem>) => {
    setState(prev => {
      const newItems = [...prev.items];
      prev.selectedIndices.forEach(idx => {
        newItems[idx] = { ...newItems[idx], ...updates };
      });
      return { ...prev, items: newItems };
    });
  };

  const handleUpdateGlobalSettings = (updates: Partial<GlobalSettings>) => {
    setState(prev => ({
      ...prev,
      globalSettings: { ...prev.globalSettings, ...updates }
    }));
  };

  const handleApplyRecolor = async () => {
    if (state.selectedIndices.length === 0 || !state.image) return;
    
    const selectedItems = state.selectedIndices.map(idx => state.items[idx]);
    setStatus(ProcessStatus.RECOLORING);
    setError(null);
    
    try {
      const newImage = await recolorItemsWithAI(state.image, selectedItems);
      setState(prev => ({ ...prev, image: newImage }));
      setStatus(ProcessStatus.IDLE);
      addToHistory(state.items);
    } catch (err: any) {
      setError(err.message || "Đổi màu bằng AI thất bại.");
      setStatus(ProcessStatus.IDLE);
    }
  };

  const undo = () => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      setState(prev => ({
        ...prev,
        items: state.history[newIndex],
        historyIndex: newIndex
      }));
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({
        ...prev,
        items: state.history[newIndex],
        historyIndex: newIndex
      }));
    }
  };

  const exportImage = () => {
    if (!state.image) return;
    const link = document.createElement('a');
    link.href = state.image;
    link.download = `thaymau-ai-by-tidien-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Header 
        onUpload={handleImageUpload} 
        onUndo={undo} 
        onRedo={redo} 
        onExport={exportImage}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
        hasImage={!!state.image}
      />

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center p-8">
          {state.image ? (
            <ImageEditor 
              image={state.image} 
              items={state.items} 
              selectedIndices={state.selectedIndices}
              onSelect={handleToggleSelect}
              showMasks={state.showMasks}
              globalSettings={state.globalSettings}
            />
          ) : (
            <div className="flex flex-col items-center gap-6 max-w-md text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Thay Màu AI by Tí Điên
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Tải ảnh lên để tự động nhận diện trang phục và thử nghiệm màu sắc với độ chi tiết chuyên nghiệp từ AI.
              </p>
              <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-3">
                <Upload size={20} />
                Chọn hình ảnh
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          )}
          
          {status !== ProcessStatus.IDLE && (
            <LoadingOverlay status={status} />
          )}

          {error && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md animate-bounce z-[110]">
              <Trash2 size={20} />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-2 hover:opacity-70">✕</button>
            </div>
          )}
        </div>

        <div className="w-96 border-l border-slate-800 bg-slate-950/50 backdrop-blur-xl overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-6 scrollbar-hide">
          {state.image && (
            <Sidebar 
              items={state.items}
              selectedIndices={state.selectedIndices}
              onSelect={handleToggleSelect}
              onSelectAll={() => setState(prev => ({ ...prev, selectedIndices: prev.items.map((_, i) => i) }))}
              onDeselectAll={() => setState(prev => ({ ...prev, selectedIndices: [] }))}
              onUpdateItem={handleUpdateItem}
              onUpdateSelectedItems={handleUpdateSelectedItems}
              onApply={handleApplyRecolor}
              isProcessing={status !== ProcessStatus.IDLE}
              toggleMasks={() => setState(prev => ({ ...prev, showMasks: !prev.showMasks }))}
              showMasks={state.showMasks}
              globalSettings={state.globalSettings}
              onUpdateGlobalSettings={handleUpdateGlobalSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
