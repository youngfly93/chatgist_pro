import React from 'react';
import MiniChat from '../components/MiniChat';
import FloatingChat from '../components/FloatingChat';
import { LoaderThreeDemo } from '../components/LoaderThreeDemo';

const ChatDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        聊天组件动效演示
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* MiniChat 演示 */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#1C484C' }}>
            MiniChat 组件
          </h2>
          <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
            首页使用的迷你聊天组件，现在支持LoaderThree动效
          </p>
          <MiniChat 
            placeholder="在这里测试MiniChat的LoaderThree动效..."
            height="350px"
          />
        </div>

        {/* LoaderThree 演示 */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#1C484C' }}>
            LoaderThree 动效
          </h2>
          <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
            三点跳动加载动效，用于表示AI正在思考
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {/* 基础动效 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <LoaderThreeDemo />
              <span>基础LoaderThree动效</span>
            </div>

            {/* 聊天样式 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <LoaderThreeDemo />
              <span>AI正在思考...</span>
            </div>

            {/* 不同颜色 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              '--loader-color': '#28a745'
            } as React.CSSProperties}>
              <LoaderThreeDemo />
              <span>自定义颜色动效</span>
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1C484C' }}>
          使用说明
        </h3>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li><strong>MiniChat</strong>: 首页的迷你聊天组件，现在在加载时会显示LoaderThree动效</li>
          <li><strong>FloatingChat</strong>: 浮动聊天组件，也支持LoaderThree动效（右下角可见）</li>
          <li><strong>AIChat页面</strong>: 完整的AI聊天页面，同样集成了LoaderThree动效</li>
          <li><strong>LoaderThree</strong>: 三点跳动动效，可以单独使用或集成到其他组件中</li>
        </ul>
      </div>

      {/* 技术特性 */}
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#fff'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1C484C' }}>
          技术特性
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px',
          color: '#666'
        }}>
          <div>
            <strong>✨ 流畅动画</strong><br/>
            使用CSS keyframes实现流畅的跳动效果
          </div>
          <div>
            <strong>🎨 可自定义</strong><br/>
            支持自定义颜色、大小等样式属性
          </div>
          <div>
            <strong>📱 响应式</strong><br/>
            适配不同屏幕尺寸和设备
          </div>
          <div>
            <strong>⚡ 轻量级</strong><br/>
            纯CSS实现，无外部依赖
          </div>
        </div>
      </div>

      {/* 浮动聊天组件 */}
      <FloatingChat />
    </div>
  );
};

export default ChatDemo;
