import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { BrickListView } from './components/BrickListView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list/:id" element={<BrickListView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
