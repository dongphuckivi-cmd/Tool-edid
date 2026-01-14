
import React from 'react';
import { X, Key, ExternalLink, ShieldCheck, Settings2, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManageKey: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onManageKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Settings2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Thiết lập hệ thống</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Key size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Google AI API Key</h3>
            </div>
            
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 space-y-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                Khóa của bạn được lưu trữ trong bộ nhớ cục bộ của trình duyệt và không bao giờ được gửi đi đâu ngoại trừ API của Google.
              </p>
              
              <div className="flex flex-col gap-2">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-indigo-400" />
                    Lấy khóa từ Google AI Studio
                  </span>
                  <ChevronRight size={14} className="text-slate-600" />
                </a>
              </div>
            </div>

            <button 
              onClick={() => {
                onManageKey();
                onClose();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Key size={18} />
              Quản lý danh sách khóa Google AI
            </button>
          </section>

          <section className="pt-6 border-t border-slate-800">
            <div className="flex gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <ShieldCheck className="shrink-0 text-indigo-400" size={20} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-300 uppercase">Cam kết bảo mật</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Ứng dụng này tuân thủ các quy tắc bảo mật của Google. Chúng tôi không thu thập hoặc lưu trữ bất kỳ thông tin nhạy cảm nào của bạn trên máy chủ bên thứ ba.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 px-1 text-[10px] text-slate-500 italic">
            <Info size={12} className="shrink-0 mt-0.5" />
            <p>Lưu ý: Bạn cần chọn một dự án đã được kích hoạt thanh toán (Paid Project) để sử dụng các tính năng nâng cao nếu được yêu cầu.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">
            Phiên bản chuyên nghiệp 2.5
          </p>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default SettingsModal;
