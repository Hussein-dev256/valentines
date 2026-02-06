import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OriginPage from './pages/OriginPage';
import CreateValentinePage from './pages/CreateValentinePage';
import CreatedPromptPage from './pages/CreatedPromptPage';
import ReceiverPage from './pages/ReceiverPage';
import ResultsPage from './pages/ResultsPage';
import MyValentinesPage from './pages/MyValentinesPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OriginPage />} />
        <Route path="/create" element={<CreateValentinePage />} />
        <Route path="/created/:id" element={<CreatedPromptPage />} />
        <Route path="/v/:id" element={<ReceiverPage />} />
        <Route path="/r/:token" element={<ResultsPage />} />
        <Route path="/my-valentines" element={<MyValentinesPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
