
import React, { useState } from 'react';
import { Upload, RotateCcw, RotateCw, Download, Sparkles, Coffee, QrCode, X, Settings } from 'lucide-react';

interface HeaderProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasImage: boolean;
}

const Header: React.FC<HeaderProps> = ({ onUpload, onUndo, onRedo, onExport, onOpenSettings, canUndo, canRedo, hasImage }) => {
  const [showQR, setShowQR] = useState(false);

  // Link VietQR: MB Bank - 0919232652 - Compact template
  const qrUrl = "https://img.vietqr.io/image/MB-0919232652-compact2.png?addInfo=Moi%20Ti%20Dien%20Ca%20Phe&accountName=TRUONG%20DUC%20TUAN";

  return (
    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950 shrink-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              Thay Màu <span className="text-indigo-400">AI</span> 
              <span className="text-[10px] font-normal text-slate-400 ml-2 italic">by Tí Điên</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] mt-1">Trí tuệ thời trang</p>
          </div>
        </div>

        {/* Phần Donate - Mời Cà Phê */}
        <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-slate-800 h-10 relative">
          <div className="w-9 h-9 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 ring-1 ring-amber-500/20">
            <Coffee size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                ☕ Mời Tí Điên ly Cà Phê
              </span>
              <button 
                onMouseEnter={() => setShowQR(true)}
                onMouseLeave={() => setShowQR(false)}
                onClick={() => setShowQR(!showQR)}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Quét mã QR"
              >
                <QrCode size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">MB BANK</span>
              <span className="text-[11px] font-mono font-bold text-indigo-300">0919232652</span>
              <span className="text-[10px] font-medium text-slate-500 truncate max-w-[120px]">TRUONG DUC TUAN</span>
            </div>
          </div>

          {/* QR Code Popover */}
          {showQR && (
            <div className="absolute top-12 left-6 w-64 p-4 bg-white rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-900 uppercase">Quét để mời cafe ☕</span>
                <button onClick={() => setShowQR(false)} className="text-slate-400 hover:text-slate-600 lg:hidden">
                  <X size={14} />
                </button>
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                <img src={qrUrl} alt="VietQR" className="w-full h-full object-contain" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-[10px] font-bold text-indigo-600 leading-tight">MB Bank - 0919232652</p>
                <p className="text-[10px] font-medium text-slate-500">TRUONG DUC TUAN</p>
              </div>
              <div className="absolute -top-1 left-4 w-3 h-3 bg-white rotate-45 border-l border-t border-slate-200" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
          title="Cài đặt hệ thống"
        >
          <Settings size={20} />
        </button>

        {hasImage && (
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            <button 
              onClick={onUndo} 
              disabled={!canUndo}
              className="p-3 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all text-slate-400 hover:text-white"
              title="Hoàn tác"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={onRedo} 
              disabled={!canRedo}
              className="p-3 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all text-slate-400 hover:text-white"
              title="Làm lại"
            >
              <RotateCw size={20} />
            </button>
          </div>
        )}

        {hasImage && (
          <label className="cursor-pointer text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl transition-all">
            <Upload size={18} />
            <span className="text-sm font-medium">Dự án mới</span>
            <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
          </label>
        )}
        
        {hasImage && (
          <button 
            onClick={onExport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Download size={18} />
            <span>Xuất kết quả</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
