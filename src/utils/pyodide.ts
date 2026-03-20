import { loadPyodide, type PyodideInterface } from 'pyodide';

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Lazily load Pyodide runtime with retry logic.
 * Subsequent calls return the same instance.
 * @param onProgress - Optional callback to report loading progress (message, percentage)
 */
export async function getPyodide(
  onProgress?: (message: string, percentage: number) => void
): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const retryMsg = attempt > 1 ? ` (attempt ${attempt}/${MAX_RETRIES})` : '';

        console.log(`🐍 Loading Pyodide...${retryMsg}`);
        onProgress?.(`Loading Pyodide runtime...${retryMsg}`, 10);

        const pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
        });

        // Pyodide core loaded - 60% complete
        console.log('📦 Loading pandas, numpy...');
        onProgress?.('Loading pandas and numpy packages...', 60);
        await pyodide.loadPackage(['pandas', 'numpy']);

        // Install openpyxl via micropip (not in built-in packages)
        console.log('📦 Installing openpyxl via micropip...');
        onProgress?.('Installing openpyxl for Excel support...', 80);
        await pyodide.loadPackage(['micropip']);
        await pyodide.runPythonAsync(`
          import micropip
          await micropip.install('openpyxl')
        `);

        // Packages loaded - 100% complete
        console.log('✅ Pyodide ready!');
        onProgress?.('Analysis ready!', 100);
        pyodideInstance = pyodide;
        return pyodide;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Failed to load Pyodide (attempt ${attempt}/${MAX_RETRIES}):`, error);

        // Don't retry if we've exhausted attempts
        if (attempt === MAX_RETRIES) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }

    // Reset loading promise so user can retry manually
    loadingPromise = null;

    // Throw the last error with helpful context
    throw new Error(
      `Failed to load Pyodide after ${MAX_RETRIES} attempts. ${lastError?.message || 'Unknown error'}. ` +
      'Check your internet connection and try again.'
    );
  })();

  return loadingPromise;
}

/**
 * Run Python code and return the result as a JavaScript object.
 */
export async function runPython<T = unknown>(code: string): Promise<T> {
  const pyodide = await getPyodide();
  const result = await pyodide.runPythonAsync(code);
  return result;
}

/**
 * Check if Pyodide is currently loaded.
 */
export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}
