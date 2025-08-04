import React, { useState } from 'react';
import { LoaderThree, LoaderSpinner, LoaderPulse, LoaderWave } from '../components/ui/loader';
import { LoaderThreeDemo } from '../components/LoaderThreeDemo';

const LoaderTest: React.FC = () => {
  const [showLoaders, setShowLoaders] = useState(false);

  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        加载动效测试页面
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button
          onClick={() => setShowLoaders(!showLoaders)}
          style={{
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#357abd';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4a90e2';
          }}
        >
          {showLoaders ? '隐藏加载动效' : '显示加载动效'}
        </button>
      </div>

      {showLoaders && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          {/* LoaderThree */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>LoaderThree - 跳动圆点</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <LoaderThree />
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              三个跳动的圆点，适合表示"正在思考"或"正在加载"
            </p>
          </div>

          {/* LoaderThreeDemo */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>LoaderThreeDemo</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <LoaderThreeDemo />
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              演示组件，与LoaderThree相同效果
            </p>
          </div>

          {/* LoaderSpinner */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>LoaderSpinner - 旋转加载</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <LoaderSpinner />
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              经典的旋转加载器，适合表示数据处理中
            </p>
          </div>

          {/* LoaderPulse */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>LoaderPulse - 脉冲动效</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <LoaderPulse />
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              脉冲式缩放动效，适合表示心跳或活动状态
            </p>
          </div>

          {/* LoaderWave */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>LoaderWave - 波浪动效</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <LoaderWave />
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              波浪式条形动效，适合表示音频或数据流
            </p>
          </div>

          {/* 在聊天消息中的效果演示 */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
              在聊天界面中的效果演示
            </h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {/* 模拟聊天消息 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#666',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  🤖
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <LoaderThree />
                  <span>AI正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#333', marginBottom: '10px' }}>使用说明</h4>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
          这些加载动效已经集成到FloatingChat组件中。当AI正在处理请求时，会自动显示LoaderThree动效，
          为用户提供更好的视觉反馈体验。
        </p>
      </div>
    </div>
  );
};

export default LoaderTest;
