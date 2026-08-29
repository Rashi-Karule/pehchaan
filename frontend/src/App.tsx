import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { OfficerReviewPage } from './pages/OfficerReviewPage';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#EAEBE3] text-[#1B2430] dark:bg-[#14161C] dark:text-[#EAEBE3] flex flex-col antialiased selection:bg-[#1B2430] selection:text-[#EAEBE3] dark:selection:bg-[#EAEBE3] dark:selection:text-[#14161C] transition-colors duration-200">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/analysis/:documentId" element={<AnalysisResultPage />} />
              <Route path="/review/:caseId" element={<OfficerReviewPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
