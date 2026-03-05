import * as fs from 'fs';
import * as path from 'path';

/**
 * Normaliza una frase:
 * - Mayúsculas
 * - Quita tildes (ÁÉÍÓÚÜ -> AEIOUU)
 * - Preserva Ñ
 * - Quita puntuación
 * - Colapsa espacios
 */
function normalizePhrase(phrase: string): string {
    return phrase
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u0301\u0308]/g, "") // Quita tildes y diéresis, pero no la virgulilla de la Ñ (u0303)
        .replace(/[^A-ZÑ\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Script para procesar frases del día.
 * Uso: npx tsx scripts/process-phrases.ts <input_file>
 */

const inputFile = process.argv[2];
if (!inputFile) {
    console.error('Por favor, proporciona un archivo de entrada.');
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    console.error(`No se encontró el archivo: ${inputFile}`);
    process.exit(1);
}

const rawContent = fs.readFileSync(inputFile, 'utf-8');
const lines = rawContent.split('\n');

const processed = new Set<string>();

lines.forEach(line => {
    const normalized = normalizePhrase(line);
    
    // Criterios de jugabilidad
    const letterCount = normalized.replace(/\s/g, "").length;
    const words = normalized.split(' ');
    
    // Filtros: longitud razonable, al menos 2 palabras, sin palabras excesivamente largas
    if (letterCount >= 10 && letterCount <= 50 && words.length >= 2) {
        const hasLongWord = words.some(w => w.length > 12);
        if (!hasLongWord) {
            processed.add(normalized);
        }
    }
});

const sortedPhrases = Array.from(processed).sort();

const publicDir = path.join(process.cwd(), 'public/lexilogic');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'daily-phrases.txt'), sortedPhrases.join('\n'));

console.log(`Procesadas ${sortedPhrases.length} frases válidas en public/lexilogic/daily-phrases.txt`);
