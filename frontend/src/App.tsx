import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GeneInfo from './pages/GeneInfo';
import AIChat from './pages/AIChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gene-info" element={<GeneInfo />} />
            <Route path="/ai-chat" element={<AIChat />} />
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