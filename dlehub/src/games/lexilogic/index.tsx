import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DailyWordMode } from './modes/DailyWord';
import { DailyPhraseMode } from './modes/DailyPhrase';
import { TimeAttackMode } from './modes/TimeAttack';

const LexiLogic: React.FC = () => {
  return (
    <Routes>
      <Route path="palabra-del-dia" element={<DailyWordMode />} />
      <Route path="frase-del-dia" element={<DailyPhraseMode />} />
      <Route path="contrarreloj" element={<TimeAttackMode />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default LexiLogic;
