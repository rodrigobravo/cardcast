import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, birthDate }),
      });

      if (response.ok) {
        alert('✨ Confira seu email para desbloquear o oráculo!');
      }
    } catch (error) {
      alert('Erro mágico! Tente novamente.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container">
      <Head>
        <title>CardCast - Your Daily Cosmic Gateway</title>
      </Head>

      <header>
        <img src="/images/logo.svg" alt="CardCast Logo" className="logo" />
        <h1>Unveil Your Daily Cosmic Message</h1>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="your.cosmic@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="icon">✉️</span>
          </div>

          <div className="form-group">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            <span className="icon">🌙</span>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="cta-button"
          >
            {isSubmitting ? 'Consulting the Stars...' : 'Get Your Free Reading'}
          </button>
        </form>

        <div className="usp-section">
          <div className="usp-card">
            <h3>🔮 Daily Wisdom</h3>
            <p>One personalized tarot reading every 24 hours</p>
          </div>
          <div className="usp-card">
            <h3>🌍 Universal Insights</h3>
            <p>Interpretations that transcend cultures</p>
          </div>
        </div>
      </main>

      <footer>
        <p>⚡ Powered by Cosmic Energy & Modern Tech</p>
      </footer>
    </div>
  );
}