// Mock product data for offline development
const mockProducts = [
  {
    id: "1",
    name: "Professional Hammer Set",
    description: "High-quality hammer set perfect for construction and carpentry work. Includes 3 different sizes.",
    price: 45.99,
    category: "Tools",
    subcategory: "Hand Tools", 
    sku: "HAM-001",
    inStock: true,
    stockQuantity: 25,
    stock: 25, // For cart compatibility
    imageUrl: "/images/category-tools.svg",
    manufacturer: "BuildPro",
    brand: "BuildPro", // For filtering
    weight: "2.5 kg"
  },
  {
    id: "2", 
    name: "Electric Drill Kit",
    description: "Professional electric drill with multiple bits and carrying case. Perfect for drilling and screwing.",
    price: 129.99,
    category: "Tools",
    subcategory: "Power Tools",
    sku: "DRL-002", 
    inStock: true,
    stockQuantity: 15,
    stock: 15, // For cart compatibility
    imageUrl: "/images/category-tools.svg",
    manufacturer: "PowerMax",
    brand: "PowerMax", // For filtering
    weight: "1.8 kg"
  },
  {
    id: "3",
    name: "PVC Pipe Fittings",
    description: "Complete set of PVC pipe fittings for plumbing installations. Includes elbows, tees, and connectors.",
    price: 24.99,
    category: "Plumbing",
    subcategory: "Pipes & Fittings",
    sku: "PVC-003",
    inStock: true,
    stockQuantity: 50,
    stock: 50, // For cart compatibility
    imageUrl: "/images/category-plumbing.svg",
    manufacturer: "AquaFlow",
    brand: "AquaFlow", // For filtering
    weight: "3.2 kg"
  },
  {
    id: "4",
    name: "LED Work Light",
    description: "Bright LED work light for construction sites and workshops. Portable and durable.",
    price: 89.99,
    category: "Electrical", 
    subcategory: "Lighting",
    sku: "LED-004",
    inStock: true,
    stockQuantity: 12,
    stock: 12, // For cart compatibility
    imageUrl: "/images/category-electrical.svg",
    manufacturer: "BrightTech",
    brand: "BrightTech", // For filtering
    weight: "0.8 kg"
  },
  {
    id: "5",
    name: "Safety Helmet",
    description: "ANSI-approved safety helmet for construction and industrial work. Adjustable fit.",
    price: 35.99,
    category: "Safety",
    subcategory: "Head Protection", 
    sku: "SFT-005",
    inStock: true,
    stockQuantity: 30,
    stock: 30, // For cart compatibility
    imageUrl: "/images/category-safety.svg",
    manufacturer: "SafeGuard",
    brand: "SafeGuard", // For filtering
    weight: "0.4 kg"
  },
  {
    id: "6",
    name: "Garden Hose 50ft",
    description: "Heavy-duty garden hose perfect for watering and outdoor cleaning. Kink-resistant design.",
    price: 49.99,
    category: "Garden",
    subcategory: "Watering",
    sku: "GRD-006",
    inStock: true, 
    stockQuantity: 20,
    stock: 20, // For cart compatibility
    imageUrl: "/images/category-garden.svg",
    manufacturer: "GreenFlow",
    brand: "GreenFlow", // For filtering
    weight: "2.1 kg"
  },
  {
    id: "7",
    name: "Concrete Mix 50lb",
    description: "High-strength concrete mix for construction projects. Fast-setting formula.",
    price: 12.99,
    category: "Construction",
    subcategory: "Materials",
    sku: "CON-007",
    inStock: true,
    stockQuantity: 100,
    stock: 100, // For cart compatibility
    imageUrl: "/images/category-construction.svg", 
    manufacturer: "StrongBuild",
    brand: "StrongBuild", // For filtering
    weight: "22.7 kg"
  },
  {
    id: "8",
    name: "Adjustable Wrench Set",
    description: "Professional adjustable wrench set with multiple sizes. Chrome-plated finish.",
    price: 67.99,
    category: "Tools",
    subcategory: "Hand Tools",
    sku: "WRN-008",
    inStock: false,
    stockQuantity: 0,
    stock: 0, // For cart compatibility
    imageUrl: "/images/category-tools.svg",
    manufacturer: "ProTools",
    brand: "ProTools", // For filtering
    weight: "1.5 kg"
  }
];

const mockCustomerProducts = [
  {
    name: "Professional Hammer Set",
    discountedPrice: 39.99,
    discountPercent: 13,
    promotionName: "Tool Sale"
  },
  {
    name: "Electric Drill Kit", 
    discountedPrice: 109.99,
    discountPercent: 15,
    promotionName: "Power Tool Discount"
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock ProductApi with offline data
export const ProductApi = {
  list: async () => {
    await delay(500); // Simulate network delay
    console.log('Mock ProductApi.list() called, returning products:', mockProducts);
    return mockProducts;
  },
  
  getById: async (id) => {
    await delay(300);
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    console.log('Mock ProductApi.getById() called for id:', id, 'returning:', product);
    return product;
  },
  
  search: async (searchTerm) => {
    await delay(400);
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  
  advancedSearch: async (searchTerm = '', minPrice = null, maxPrice = null, availableOnly = false) => {
    await delay(400);
    let results = mockProducts;
    
    if (searchTerm) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (minPrice !== null) {
      results = results.filter(p => p.price >= minPrice);
    }
    
    if (maxPrice !== null) {
      results = results.filter(p => p.price <= maxPrice);
    }
    
    if (availableOnly) {
      results = results.filter(p => p.inStock && p.stockQuantity > 0);
    }
    
    return results;
  }
};

// Mock CustomerProductApi
export const CustomerProductApi = {
  list: async () => {
    await delay(300);
    return mockCustomerProducts;
  },
  
  getById: async (id) => {
    await delay(300);
    const product = mockProducts.find(p => p.id === id || p.sku === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    // Check if this product has a discount
    const discount = mockCustomerProducts.find(d => d.name === product.name);
    
    // Return product with discount info merged
    return {
      ...product,
      discountedPrice: discount?.discountedPrice || product.price,
      discountPercent: discount?.discountPercent || 0,
      promotionName: discount?.promotionName || null,
      hasDiscount: !!discount
    };
  },
  
  search: async (searchTerm) => {
    await delay(400);
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  
  advancedSearch: async (searchTerm = '', minPrice = null, maxPrice = null, availableOnly = false) => {
    await delay(400);
    let results = mockProducts;
    
    if (searchTerm) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (minPrice !== null) {
      results = results.filter(p => p.price >= minPrice);
    }
    
    if (maxPrice !== null) {
      results = results.filter(p => p.price <= maxPrice);
    }
    
    if (availableOnly) {
      results = results.filter(p => p.inStock && p.stockQuantity > 0);
    }
    
    return results;
  }
};
