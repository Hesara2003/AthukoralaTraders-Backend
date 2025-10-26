import React, { createContext, useContext, useState } from 'react';

const ProductComparisonContext = createContext();

export const useProductComparison = () => {
  const context = useContext(ProductComparisonContext);
  if (!context) {
    throw new Error('useProductComparison must be used within a ProductComparisonProvider');
  }
  return context;
};

export const ProductComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState([]);
  const MAX_COMPARE = 4;

  const addToComparison = (product) => {
    if (comparisonList.find(item => item.id === product.id)) {
      return { success: false, message: 'Product already in comparison' };
    }
    if (comparisonList.length >= MAX_COMPARE) {
      return { success: false, message: `You can only compare up to ${MAX_COMPARE} products` };
    }
    setComparisonList([...comparisonList, product]);
    return { success: true, message: 'Added to comparison' };
  };

  const removeFromComparison = (productId) => {
    setComparisonList(comparisonList.filter(item => item.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (productId) => {
    return comparisonList.some(item => item.id === productId);
  };

  return (
    <ProductComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        maxCompare: MAX_COMPARE,
      }}
    >
      {children}
    </ProductComparisonContext.Provider>
  );
};
