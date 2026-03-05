import { normalizeWord } from '../src/core/utils';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import spanishWords from 'an-array-of-spanish-words';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para procesar el diccionario de LexiLogic.
 * Genera valid-guesses.txt y solutions.txt en public/lexilogic/
 */

const PRESERVE_Ñ_IN_SOLUTIONS = true;
const TARGET_LENGTH = 5;

console.log('--- Iniciando procesamiento de diccionario ---');

const processedSet = new Set<string>();

spanishWords.forEach((word: string) => {
  const normalized = normalizeWord(word);
  if (normalized.length === TARGET_LENGTH && /^[A-ZÑ]+$/.test(normalized)) {
    processedSet.add(normalized);
  }
});

const validGuesses = Array.from(processedSet).sort();

// Heurística para soluciones
// 1. Filtrar palabras con letras infrecuentes
const baseSolutions = validGuesses.filter(word => {
  if (word.includes('K') || word.includes('W')) return false;
  if (!PRESERVE_Ñ_IN_SOLUTIONS && word.includes('Ñ')) return false;
  return true;
});

// 2. Priorizar palabras sin letras repetidas (más jugables/calidad)
const hasRepeatedLetters = (word: string) => new Set(word).size !== word.length;

const uniqueLetterSolutions = baseSolutions.filter(w => !hasRepeatedLetters(w));
const repeatedLetterSolutions = baseSolutions.filter(w => hasRepeatedLetters(w));

// Combinar priorizando las de letras únicas
let finalSolutions = [...uniqueLetterSolutions, ...repeatedLetterSolutions];

// El usuario pide entre 5.000 y 12.000. 
// Si tenemos menos de 12.000, las usamos todas (siempre que pasen los filtros básicos).
if (finalSolutions.length > 12000) {
  finalSolutions = finalSolutions.slice(0, 12000);
}

// Volver a ordenar alfabéticamente para que sea determinista
finalSolutions.sort();

const publicDir = path.join(__dirname, '../public/lexilogic');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'valid-guesses.txt'), validGuesses.join('\n'));
fs.writeFileSync(path.join(publicDir, 'solutions.txt'), finalSolutions.join('\n'));

console.log(`Total palabras válidas (guesses): ${validGuesses.length}`);
console.log(`Total soluciones (curadas): ${finalSolutions.length}`);

console.log('\nEjemplos de palabras válidas:', validGuesses.slice(100, 105).join(', '));
console.log('Ejemplos de soluciones:', finalSolutions.slice(100, 105).join(', '));

// Mini checks
if (validGuesses.length < 30000) {
  console.warn(`\n⚠️ ADVERTENCIA: El número de palabras válidas (${validGuesses.length}) es menor a 30.000 (Límite del paquete an-array-of-spanish-words).`);
}
if (finalSolutions.length < 5000) {
  console.warn(`⚠️ ADVERTENCIA: El número de soluciones (${finalSolutions.length}) es menor a 5.000.`);
}

console.log('\n--- Procesamiento completado con éxito ---');
