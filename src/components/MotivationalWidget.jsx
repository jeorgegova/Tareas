import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, Zap, RefreshCw } from 'lucide-react';

// === COMPONENTE DE API CON MANEJO DE ERRORES ===
const MotivationalWidget = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('normal');

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      console.log('🔄 Iniciando solicitud a la API...');

      let url = 'https://jsonplaceholder.typicode.com/posts/1';

      // Simular diferentes errores
      if (errorType === 'timeout') {
        url = 'https://httpstat.us/200?sleep=6000';
      } else if (errorType === 'error-404') {
        url = 'https://jsonplaceholder.typicode.com/posts/999999';
      } else if (errorType === 'error-500') {
        url = 'https://httpstat.us/500';
      } else if (errorType === 'conexion') {
        url = 'https://invalid-domain-that-does-not-exist-12345.com/api';
      } else if (errorType === 'json-invalido') {
        url = 'https://httpbin.org/html';
      } else {
        // Modo normal: obtener un ID aleatorio entre 1 y 100
        const randomId = Math.floor(Math.random() * 100) + 1;
        url = `https://dummyjson.com/quotes/${randomId}`;
      }

      const response = await fetch(url, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📊 Status HTTP:', response.status);

      // Manejo de errores HTTP específicos
      if (response.status === 401) {
        throw new Error('Error 401: No autorizado. Verifica tu API key.');
      }

      if (response.status === 429) {
        throw new Error('Error 429: Demasiadas solicitudes. Espera unos segundos.');
      }

      if (response.status === 503) {
        throw new Error('Error 503: Servidor en mantenimiento. Intenta más tarde.');
      }

      if (response.status === 404) {
        throw new Error('Error 404: Endpoint no encontrado.');
      }

      if (response.status === 500) {
        throw new Error('Error 500: Error interno del servidor.');
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Validar y procesar JSON
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);

      // Validación de datos
      if (!data || !data.quote) {
        throw new Error('Datos incompletos en la frase.');
      }

      setQuote(data);

    } catch (err) {
      let errorMsg = 'Error desconocido';

      // Manejo específico de diferentes tipos de error
      if (err.name === 'AbortError') {
        errorMsg = '⏱️ Timeout: La solicitud tardó más de 5 segundos. Verifica tu conexión.';
      } else if (err instanceof TypeError) {
        errorMsg = '🌐 Error de conexión: No se pudo conectar al servidor. Verifica tu internet.';
        console.error('TypeError detallado:', err);
      } else if (err.message.includes('JSON')) {
        errorMsg = '🔄 Error al procesar JSON: Respuesta del servidor inválida.';
      } else {
        errorMsg = err.message;
      }

      console.error('❌ Error capturado:', errorMsg);
      setError(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Frase Motivadora del Día</h2>
        </div>
        <button
          onClick={fetchQuote}
          disabled={loading}
          className="p-2 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
          title="Obtener nueva frase"
        >
          <RefreshCw className={`w-5 h-5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ESTADO: CARGANDO */}
      {loading && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          <p className="text-gray-600">Cargando frase inspiradora...</p>
        </div>
      )}

      {/* ESTADO: ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Error al cargar la frase</h4>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={fetchQuote}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTADO: ÉXITO */}
      {quote && !loading && !error && (
        <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-600">
          <p className="text-gray-800 italic text-sm leading-relaxed mb-2">"{quote.quote}"</p>
          <p className="text-gray-600 text-xs font-semibold">ID: {quote.id}</p>
        </div>
      )}

      {/* BOTONES PARA SIMULAR ERRORES */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">🧪 Simular escenarios:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setErrorType('normal'); setQuote(null); setError(null); fetchQuote(); }}
            className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition font-medium"
            title="Solicitud normal exitosa"
          >
            ✓ Normal
          </button>
          <button
            onClick={() => { setErrorType('timeout'); setQuote(null); setError(null); fetchQuote(); }}
            className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition font-medium"
            title="Simula timeout de 6 segundos"
          >
            ⏱ Timeout
          </button>
          <button
            onClick={() => { setErrorType('error-404'); setQuote(null); setError(null); fetchQuote(); }}
            className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition font-medium"
            title="Recurso no encontrado"
          >
            ✗ Error 404
          </button>
          <button
            onClick={() => { setErrorType('error-500'); setQuote(null); setError(null); fetchQuote(); }}
            className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-medium"
            title="Error interno del servidor"
          >
            ✗ Error 500
          </button>
          <button
            onClick={() => { setErrorType('conexion'); setQuote(null); setError(null); fetchQuote(); }}
            className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-medium"
            title="Error de conexión - dominio inválido"
          >
            🌐 Error Conexión
          </button>
          <button
            onClick={() => { setErrorType('json-invalido'); setQuote(null); setError(null); fetchQuote(); }}
            className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition font-medium"
            title="JSON inválido"
          >
            ⚠️ JSON Inválido
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotivationalWidget;