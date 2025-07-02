import React from 'react';
import { HistoryLog } from '@/utils/types';

interface Props {
  log: HistoryLog;
  mode?: 'admin' | 'user' | 'summary' | 'detail';
}

const HistoryCard: React.FC<Props> = ({ log, mode }) => {
  const displayMode = mode === 'summary' ? 'user' : mode === 'detail' ? 'admin' : mode;
  return (
    <div className="border rounded p-3 mb-2 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-sm">{log.action}</span>
        <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
      </div>
      <div className="text-xs text-gray-700 mb-1">
        대상: {log.target_type} ({log.target_id})
      </div>
      <div className="text-xs text-gray-500">{log.meta_data && JSON.stringify(log.meta_data)}</div>
      {displayMode === 'admin' && <div className="mt-2 text-xs text-blue-500">관리자 모드</div>}
    </div>
  );
};

export default HistoryCard;
export { HistoryCard };
