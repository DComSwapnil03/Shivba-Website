import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

function FAQPage({ setPage }) {
  const { t } = useTranslation();

  // FAQs come from translations so they can change per language
  const STATIC_FAQS = t('faq.items', { returnObjects: true });

  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return STATIC_FAQS;
    const q = searchTerm.toLowerCase();
    return STATIC_FAQS.filter((f) => {
      const question = f.question.toLowerCase();
      const answer = f.answer.toLowerCase();
      const category = (f.category || '').toLowerCase();
      return (
        question.includes(q) ||
        answer.includes(q) ||
        category.includes(q)
      );
    });
  }, [searchTerm, STATIC_FAQS]);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleChatAsk = (e) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q) return;

    const lower = q.toLowerCase();
    const match =
      STATIC_FAQS.find((f) => f.question.toLowerCase().includes(lower)) ||
      STATIC_FAQS.find(
        (f) => (f.category || '').toLowerCase().includes(lower)
      );

    if (match) {
      setChatAnswer(
        t('faq.chatMatch', {
          question: match.question,
          answer: match.answer,
        })
      );
    } else {
      setChatAnswer(t('faq.chatNoMatch'));
    }
  };

  const goContact = () => {
    setPage({ name: 'contact' });
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>{t('faq.heroTitle')}</h1>
          <p>{t('faq.heroSubtitle')}</p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="faq-main">
        <div className="faq-inner">
          {/* Left: FAQ list */}
          <div className="faq-list-col">
            <div className="faq-search">
              <input
                type="text"
                placeholder={t('faq.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="faq-accordion">
              {filteredFaqs.length === 0 ? (
                <p className="faq-empty">{t('faq.noResults')}</p>
              ) : (
                filteredFaqs.map((item) => (
                  <div
                    key={item.id}
                    className={
                      'faq-item' + (openId === item.id ? ' faq-item-open' : '')
                    }
                  >
                    <button
                      className="faq-question-row"
                      onClick={() => toggleFaq(item.id)}
                    >
                      <div>
                        {item.category && (
                          <span className="faq-category-pill">
                            {item.category}
                          </span>
                        )}
                        <span className="faq-question-text">
                          {item.question}
                        </span>
                      </div>
                      <span className="faq-toggle-icon">
                        {openId === item.id ? '−' : '+'}
                      </span>
                    </button>
                    {openId === item.id && (
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: simple AI-style helper */}
          <div className="faq-chat-col">
            <div className="faq-chat-card">
              <h2>{t('faq.chatTitle')}</h2>
              <p className="faq-chat-sub">{t('faq.chatSubtitle')}</p>
              <form onSubmit={handleChatAsk} className="faq-chat-form">
                <textarea
                  rows="3"
                  placeholder={t('faq.chatPlaceholder')}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit">{t('faq.chatButton')}</button>
              </form>
              {chatAnswer && (
                <div className="faq-chat-answer">
                  <strong>{t('faq.chatLabel')}</strong>
                  <p>{chatAnswer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="faq-cta">
        <div className="faq-cta-inner">
          <h2>{t('faq.ctaTitle')}</h2>
          <p>{t('faq.ctaSubtitle')}</p>
          <button onClick={goContact}>{t('faq.ctaButton')}</button>
        </div>
      </section>
    </div>
  );
}

export default FAQPage;
