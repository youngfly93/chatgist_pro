import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AIChat from './pages/AIChat';
import TestComprehensive from './pages/TestComprehensive';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/test-comprehensive" element={<TestComprehensive />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2024 GIST AI - 基因信息智能助手</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;