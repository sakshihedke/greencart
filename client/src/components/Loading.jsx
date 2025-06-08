// src/pages/loading.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Loading = () => {
  const [params] = useSearchParams();
  const { fetchUser } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const syncCartAndRedirect = async () => {
      try {
        // Fetch updated user data (cart cleared from backend webhook)
        await fetchUser();

        // Get next page to redirect after loading, default 'my-orders'
        const next = params.get('next') || 'my-orders';

        // Redirect user to next page
        navigate(`/${next}`);
      } catch (error) {
        console.error('Error syncing cart after payment:', error);
        // Redirect anyway to prevent hanging
        navigate('/my-orders');
      }
    };

    syncCartAndRedirect();
  }, [fetchUser, navigate, params]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      fontFamily: 'Arial, sans-serif',
      color: '#444',
      padding: '2rem',
    }}>
      <h2>Finalizing your payment...</h2>
      <p>Please wait a moment while we confirm your order.</p>
      <div style={{ marginTop: '1rem' }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#555"
        >
          <g fill="none" fillRule="evenodd">
            <circle cx="20" cy="20" r="18" strokeOpacity="0.2" strokeWidth="4" />
            <path d="M36 20c0-8.837-7.163-16-16-16" strokeWidth="4">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 20 20"
                to="360 20 20"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Loading;
