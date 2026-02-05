import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  OriginPage,
  CreateValentinePage,
  ReceiverPage,
  ResultsPage,
  MyValentinesPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OriginPage />} />
        <Route path="/create" element={<CreateValentinePage />} />
        <Route path="/v/:id" element={<ReceiverPage />} />
        <Route path="/r/:token" element={<ResultsPage />} />
        <Route path="/my-valentines" element={<MyValentinesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
