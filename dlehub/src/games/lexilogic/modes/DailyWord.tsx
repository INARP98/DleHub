import React, { useState, useEffect } from 'react';
import { GameContainer } from '../ui/GameContainer';
import { getDailyKey } from '../../../core/utils';
import { loadWordLists } from '../engine/loader';
import { getDailySolution } from '../engine/logic';

export const DailyWordMode: React.FC = () => {
    const [solution, setSolution] = useState<string | null>(null);
    const dailyKey = `daily_word_${getDailyKey()}`;

    useEffect(() => {
        loadWordLists().then(lists => {
            const sol = getDailySolution(lists.solutions, getDailyKey());
            setSolution(sol);
        });
    }, []);

    if (!solution) return null;

    return (
        <GameContainer 
            mode="daily"
            solution={solution}
            isDaily={true}
            dailyKey={dailyKey}
        />
    );
};
