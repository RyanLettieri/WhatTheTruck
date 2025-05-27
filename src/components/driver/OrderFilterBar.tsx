import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterOption {
  value: string;
  label: string;
}

interface OrderFilterBarProps {
  filters: boolean;
  searchQuery: string;
  selectedTruck: string;
  selectedStatus: string;
  selectedSort: string;
  onFilterToggle: () => void;
  onSearchChange: (text: string) => void;
  onTruckChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  truckOptions: FilterOption[];
  statusOptions: FilterOption[];
  sortOptions: FilterOption[];
}

export const OrderFilterBar = ({
  filters,
  searchQuery,
  selectedTruck,
  selectedStatus,
  selectedSort,
  onFilterToggle,
  onSearchChange,
  onTruckChange,
  onStatusChange,
  onSortChange,
  truckOptions,
  statusOptions,
  sortOptions
}: OrderFilterBarProps) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  return (
    <View style={styles.container}>
      {/* Filter toggle and header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.filterToggle} 
          onPress={onFilterToggle}
        >
          <Ionicons name={filters ? "chevron-up" : "chevron-down"} size={18} color="#666" />
          <Text style={styles.filterText}>Filters:</Text>
        </TouchableOpacity>
        
        {/* Search toggle button */}
        <TouchableOpacity 
          style={styles.searchToggle}
          onPress={() => setShowSearchBar(!showSearchBar)}
        >
          <Ionicons name="search" size={18} color="#666" />
        </TouchableOpacity>
        
        {/* Sort dropdown - always visible */}
        <View style={styles.sortContainer}>
          <FilterDropdown
            options={sortOptions}
            selected={selectedSort}
            onChange={onSortChange}
          />
        </View>
      </View>
      
      {/* Search bar - shows conditionally */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name or order ID..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#999"
            autoFocus
          />
          <TouchableOpacity onPress={() => {
            onSearchChange('');
            setShowSearchBar(false);
          }}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Default filter dropdowns - when filter is not expanded */}
      {!filters && !showSearchBar && (
        <View style={styles.quickFiltersRow}>
          <FilterDropdown
            options={truckOptions}
            selected={selectedTruck}
            onChange={onTruckChange}
            style={styles.truckDropdown}
          />
          <FilterDropdown
            options={statusOptions}
            selected={selectedStatus}
            onChange={onStatusChange}
            style={styles.statusDropdown}
          />
        </View>
      )}
      
      {/* Expanded filters */}
      {filters && (
        <View style={styles.expandedFilters}>
          <Text style={styles.filterLabel}>Filter by Truck:</Text>
          <View style={styles.chipContainer}>
            {truckOptions.map(option => (
              <TouchableOpacity 
                key={option.value}
                style={[
                  styles.chip,
                  selectedTruck === option.value && styles.chipSelected
                ]}
                onPress={() => onTruckChange(option.value)}
              >
                <Text style={[
                  styles.chipText,
                  selectedTruck === option.value && styles.chipTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.filterLabel}>Filter by Status:</Text>
          <View style={styles.chipContainer}>
            {statusOptions.map(option => (
              <TouchableOpacity 
                key={option.value}
                style={[
                  styles.chip,
                  selectedStatus === option.value && styles.chipSelected
                ]}
                onPress={() => onStatusChange(option.value)}
              >
                <Text style={[
                  styles.chipText,
                  selectedStatus === option.value && styles.chipTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// FilterDropdown component
interface FilterDropdownProps {
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  style?: any;
}

const FilterDropdown = ({ options, selected, onChange, style }: FilterDropdownProps) => {
  const selectedOption = options.find(opt => opt.value === selected) || options[0];
  
  return (
    <TouchableOpacity 
      style={[styles.dropdown, style]}
      onPress={() => {
        // Find current index and cycle to next option
        const currentIndex = options.findIndex(opt => opt.value === selected);
        const nextIndex = (currentIndex + 1) % options.length;
        onChange(options[nextIndex].value);
      }}
    >
      <Text style={styles.dropdownText} numberOfLines={1} ellipsizeMode="tail">
        {selectedOption.label}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#777" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  searchToggle: {
    padding: 6,
    marginLeft: 'auto',
    marginRight: 8,
  },
  sortContainer: {
    width: '40%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  truckDropdown: {
    flex: 1,
    marginRight: 8,
  },
  statusDropdown: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  dropdownText: {
    fontSize: 13,
    color: '#333',
    marginRight: 6,
    flex: 1,
  },
  expandedFilters: {
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#E3F2FD',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
});