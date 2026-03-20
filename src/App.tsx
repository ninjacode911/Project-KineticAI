import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomePage } from '@/pages/HomePage';
import { SessionPage } from '@/pages/SessionPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/session/:exerciseId" element={<SessionPage />} />
        <Route path="/review/:exerciseId" element={<ReviewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export { App };
