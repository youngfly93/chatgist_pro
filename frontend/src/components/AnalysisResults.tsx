import React, { useState } from 'react';
import { Microscope, Activity, ChevronLeft, ChevronRight, X, ZoomIn, Beaker, Dna } from 'lucide-react';

interface PhosphoAnalysis {
  status: string;
  data?: any;
  plot?: string;
  message: string;
  site?: string;
  survival_plot?: string;
  survival_data?: any;
  hasData?: boolean;
  hasPlot?: boolean;
  hasAnalyses?: boolean;
}

interface ComprehensiveAnalysis {
  status: string;
  analyses: {
    [key: string]: {
      status: string;
      plot?: string;
      data?: any;
      message: string;
    };
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface TranscriptomeAnalysis {
  status: string;
  data?: any;
  plot?: string;
  message: string;
  gene?: string;
  analysis_type?: string;
  correlation_coefficient?: number;
  p_value?: number;
  hasData?: boolean;
  hasPlot?: boolean;
  hasAnalyses?: boolean;
}

interface SingleCellAnalysis {
  status: string;
  data?: any;
  image_base64?: string;
  message: string;
  description?: string;
  gene?: string;
  dataset?: string;
  cell_types?: string[];
  plot_type?: string;
  summary?: string;
  hasData?: boolean;
  hasPlot?: boolean;
  hasAnalyses?: boolean;
}

interface ProteomicsAnalysis {
  status: string;
  data?: any;
  plot?: string;
  plots?: { [key: string]: string }; // 富集分析的多图片字段
  message: string;
  gene?: string;
  analysis_type?: string;
  analysis_name?: string;
  drug?: string;
  // 综合分析特有字段
  analyses?: {
    [key: string]: ProteomicsAnalysis;
  };
  summary?: {
    total: number;
    successful: number;
    failed: number;
    warnings: number;
  };
}

interface AnalysisResultsProps {
  phosphoAnalysis?: PhosphoAnalysis | ComprehensiveAnalysis;
  transcriptomeAnalysis?: TranscriptomeAnalysis;
  singleCellAnalysis?: SingleCellAnalysis;
  proteomicsAnalysis?: ProteomicsAnalysis;
}

// 图片放大模态框组件
const ImageModal: React.FC<{
  isOpen: boolean;
  imageUrl: string;
  imageName: string;
  onClose: () => void;
}> = ({ isOpen, imageUrl, imageName, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '95%',
          maxHeight: '95%',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
        >
          <X size={20} />
        </button>

        {/* 图片标题 */}
        <div
          style={{
            background: '#6b21d4',
            color: 'white',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center'
          }}
        >
          {imageName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>

        {/* 图片 */}
        <img
          src={imageUrl}
          alt={imageName}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: 'calc(95vh - 120px)'
          }}
        />
      </div>
    </div>
  );
};

// 通用图片轮播组件
interface ImageCarouselProps {
  images: Array<{ url: string; title: string }>;
  title?: string;
  primaryColor?: string;
}

const UnifiedImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  title = '分析结果图表',
  primaryColor = '#6b21d4'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  
  if (!images || images.length === 0) return null;
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div style={{ position: 'relative', margin: '16px 0' }}>
      {images.length > 1 && (
        <h6 style={{ 
          margin: '0 0 12px 0', 
          color: primaryColor, 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {title} ({currentIndex + 1} / {images.length})
        </h6>
      )}
      
      {/* 图片容器 */}
      <div style={{
        position: 'relative',
        background: '#f9fafb',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        {/* 当前图片标题 */}
        {images.length > 1 && (
          <div style={{
            padding: '12px 16px',
            background: primaryColor,
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {images[currentIndex].title}
          </div>
        )}
        
        {/* 图片 */}
        <div style={{ position: 'relative' }}>
          <img 
            src={images[currentIndex].url}
            alt={images[currentIndex].title}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              cursor: 'pointer'
            }}
            onClick={() => setModalOpen(true)}
          />
          
          {/* 放大图标提示 */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: 0.8
            }}
          >
            <ZoomIn size={12} />
            点击放大
          </div>
          
          {/* 左箭头 */}
          {images.length > 1 && (
            <button
              onClick={prevSlide}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {/* 右箭头 */}
          {images.length > 1 && (
            <button
              onClick={nextSlide}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
        
        {/* 指示器 */}
        {images.length > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            background: '#f9fafb'
          }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentIndex ? primaryColor : '#d1d5db',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* 图片放大模态框 */}
      <ImageModal
        isOpen={modalOpen}
        imageUrl={images[currentIndex].url}
        imageName={images[currentIndex].title}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

// 兼容旧的ImageCarousel组件
const ImageCarousel: React.FC<{ plots: { [key: string]: string } }> = ({ plots }) => {
  const plotEntries = Object.entries(plots).filter(([_, plotData]) => plotData);
  const images = plotEntries.map(([key, url]) => ({
    url,
    title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));
  
  return <UnifiedImageCarousel images={images} title="富集分析结果图表" primaryColor="#8b5cf6" />;
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  phosphoAnalysis,
  transcriptomeAnalysis,
  singleCellAnalysis,
  proteomicsAnalysis
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
  }>({ isOpen: false, imageUrl: '', imageName: '' });
  
  const openModal = (imageUrl: string, imageName: string) => {
    setModalState({ isOpen: true, imageUrl, imageName });
  };
  
  const closeModal = () => {
    setModalState({ isOpen: false, imageUrl: '', imageName: '' });
  };
  
  const hasAnyResults = phosphoAnalysis || transcriptomeAnalysis || singleCellAnalysis || proteomicsAnalysis;

  console.log('phosphoAnalysis:', phosphoAnalysis);
  console.log('transcriptomeAnalysis:', transcriptomeAnalysis);
  console.log('singleCellAnalysis:', singleCellAnalysis);
  console.log('proteomicsAnalysis:', proteomicsAnalysis);
  console.log('hasAnyResults:', hasAnyResults);

  // 判断是否为综合分析
  const isComprehensiveAnalysis = (analysis: PhosphoAnalysis | ComprehensiveAnalysis): analysis is ComprehensiveAnalysis => {
    return analysis && 'analyses' in analysis && 'summary' in analysis;
  };

  // 判断是否为蛋白质组学综合分析
  const isProteomicsComprehensiveAnalysis = (analysis: ProteomicsAnalysis): boolean => {
    return analysis && 'analyses' in analysis && 'summary' in analysis;
  };

  if (!hasAnyResults) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <Activity size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>暂无分析结果</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#9ca3af' }}>
          请在左侧对话框中提问，AI将为您生成相应的分析结果
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        overflowY: 'auto',
        height: '100%'
      }}>
        
        {/* 蛋白质组学分析结果 */}
        {proteomicsAnalysis && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            borderLeft: '4px solid #8b5cf6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Beaker size={20} />
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>蛋白质组学分析</h4>
            </div>
            <div style={{ padding: '16px' }}>
              {isProteomicsComprehensiveAnalysis(proteomicsAnalysis) ? (
                // 综合分析显示
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h5 style={{
                      margin: '0 0 8px 0',
                      color: '#374151',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>{proteomicsAnalysis.gene} 基因蛋白质组学综合分析</h5>
                    <p style={{
                      margin: '0 0 12px 0',
                      color: '#374151',
                      fontWeight: '500'
                    }}>{proteomicsAnalysis.message}</p>
                  </div>
                  
                  {proteomicsAnalysis.analyses && (() => {
                    // 收集所有成功的分析图片
                    const allImages: Array<{ url: string; title: string }> = [];
                    const analysisDetails: Array<{ type: string; status: string; message: string }> = [];
                    
                    console.log('Processing proteomics analyses:', proteomicsAnalysis.analyses);
                    
                    Object.entries(proteomicsAnalysis.analyses).forEach(([analysisType, analysis]) => {
                      analysisDetails.push({
                        type: analysisType,
                        status: analysis.status,
                        message: analysis.message
                      });
                      
                      console.log(`Analysis ${analysisType}:`, analysis);
                      
                      // 不管状态如何，只要有图片就收集
                      if (analysis.plot) {
                        console.log(`Found plot for ${analysisType}:`, analysis.plot.substring(0, 50));
                        allImages.push({ 
                          url: analysis.plot, 
                          title: analysisType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        });
                      }
                      if (analysis.plots) {
                        console.log(`Found plots object for ${analysisType}:`, Object.keys(analysis.plots));
                        Object.entries(analysis.plots).forEach(([plotType, plotUrl]) => {
                          if (plotUrl) {
                            allImages.push({ 
                              url: plotUrl, 
                              title: `${analysisType} - ${plotType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                            });
                          }
                        });
                      }
                    });
                    
                    console.log('Total images collected:', allImages.length);
                    
                    return (
                      <div>
                        {/* 分析状态概览 */}
                        <div style={{ 
                          marginBottom: '16px',
                          padding: '12px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                            分析完成情况：成功 {proteomicsAnalysis.summary.successful} / 总计 {proteomicsAnalysis.summary.total}
                          </h6>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {analysisDetails.map((detail, index) => (
                              <div key={index} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontSize: '13px'
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: detail.status === 'success' ? '#10b981' : '#ef4444'
                                }}></span>
                                <span style={{ fontWeight: '500', color: '#374151' }}>{detail.type}:</span>
                                <span style={{ color: '#6b7280' }}>{detail.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 所有图片的轮播图 */}
                        {allImages.length > 0 && (
                          <UnifiedImageCarousel 
                            images={allImages}
                            title="蛋白质组学综合分析图表"
                            primaryColor="#8b5cf6"
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // 单个分析显示
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#374151',
                    fontWeight: '500'
                  }}>{proteomicsAnalysis.message}</p>
                  
                  {/* 单个图片显示 */}
                  {proteomicsAnalysis.plot && (
                    <UnifiedImageCarousel 
                      images={[{ url: proteomicsAnalysis.plot, title: '蛋白质组学分析图' }]}
                      primaryColor="#8b5cf6"
                    />
                  )}
                  
                  {/* 富集分析图片轮播 */}
                  {proteomicsAnalysis.plots && Object.keys(proteomicsAnalysis.plots).length > 0 && (
                    <ImageCarousel plots={proteomicsAnalysis.plots} />
                  )}
                  
                  {proteomicsAnalysis.data && (
                    <details style={{ marginTop: '12px' }}>
                      <summary style={{
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>查看原始数据</summary>
                      <pre style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {JSON.stringify(proteomicsAnalysis.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 磷酸化分析结果 */}
        {phosphoAnalysis && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            borderLeft: '4px solid #f59e0b',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Microscope size={20} />
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>磷酸化分析</h4>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{
                margin: '0 0 12px 0',
                color: '#374151',
                fontWeight: '500'
              }}>{isComprehensiveAnalysis(phosphoAnalysis) ? '综合磷酸化分析完成' : phosphoAnalysis.message}</p>
              
              {/* 显示磷酸化位点数据表格 */}
              {!isComprehensiveAnalysis(phosphoAnalysis) && phosphoAnalysis.data && Array.isArray(phosphoAnalysis.data) && (
                <div style={{ 
                  margin: '12px 0', 
                  overflowX: 'auto',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ 
                          padding: '8px', 
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#111827'
                        }}>磷酸化位点</th>
                        <th style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#111827'
                        }}>肿瘤样本数</th>
                        <th style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#111827'
                        }}>肿瘤占比</th>
                        <th style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#111827'
                        }}>正常样本数</th>
                        <th style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#111827'
                        }}>正常占比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phosphoAnalysis.data.map((item: any, index: number) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ 
                            padding: '8px',
                            fontWeight: '500',
                            color: '#6b21d4'
                          }}>{item.PhosphoSites}</td>
                          <td style={{ 
                            padding: '8px', 
                            textAlign: 'center',
                            color: '#374151'
                          }}>{item['No..in.Tumor']}</td>
                          <td style={{ 
                            padding: '8px', 
                            textAlign: 'center',
                            color: '#374151'
                          }}>{item['Prop.in.Tumor']}</td>
                          <td style={{ 
                            padding: '8px', 
                            textAlign: 'center',
                            color: '#374151'
                          }}>{item['No..in.Normal']}</td>
                          <td style={{ 
                            padding: '8px', 
                            textAlign: 'center',
                            color: '#374151'
                          }}>{item['Prop.in.Normal']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {!isComprehensiveAnalysis(phosphoAnalysis) && phosphoAnalysis.plot && (
                <UnifiedImageCarousel 
                  images={[{ url: phosphoAnalysis.plot, title: '磷酸化分析图' }]}
                  primaryColor="#f59e0b"
                />
              )}
              
              {/* 综合分析结果展示 */}
              {isComprehensiveAnalysis(phosphoAnalysis) && phosphoAnalysis.analyses && (() => {
                // 收集所有成功的分析图片
                const allImages: Array<{ url: string; title: string }> = [];
                const analysisDetails: Array<{ type: string; status: string; message: string }> = [];
                
                console.log('Processing phospho analyses:', phosphoAnalysis.analyses);
                
                Object.entries(phosphoAnalysis.analyses).forEach(([analysisType, analysis]) => {
                  analysisDetails.push({
                    type: analysisType,
                    status: analysis.status,
                    message: analysis.message
                  });
                  
                  console.log(`Phospho analysis ${analysisType}:`, analysis);
                  
                  // 不管状态如何，只要有图片就收集
                  if (analysis.plot) {
                    console.log(`Found phospho plot for ${analysisType}`);
                    allImages.push({ 
                      url: analysis.plot, 
                      title: analysisType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    });
                  }
                });
                
                console.log('Total phospho images collected:', allImages.length);
                
                return (
                  <div>
                    {/* 分析状态概览 */}
                    <div style={{ 
                      marginBottom: '16px',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                        分析完成情况：成功 {phosphoAnalysis.summary.successful} / 总计 {phosphoAnalysis.summary.total}
                      </h6>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {analysisDetails.map((detail, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '13px'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: detail.status === 'success' ? '#10b981' : '#ef4444'
                            }}></span>
                            <span style={{ fontWeight: '500', color: '#374151' }}>{detail.type}:</span>
                            <span style={{ color: '#6b7280' }}>{detail.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 所有图片的轮播图 */}
                    {allImages.length > 0 && (
                      <UnifiedImageCarousel 
                        images={allImages}
                        title="磷酸化综合分析图表"
                        primaryColor="#f59e0b"
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 转录组分析结果 */}
        {transcriptomeAnalysis && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            borderLeft: '4px solid #10b981',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Dna size={20} />
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>转录组学分析</h4>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{
                margin: '0 0 12px 0',
                color: '#374151',
                fontWeight: '500'
              }}>{transcriptomeAnalysis.message}</p>
              {transcriptomeAnalysis.plot && (
                <UnifiedImageCarousel 
                  images={[{ url: transcriptomeAnalysis.plot, title: '转录组分析图' }]}
                  primaryColor="#10b981"
                />
              )}
            </div>
          </div>
        )}

        {/* 单细胞分析结果 */}
        {singleCellAnalysis && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            borderLeft: '4px solid #3b82f6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Activity size={20} />
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>单细胞分析</h4>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{
                margin: '0 0 12px 0',
                color: '#374151',
                fontWeight: '500'
              }}>{singleCellAnalysis.message}</p>
              {singleCellAnalysis.image_base64 && (
                <UnifiedImageCarousel 
                  images={[{ url: singleCellAnalysis.image_base64, title: '单细胞分析图' }]}
                  primaryColor="#3b82f6"
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 主图片放大模态框 */}
      <ImageModal
        isOpen={modalState.isOpen}
        imageUrl={modalState.imageUrl}
        imageName={modalState.imageName}
        onClose={closeModal}
      />
    </div>
  );
};

export default AnalysisResults;