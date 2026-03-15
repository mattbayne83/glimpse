import { loadPyodide, type PyodideInterface } from 'pyodide';

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

/**
 * Lazily load Pyodide runtime.
 * Subsequent calls return the same instance.
 */
export async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    console.log('🐍 Loading Pyodide...');
    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
    });

    // Load required packages
    console.log('📦 Loading pandas, numpy...');
    await pyodide.loadPackage(['pandas', 'numpy']);

    console.log('✅ Pyodide ready!');
    pyodideInstance = pyodide;
    return pyodide;
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
