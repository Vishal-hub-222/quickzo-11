import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AiProductFinder.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://quickzo.onrender.com';
const suggestions = ['A gift under $50', 'Everyday casual outfit', 'Something for a child'];

export const AiProductFinder = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const search = async (event) => {
    event?.preventDefault();
    const request = query.trim();
    if (request.length < 2) {
      setError('Tell us a little more about what you are looking for.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const response = await fetch(`${API_URL}/ai-product-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: request }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'AI search is unavailable.');
      setResult(data);
      setStatus('done');
    } catch (requestError) {
      setError(requestError.message || 'AI search is unavailable.');
      setStatus('error');
    }
  };

  return (
    <section className="ai-finder" aria-labelledby="ai-finder-title">
      <div className="ai-finder__intro">
        <span className="ai-finder__eyebrow">✦ Powered by Gemini</span>
        <h2 id="ai-finder-title">Find your next favorite</h2>
        <p>Describe an occasion, style, budget, or who you are shopping for. Our AI searches the products we actually carry.</p>
      </div>
      <form className="ai-finder__form" onSubmit={search}>
        <label className="sr-only" htmlFor="ai-product-query">What are you shopping for?</label>
        <input id="ai-product-query" value={query} onChange={(event) => setQuery(event.target.value)} maxLength="300" placeholder="Try: a comfortable outfit for a weekend trip" />
        <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Finding matches…' : 'Ask AI'}</button>
      </form>
      <div className="ai-finder__chips" aria-label="Example searches">
        {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => { setQuery(suggestion); setError(''); }}>{suggestion}</button>)}
      </div>
      {error && <p className="ai-finder__error" role="alert">{error}</p>}
      {result && <div className="ai-finder__results" aria-live="polite">
        <p className="ai-finder__summary">{result.summary}</p>
        {result.reason && <p className="ai-finder__reason">Why these: {result.reason}</p>}
        {result.products.length ? <div className="ai-finder__grid">{result.products.map((product) => (
          <Link className="ai-finder__product" key={product.id} to={`/product/${product.id}`} onClick={() => window.scrollTo(0, 0)}>
            <img src={product.image} alt={product.name} /><span>{product.name}</span><strong>${product.new_price}</strong>
          </Link>
        ))}</div> : <p className="ai-finder__empty">No close match yet. Try a different style, category, or budget.</p>}
      </div>}
    </section>
  );
};
