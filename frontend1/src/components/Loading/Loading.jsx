import './Loading.css';

export const Loading = () => (
  <div className="loading" role="status" aria-live="polite">
    <span className="loading-spinner" aria-hidden="true" />
    <p>Loading products...</p>
  </div>
);
