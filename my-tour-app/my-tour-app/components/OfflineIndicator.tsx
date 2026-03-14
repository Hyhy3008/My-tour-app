'use client';

import { WifiOff } from 'lucide-react';

export default function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-[2000] offline-banner text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff size={16} />
      Đang offline - Sử dụng dữ liệu đã lưu
    </div>
  );
}
