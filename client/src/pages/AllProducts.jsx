import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    console.log('Products:', products);

    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
        {filteredProducts
          .filter(product => product.inStock)
          .map(product => {
            // Verify the key is unique and defined
            if (!product._id) {
              console.warn('Product missing id:', product);
            }
            return <ProductCard key={product.id ?? product.name} product={product} />;
          })}
      </div>
    </div>
  );
};

export default AllProducts;
