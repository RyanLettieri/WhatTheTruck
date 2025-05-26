import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  ScrollView,
  SafeAreaView,
  View,
  Alert,
} from 'react-native';
import { updateTruckAvailability } from '../api/appwrite';

// Components
import { TruckHeader } from '../components/truck/TruckHeader';
import { LocationCard } from '../components/truck/LocationCard';
import { MenuSection } from '../components/truck/MenuSection/MenuSection';
import { AvailabilityCard } from '../components/truck/AvailabilityCard';
import { ReviewsSection } from '../components/truck/ReviewsSection';
import { MenuModals } from '../components/truck/modals/MenuModals';

// Hooks
import { useTruckDetails } from '../hooks/useTruckDetails';
import { useModals } from '../hooks/useModals';
import { useMenuHandlers } from '../hooks/useMenuHandlers';

export default function TruckDetails({ route, navigation }: any) {
  const { truck } = route.params || {};
  const [updating, setUpdating] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  // Use custom hooks
  const { truckData, loading, menusData, reviews, setTruckData, setMenusData } = useTruckDetails(truck);
  const modals = useModals();
  const menuHandlers = useMenuHandlers(truckData, menusData, setMenusData, modals);

  const handleToggleAvailable = async (value: boolean) => {
    if (!truckData) return;
    setUpdating(true);
    const updated = await updateTruckAvailability(truckData.id, value);
    if (updated) {
      setTruckData({ ...truckData, available: value });
    } else {
      Alert.alert('Error', 'Failed to update availability.');
    }
    setUpdating(false);
  };

  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  if (loading) return <ActivityIndicator size="large" color="#F28C28" style={{ flex: 1, justifyContent: 'center' }} />;
  if (!truckData) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Truck not found.</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <ScrollView style={{ flex: 1 }}>
        <TruckHeader 
          truckName={truckData.truck_name}
          onProfilePress={() => navigation.navigate('DriverDashboard')}
        />

        <LocationCard 
          location={truckData.location}
          onUpdateLocation={() => Alert.alert('TODO', 'Update location functionality')}
        />

        <MenuSection
          menus={menusData}
          expandedMenus={expandedMenus}
          onToggleExpansion={toggleMenuExpansion}
          onAddMenu={() => modals.setCreateMenuModalVisible(true)}
          onEditMenu={menuHandlers.openEditMenuModal}
          onDeleteMenu={menuHandlers.handleDeleteMenu}
          onAddMenuItem={menuHandlers.openAddItemModal}
          onEditMenuItem={menuHandlers.openEditItemModal}
          onDeleteMenuItem={menuHandlers.handleDeleteMenuItem}
        />

        <AvailabilityCard
          available={truckData.available}
          onToggleAvailable={handleToggleAvailable}
          updating={updating}
        />

        <ReviewsSection
          reviews={reviews}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <MenuModals
          {...modals}
          onSaveMenuItem={menuHandlers.handleSaveMenuItem}
          onCreateMenu={menuHandlers.handleCreateMenu}
          onUpdateMenu={menuHandlers.handleUpdateMenu}
        />

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}