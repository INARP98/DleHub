import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl">D</div>
            <span className="text-xl font-black tracking-tighter text-neutral-900">DleHub</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-neutral-500">
            <Link to="/legal/privacidad" className="hover:text-indigo-600 transition-colors">Política de privacidad</Link>
            <Link to="/legal/terminos" className="hover:text-indigo-600 transition-colors">Términos de uso</Link>
            <Link to="/legal/cookies" className="hover:text-indigo-600 transition-colors">Cookies</Link>
            <a href="mailto:contacto@dlehub.com" className="hover:text-indigo-600 transition-colors">Contacto</a>
          </nav>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-100 text-center md:text-left">
          <p className="text-sm text-neutral-400 font-medium">
            © 2026 DleHub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
