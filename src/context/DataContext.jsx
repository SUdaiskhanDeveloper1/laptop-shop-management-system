import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState({});
  const [initialized, setInitialized] = useState(false);

  const fetchCollection = useCallback(async (name, force = false) => {
  

    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      // Use specialized route if it exists, otherwise fallback to generic collection route
      const specializedRoutes = ['laptops', 'sales', 'purchases', 'suppliers', 'expenses', 'additional_sales'];
      const endpoint = specializedRoutes.includes(name) ? `/${name}` : `/collections/${name}`;
      const data = await apiFetch(endpoint);
      setCollections(prev => ({ ...prev, [name]: data }));
      return data;
    } catch (error) {
      console.error(`Error fetching collection ${name}:`, error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  }, []); // Empty dependency array ensures stability

  const refreshAll = useCallback(async () => {
    const names = ['laptops', 'sales', 'purchases', 'suppliers', 'expenses', 'additional_sales'];
    const promises = names.map(name => fetchCollection(name, true));
    await Promise.all(promises);
    setInitialized(true);
  }, [fetchCollection]);

  // Provide a way to update local state after a mutation
  const mutateCollection = useCallback((name, action, payload) => {
    setCollections(prev => {
      const current = prev[name] || [];
      let updated = [...current];

      if (action === 'add') {
        updated = [payload, ...updated];
      } else if (action === 'update') {
        updated = updated.map(item => item.id === payload.id ? { ...item, ...payload } : item);
      } else if (action === 'delete') {
        updated = updated.filter(item => item.id !== payload.id);
      } else if (action === 'set') {
        updated = payload;
      }

      return { ...prev, [name]: updated };
    });
  }, []);

  const value = {
    collections,
    loading,
    fetchCollection,
    refreshAll,
    mutateCollection,
    initialized
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
