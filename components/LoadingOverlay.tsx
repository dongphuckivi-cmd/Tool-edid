
import React from 'react';
import { Loader2, Sparkles, Wand2, Search } from 'lucide-react';
import { ProcessStatus } from '../types';

interface LoadingOverlayProps {
  status: ProcessStatus;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
  const getMessage = () => {
    switch (status) {
      case ProcessStatus.UPLOADING: return "Đang tải tài nguyên...";
      case ProcessStatus.DETECTING: return "Đang nhận diện trang phục...";
      case ProcessStatus.RECOLORING: return "Đang nhuộm màu vải nền...";
      default: return "Đang xử lý...";
    }
  };

  const getSubMessage = () => {
    switch (status) {
      case ProcessStatus.RECOLORING: return "AI đang bóc tách lớp hình in, logo và phụ kiện để giữ nguyên bản trong khi thay đổi màu vải.";
      case ProcessStatus.DETECTING: return "Hệ thống đang quét từng chi tiết từ bo cổ đến túi áo để xác định cấu trúc chính xác.";
      default: return "Mô hình AI đang phân tích ảnh để đảm bảo kết quả hoàn hảo đến từng pixel.";
    }
  };

  const getIcon = () => {
    switch (status) {
      case ProcessStatus.DETECTING: return <Search className="w-8 h-8 text-indigo-400 animate-bounce" />;
      case ProcessStatus.RECOLORING: return <Wand2 className="w-8 h-8 text-indigo-400 animate-pulse" />;
      default: return <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />;
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{getMessage()}</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto italic">
          {getSubMessage()}
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
};

export default LoadingOverlay;
