import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Car, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { direction, t } = useLanguage();

  const faqs = [
    {
      category: t('faqRentalsCategory'),
      icon: Car,
      question: t('faqRentalsQuestion'),
      answer: t('faqRentalsAnswer'),
    },
    {
      category: t('faqSecurityCategory'),
      icon: ShieldCheck,
      question: t('faqSecurityQuestion'),
      answer: t('faqSecurityAnswer'),
    },
    {
      category: t('faqPartnersCategory'),
      icon: Building2,
      question: t('faqPartnersQuestion'),
      answer: t('faqPartnersAnswer'),
    },
    {
      category: t('faqCancellationCategory'),
      icon: HelpCircle,
      question: t('faqCancellationQuestion'),
      answer: t('faqCancellationAnswer'),
    },
  ];

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900/50 md:py-16" dir={direction}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center md:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            <span>{t('faqBadge')}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {t('faqTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
            {t('faqSubtitle')}
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, idx) => {
            const Icon = faq.icon;
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 md:rounded-2xl"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex min-h-16 w-full items-center justify-between gap-2 px-4 py-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset md:gap-4 md:px-6 md:py-5"
                >
                  <div className="flex min-w-0 items-center gap-3 md:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 md:h-10 md:w-10 md:rounded-xl">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <span className="mb-1 block text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {faq.category}
                      </span>
                      <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white sm:text-lg">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 dark:bg-slate-700 dark:text-slate-400 ${isOpen ? 'rotate-180 bg-amber-500 text-white dark:bg-amber-500 dark:text-white' : ''}`} aria-hidden="true">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-600 dark:border-slate-700/50 dark:text-slate-300 md:px-6 md:pb-6 md:text-base">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
