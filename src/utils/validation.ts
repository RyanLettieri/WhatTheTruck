export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Make sure URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // Basic URL validation
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateMenuForm = (name: string, imageUrl?: string): string[] => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Menu name is required');
  } else if (name.length < 2) {
    errors.push('Menu name must be at least 2 characters');
  } else if (name.length > 50) {
    errors.push('Menu name must be less than 50 characters');
  }
  
  if (imageUrl && !isValidImageUrl(imageUrl)) {
    errors.push('Invalid image URL format');
  }
  
  return errors;
};

export const validateMenuItemForm = (name: string, price: string, description?: string): string[] => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Item name is required');
  }
  
  const priceNum = parseFloat(price);
  if (!price || isNaN(priceNum)) {
    errors.push('Valid price is required');
  } else if (priceNum < 0) {
    errors.push('Price cannot be negative');
  } else if (priceNum > 9999) {
    errors.push('Price seems too high');
  }
  
  if (description && description.length > 200) {
    errors.push('Description must be less than 200 characters');
  }
  
  return errors;
};

export const getPublicImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove mode=admin from the URL to make it publicly accessible
  if (url.includes('&mode=admin')) {
    return url.replace('&mode=admin', '');
  }
  
  return url;
};