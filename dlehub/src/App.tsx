import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import LexiLogic from './games/lexilogic';
import { Footer } from './components/Footer';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <div className="flex-1">
      {children}
    </div>
    <Footer />
  </div>
);

const LegalPage: React.FC<{ title: string }> = ({ title }) => (
  <MainLayout>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black mb-8 tracking-tight">{title}</h1>
      <div className="prose prose-neutral">
        <p className="text-lg text-neutral-600 leading-relaxed">
          Esta es una página de ejemplo para {title.toLowerCase()}. En una aplicación real, aquí se detallarían los términos legales correspondientes en español.
        </p>
      </div>
    </div>
  </MainLayout>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/juegos/lexilogic/*" element={<LexiLogic />} />
        
        <Route path="/legal/privacidad" element={<LegalPage title="Política de Privacidad" />} />
        <Route path="/legal/cookies" element={<LegalPage title="Política de Cookies" />} />
        <Route path="/legal/terminos" element={<LegalPage title="Términos y Condiciones" />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
