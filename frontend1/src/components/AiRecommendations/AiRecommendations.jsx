import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './AiRecommendations.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://quickzo.onrender.com';

export const AiRecommendations = ({ productId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadRecommendations = async () => {
      try {
        const response = await fetch(`${API_URL}/ai-recommendations/${productId}`, { signal: controller.signal });
        const payload = await response.json();
        if (response.ok && payload.success && payload.products?.length) setData(payload);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Unable to load AI recommendations:', error);
      }
    };
    loadRecommendations();
    return () => controller.abort();
  }, [productId]);

  if (!data) return null;
  return <section className="ai-recommendations" aria-labelledby="ai-recommendations-title">
    <span>✦ Gemini picks</span>
    <h2 id="ai-recommendations-title">You may also love</h2>
    <p>{data.summary}</p>
    <div>{data.products.map((product) => <Link key={product.id} to={`/product/${product.id}`} onClick={() => window.scrollTo(0, 0)}>
      <img src={product.image} alt={product.name} /><strong>{product.name}</strong><small>${product.new_price}</small>
    </Link>)}</div>
  </section>;
};
