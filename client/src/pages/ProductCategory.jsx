import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../assets/assets.js';

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const searchCategory = categories.find(
    (item) => item.path.toLowerCase() === category.toLowerCase()
  );

 const filteredProducts = products.filter(
  (product) => String(product.category || '').toLowerCase() === category.toLowerCase()
);


  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-10 w-full mt-16">
      {searchCategory && (
        <div className="flex flex-col items-start w-max">
          <p className="text-2xl font-medium uppercase">
            {searchCategory.text.toUpperCase()}
          </p>
          <div className="w-16 h-0.5 bg-primary rounded-full mt-1"></div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full mt-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-2xl font-medium text-primary">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCategory;
