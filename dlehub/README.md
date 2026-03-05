# LexiLogic - Gestión de Diccionarios

Este proyecto utiliza un sistema de diccionarios dinámicos para el juego LexiLogic. Para garantizar una buena experiencia, el juego requiere un diccionario de palabras válidas de al menos 30,000 palabras de 5 letras.

## Generación de Diccionarios

Si los archivos en `public/lexilogic/` son insuficientes o quieres actualizarlos, sigue estos pasos:

1. **Preparar el archivo fuente**:
   - Consigue un archivo de texto con una lista extensa de palabras en español (una por línea).
   - Colócalo en `scripts/input/spanish_words.txt` (crea la carpeta si no existe).

2. **Ejecutar el script de procesamiento**:
   - Ejecuta el siguiente comando desde la raíz del proyecto:
     ```bash
     npm run build:wordlists
     ```
   - El script realizará las siguientes tareas:
     - Normalización: Convertirá a mayúsculas y eliminará tildes (ÁÉÍÓÚÜ -> AEIOUU), preservando la Ñ.
     - Filtrado: Seleccionará solo palabras de exactamente 5 letras.
     - Limpieza: Eliminará duplicados y tokens con caracteres no permitidos (números, guiones, etc.).
     - Generación: Creará `public/lexilogic/valid-guesses.txt` (todas las palabras) y `public/lexilogic/solutions.txt` (una selección de 2,000-5,000 palabras para usar como solución).

3. **Verificación**:
   - El script imprimirá en la consola el número total de palabras procesadas.
   - Al iniciar el juego en modo desarrollo, verás en la consola del navegador: `Valid-guesses cargadas: X, Solutions cargadas: Y`.

## Requisitos del Diccionario

- **Mínimo**: 30,000 palabras en `valid-guesses.txt`.
- **Objetivo**: 60,000 palabras.
- **Soluciones**: 2,000 - 5,000 palabras en `solutions.txt`.

Si el número de palabras válidas es inferior a 30,000, el juego mostrará un error y bloqueará el inicio para evitar que palabras comunes sean rechazadas.
