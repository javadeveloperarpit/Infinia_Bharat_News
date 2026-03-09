import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import SingleArticle from './pages/SingleArticle';
import AdminCMS from './pages/AdminCMS';
import Category from './pages/Category';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<SingleArticle />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/admin" element={<AdminCMS />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
