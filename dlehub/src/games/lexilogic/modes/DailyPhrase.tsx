import React, { useState, useEffect } from 'react';
import { GameContainer } from '../ui/GameContainer';
import { getDailyKey } from '../../../core/utils';
import { loadDailyPhrases } from '../engine/loader';
import { getDailyPhrase } from '../engine/logic';

export const DailyPhraseMode: React.FC = () => {
    const [solution, setSolution] = useState<string | null>(null);
    const dailyKey = `daily_phrase_${getDailyKey()}`;

    useEffect(() => {
        loadDailyPhrases().then(phrases => {
            const sol = getDailyPhrase(phrases, getDailyKey());
            setSolution(sol);
        });
    }, []);

    if (!solution) return null;

    return (
        <GameContainer 
            mode="phrase"
            solution={solution}
            wordLength={5}
            isDaily={true}
            dailyKey={dailyKey}
        />
    );
};
