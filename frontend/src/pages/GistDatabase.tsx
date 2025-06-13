import React from 'react';
import FloatingChat from '../components/FloatingChat';

const GistDatabase: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <iframe
        src="http://117.72.75.45/dbGIST_shiny/"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="GIST Database"
      />
      
      {/* 浮动AI助手 */}
      <FloatingChat />
    </div>
  );
};

export default GistDatabase;