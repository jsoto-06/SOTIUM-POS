import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Sparkles, Send, Bot, User, Brain, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export const EIAssistantModule: React.FC = () => {
  const { ordersHistory, products, ingredients, employees } = usePOS();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: '¡Hola! Soy Sotium AI, tu Asistente de Inteligencia Artificial especializado en gestión TPV y ERP para hostelería. ¿En qué te puedo ayudar hoy? Puedes hacerme preguntas sobre ventas, márgenes, previsión de compras o rendimiento del equipo.',
      time: new Date().toLocaleTimeString().substring(0, 5),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const predefinedPrompts = [
    '¿Cuánto vendimos hoy y cuál es la tendencia?',
    '¿Qué producto genera más beneficio bruto?',
    '¿Qué productos debo comprar para evitar desabastecimiento?',
    '¿Qué camarero vende más y tiene mayor ticket medio?',
    '¿Qué mesas rotan menos en el salón?',
    'Predicción automática de ventas para el fin de semana',
  ];

  const handleSend = async (promptToSend?: string) => {
    const query = promptToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, text: query, time: new Date().toLocaleTimeString().substring(0, 5) };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          context: {
            ordersCount: ordersHistory.length,
            productsCount: products.length,
            lowStockCount: ingredients.filter((i) => i.stock <= i.minStock).length,
            activeEmployees: employees.filter((e) => e.isClockedIn).length,
          },
        }),
      });

      const data = await response.json();
      const assistantMsg = {
        role: 'assistant' as const,
        text: data.answer || 'Respuesta generada por el motor de análisis de IA.',
        time: new Date().toLocaleTimeString().substring(0, 5),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: 'Se ha producido una interrupción en el servidor de IA. Mostrando análisis local de emergencia.',
          time: new Date().toLocaleTimeString().substring(0, 5),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Asistente IA Integrado (Sotium AI)</h2>
            <p className="text-xs text-slate-400">Impulsado por Gemini 3.6 Flash Server-side para analítica conversacional y predicción de ventas</p>
          </div>
        </div>

        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-mono">
          Model: gemini-3.6-flash (Server-Side)
        </span>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Quick Prompts Selector */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap mr-1">Sugerencias:</span>
          {predefinedPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs whitespace-nowrap border border-slate-700 transition-all shadow-sm"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  msg.role === 'assistant'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-white border border-slate-700'
                }`}
              >
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                  msg.role === 'assistant'
                    ? 'bg-slate-950 border border-slate-800 text-slate-200'
                    : 'bg-amber-500 text-slate-950 font-semibold'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span className={`text-[10px] block mt-2 text-right ${msg.role === 'assistant' ? 'text-slate-500' : 'text-slate-900/60'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs italic">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Sotium AI procesando analítica predictiva de la base de datos...</span>
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Escribe tu consulta sobre el negocio o escoge una sugerencia arriba..."
            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs disabled:opacity-50 transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Consultar IA</span>
          </button>
        </form>
      </div>
    </div>
  );
};
