import React, { createContext, useContext, useState, useEffect } from 'react';

const EnquiryListContext = createContext();

export const EnquiryListProvider = ({ children }) => {
  const [enquiryItems, setEnquiryItems] = useState(() => {
    const saved = localStorage.getItem('ganga_maxx_enquiry_list');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ganga_maxx_enquiry_list', JSON.stringify(enquiryItems));
  }, [enquiryItems]);

  const addToEnquiryList = (product, variant, quantity) => {
    setEnquiryItems((prevItems) => {
      const variantLabel = variant ? variant.label : 'Default';
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.selectedVariant === variantLabel
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += Number(quantity);
        return updated;
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            productName: product.name,
            image: product.image,
            selectedVariant: variantLabel,
            unitPrice: variant ? variant.price : product.price,
            quantity: Number(quantity)
          }
        ];
      }
    });
  };

  const removeFromEnquiryList = (productId, selectedVariant) => {
    setEnquiryItems((prevItems) =>
      prevItems.filter(
        (item) => {
          if (selectedVariant !== undefined) {
            return !(item.productId === productId && item.selectedVariant === selectedVariant);
          }
          return item.productId !== productId;
        }
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedVariant) => {
    if (quantity <= 0) {
      removeFromEnquiryList(productId, selectedVariant);
      return;
    }
    setEnquiryItems((prevItems) =>
      prevItems.map((item) => {
        const matchesProduct = item.productId === productId;
        const matchesVariant = selectedVariant === undefined || item.selectedVariant === selectedVariant;
        if (matchesProduct && matchesVariant) {
          return { ...item, quantity: Number(quantity) };
        }
        return item;
      })
    );
  };

  const clearEnquiryList = () => {
    setEnquiryItems([]);
  };

  return (
    <EnquiryListContext.Provider
      value={{
        enquiryItems,
        addToEnquiryList,
        removeFromEnquiryList,
        updateQuantity,
        clearEnquiryList
      }}
    >
      {children}
    </EnquiryListContext.Provider>
  );
};

export const useEnquiryList = () => {
  const context = useContext(EnquiryListContext);
  if (!context) {
    throw new Error('useEnquiryList must be used within an EnquiryListProvider');
  }
  return context;
};
