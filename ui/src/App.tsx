import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import { AuthMiddleware } from './components/AuthMiddleware';

const App = () => (
  <AuthMiddleware>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  </AuthMiddleware>
);

export default App;

