import React, { useEffect } from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
import BottomBanner from '../components/BottomBanner';
import NewsLetter from '../components/NewsLetter';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const Home = () => {
  const { setUser } = useAppContext();

  useEffect(() => {
    const autoLogout = async () => {
      try {
        await axios.post('/api/user/logout', {}, { withCredentials: true });
        setUser(null);
        console.log('✅ User logged out on homepage visit');
      } catch (error) {
        console.error('❌ Auto logout error:', error);
      }
    };

    autoLogout();
  }, []);

  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewsLetter />
    </div>
  );
};

export default Home;
