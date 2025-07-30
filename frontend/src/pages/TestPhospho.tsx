import React, { useState } from 'react';
import axios from 'axios';

const TestPhospho: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [gene, setGene] = useState('KIT');
  const [analysisType, setAnalysisType] = useState('query');

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let body: any = { gene };
      
      // 根据分析类型选择正确的端点
      if (analysisType === 'query') {
        endpoint = '/api/phospho/query';
      } else if (analysisType.startsWith('boxplot_')) {
        endpoint = '/api/phospho/boxplot';
        body.type = analysisType.replace('boxplot_', '');
      } else if (analysisType === 'survival') {
        endpoint = '/api/phospho/survival';
      }
      
      const response = await axios.post(`http://localhost:8000${endpoint}`, body);
      setResult(response.data);
    } catch (error: any) {
      setResult({ 
        error: error.response?.data?.error || error.message,
        details: error.response?.data?.details 
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>磷酸化分析直接测试</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={gene} 
          onChange={(e) => setGene(e.target.value)}
          placeholder="基因名称"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        
        <select 
          value={analysisType} 
          onChange={(e) => setAnalysisType(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="query">查询磷酸化位点</option>
          <option value="boxplot_TvsN">肿瘤vs正常</option>
          <option value="boxplot_Risk">风险分析</option>
          <option value="survival">生存分析</option>
        </select>
        
        <button 
          onClick={testDirectAPI} 
          disabled={loading}
          style={{ padding: '5px 15px' }}
        >
          {loading ? '分析中...' : '执行分析'}
        </button>
      </div>
      
      {result && (
        <div>
          <h3>分析结果：</h3>
          {result.plot && (
            <img src={result.plot} alt="分析图表" style={{ maxWidth: '100%' }} />
          )}
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestPhospho;