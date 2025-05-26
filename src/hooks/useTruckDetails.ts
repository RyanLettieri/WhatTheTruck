import { useState, useCallback, useEffect } from 'react';
import { 
  fetchTruckById, 
  fetchMenusByTruckId, 
  fetchMenuItemsByMenuId, 
  fetchReviewsByTruckId 
} from '../api/appwrite';

export const useTruckDetails = (truck: any) => {
  const [truckData, setTruckData] = useState<any>(truck);
  const [loading, setLoading] = useState(!truck);
  const [menusData, setMenusData] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const loadTruckDetails = useCallback(async () => {
    if (!truck || !truck.id) {
      setTruckData(null);
      setMenusData([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const fetchedTruckData = await fetchTruckById(truck.id);
      setTruckData(fetchedTruckData);

      if (fetchedTruckData) {
        const fetchedMenus = await fetchMenusByTruckId(fetchedTruckData.id);
        
        const menusWithItems = await Promise.all(
          fetchedMenus.map(async (menu: any) => {
            const items = await fetchMenuItemsByMenuId(menu.id);
            return { ...menu, items: items || [] };
          })
        );
        
        setMenusData(menusWithItems);
        
        const fetchedReviews = await fetchReviewsByTruckId(fetchedTruckData.id);
        setReviews(fetchedReviews);
      }
    } catch (error) {
      console.error("Error loading truck details:", error);
      setTruckData(null);
      setMenusData([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [truck]);

  useEffect(() => {
    loadTruckDetails();
  }, [loadTruckDetails]);

  return {
    truckData,
    loading,
    menusData,
    reviews,
    setTruckData,
    setMenusData,
    refetch: loadTruckDetails,
  };
};