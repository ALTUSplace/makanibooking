import { useState } from 'react';
import { Bot, X, Send, Car, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

type ChatMessage = { sender: 'ai' | 'user'; text: string };

const interpolate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template);

export default function AIChatWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{ sender: 'ai', text: t('aiGreeting') }]);
  const [inputVal, setInputVal] = useState('');
  const [step, setStep] = useState<'category' | 'city' | 'budget' | 'done'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputVal('');

    window.setTimeout(() => {
      if (step === 'category') {
        const lower = text.toLowerCase();
        if (lower.includes('سيارة') || lower.includes('طوموبيل') || lower.includes('car') || lower.includes('voiture')) {
          setSelectedCategory(t('car'));
          setStep('city');
          setMessages(prev => [...prev, { sender: 'ai', text: t('aiCarPrompt') }]);
        } else if (lower.includes('عقار') || lower.includes('شقة') || lower.includes('فيلا') || lower.includes('appartement') || lower.includes('property') || lower.includes('bien')) {
          setSelectedCategory(t('property'));
          setStep('city');
          setMessages(prev => [...prev, { sender: 'ai', text: t('aiPropertyPrompt') }]);
        } else {
          setMessages(prev => [...prev, { sender: 'ai', text: t('aiCategoryPrompt') }]);
        }
      } else if (step === 'city') {
        setSelectedCity(text);
        setStep('budget');
        setMessages(prev => [...prev, { sender: 'ai', text: interpolate(t('aiBudgetPrompt'), { city: text }) }]);
      } else if (step === 'budget') {
        setStep('done');
        setMessages(prev => [...prev, { sender: 'ai', text: interpolate(t('aiResults'), { category: selectedCategory, city: selectedCity, budget: text }) }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: t('aiNextStep') }]);
      }
    }, 600);
  };

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-4 z-50 md:bottom-6 md:left-6">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="b2-ai-chat-trigger group relative flex items-center gap-3 rounded-full border-2 border-amber-500 bg-[#0B3C5D] p-4 text-white shadow-2xl transition-transform hover:scale-105"
          title={t('aiAssistant')}
          aria-label={t('aiAssistantAria')}
          aria-expanded={isOpen}
        >
          <span className="b2-ai-chat-trigger__halo" aria-hidden="true" />
          <Bot className="b2-ai-chat-trigger__bot h-6 w-6 text-amber-400" aria-hidden="true" />
          <span className="hidden text-sm font-bold tracking-wide sm:inline">{t('aiAssistant')}</span>
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-slate-950">AI</span>
        </button>
      )}

      {isOpen && (
        <div className="flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-amber-500/30 bg-[#0B3C5D] p-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400 bg-amber-500/20">
                <Bot className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">{t('aiAssistant')}</h3>
                <p className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> {t('aiOnline')}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white" aria-label={t('close')}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-2xl p-3 text-xs leading-relaxed sm:text-sm ${msg.sender === 'user' ? 'rounded-bl-none bg-[#0B3C5D] text-white shadow-sm' : 'rounded-br-none border border-slate-100 bg-white font-medium text-slate-800 shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {step === 'category' && (
            <div className="flex justify-center gap-2 border-t border-slate-100 bg-white p-2">
              <Button size="sm" variant="outline" className="gap-1 border-amber-500 text-xs text-amber-700 hover:bg-amber-50" onClick={() => handleSend(t('aiCarSuggestion'))}>
                <Car className="h-3.5 w-3.5" /> {t('aiCarSuggestion')}
              </Button>
              <Button size="sm" variant="outline" className="gap-1 border-blue-500 text-xs text-blue-700 hover:bg-blue-50" onClick={() => handleSend(t('aiPropertySuggestion'))}>
                <Building2 className="h-3.5 w-3.5" /> {t('aiPropertySuggestion')}
              </Button>
            </div>
          )}

          <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
            <Input placeholder={t('aiInputPlaceholder')} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="text-xs sm:text-sm" />
            <Button size="icon" onClick={() => handleSend()} className="shrink-0 bg-[#0B3C5D] text-white hover:bg-[#0B3C5D]/90" aria-label={t('sendMessage')}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
