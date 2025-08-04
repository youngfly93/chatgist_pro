import React from 'react';

// LoaderThree 组件 - 三个跳动的圆点动画
export const LoaderThree: React.FC = () => {
  return (
    <div className="loader-three">
      <div className="dot dot1"></div>
      <div className="dot dot2"></div>
      <div className="dot dot3"></div>
      
      <style>{`
        .loader-three {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #4a90e2;
          animation: bounce 1.4s ease-in-out infinite both;
        }
        
        .dot1 {
          animation-delay: -0.32s;
        }
        
        .dot2 {
          animation-delay: -0.16s;
        }
        
        .dot3 {
          animation-delay: 0s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// LoaderSpinner 组件 - 旋转加载器
export const LoaderSpinner: React.FC = () => {
  return (
    <div className="loader-spinner">
      <div className="spinner"></div>
      
      <style>{`
        .loader-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e0e0e0;
          border-top: 2px solid #4a90e2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// LoaderPulse 组件 - 脉冲加载器
export const LoaderPulse: React.FC = () => {
  return (
    <div className="loader-pulse">
      <div className="pulse-dot"></div>
      
      <style>{`
        .loader-pulse {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }
        
        .pulse-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #4a90e2;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

// LoaderWave 组件 - 波浪加载器
export const LoaderWave: React.FC = () => {
  return (
    <div className="loader-wave">
      <div className="wave-bar bar1"></div>
      <div className="wave-bar bar2"></div>
      <div className="wave-bar bar3"></div>
      <div className="wave-bar bar4"></div>
      <div className="wave-bar bar5"></div>
      
      <style>{`
        .loader-wave {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 8px;
        }
        
        .wave-bar {
          width: 3px;
          height: 16px;
          background-color: #4a90e2;
          border-radius: 2px;
          animation: wave 1.2s ease-in-out infinite;
        }
        
        .bar1 { animation-delay: 0s; }
        .bar2 { animation-delay: 0.1s; }
        .bar3 { animation-delay: 0.2s; }
        .bar4 { animation-delay: 0.3s; }
        .bar5 { animation-delay: 0.4s; }
        
        @keyframes wave {
          0%, 40%, 100% {
            transform: scaleY(0.4);
            opacity: 0.5;
          }
          20% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// 默认导出LoaderThree
export default LoaderThree;
