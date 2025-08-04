# UI 组件库

## 加载动效组件

这个目录包含了多种加载动效组件，用于提升用户体验。

### LoaderThree - 三点跳动动效

最常用的加载动效，适合表示"AI正在思考"或"正在加载"状态。

```tsx
import { LoaderThree } from './ui/loader';

// 基本使用
<LoaderThree />

// 在聊天界面中使用
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <LoaderThree />
  <span>AI正在思考...</span>
</div>
```

### 其他可用的加载动效

#### LoaderSpinner - 旋转加载器
```tsx
import { LoaderSpinner } from './ui/loader';
<LoaderSpinner />
```

#### LoaderPulse - 脉冲动效
```tsx
import { LoaderPulse } from './ui/loader';
<LoaderPulse />
```

#### LoaderWave - 波浪动效
```tsx
import { LoaderWave } from './ui/loader';
<LoaderWave />
```

### 演示组件

#### LoaderThreeDemo
```tsx
import { LoaderThreeDemo } from '../components/LoaderThreeDemo';
<LoaderThreeDemo />
```

这是一个演示组件，与LoaderThree效果相同，可以用于快速测试。

### 已集成的组件

这些加载动效已经集成到以下组件中：

1. **FloatingChat** - 使用LoaderThree显示AI思考状态
2. **AIChat页面** - 使用LoaderThree显示加载状态

### 自定义样式

所有加载器都支持通过CSS自定义样式：

```tsx
// 自定义颜色
<div style={{ '--loader-color': '#ff6b6b' }}>
  <LoaderThree />
</div>

// 自定义大小
<div style={{ transform: 'scale(1.5)' }}>
  <LoaderThree />
</div>
```

### 测试页面

访问 `/loader-test` 路由可以查看所有加载动效的演示效果。

### 技术实现

- 使用CSS动画实现流畅的动效
- 支持styled-jsx进行样式隔离
- 轻量级实现，不依赖外部动画库
- 响应式设计，适配不同屏幕尺寸

### 最佳实践

1. **选择合适的动效**：
   - LoaderThree：通用加载状态，AI思考
   - LoaderSpinner：数据处理，文件上传
   - LoaderPulse：心跳状态，实时监控
   - LoaderWave：音频处理，数据流

2. **性能考虑**：
   - 避免同时显示多个复杂动效
   - 在组件卸载时及时清理动画

3. **用户体验**：
   - 配合文字说明使用
   - 避免动效时间过长
   - 提供取消操作的选项
