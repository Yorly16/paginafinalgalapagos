'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGitHubService } from '@/lib/github-data-service';

type DataType = 'users' | 'species' | 'researchers' | 'permissions';

interface UseGitHubDataOptions {
  syncOnMount?: boolean;
  syncInterval?: number; // en milisegundos
  fallbackToLocal?: boolean;
}

interface UseGitHubDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  // Operaciones CRUD
  addItem: (item: Omit<T, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  // Sincronización
  syncToGitHub: () => Promise<void>;
  syncFromGitHub: () => Promise<void>;
  // Estado de sincronización
  lastSync: Date | null;
  isDirty: boolean; // true si hay cambios locales no sincronizados
}

export function useGitHubData<T extends { id: string }>(
  dataType: DataType,
  options: UseGitHubDataOptions = {}
): UseGitHubDataReturn<T> {
  const {
    syncOnMount = true,
    syncInterval = 5 * 60 * 1000, // 5 minutos por defecto
    fallbackToLocal = true
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const localStorageKey = `github-data-${dataType}`;
  const lastSyncKey = `github-sync-${dataType}`;
  const dirtyKey = `github-dirty-${dataType}`;

  // Cargar datos desde localStorage
  const loadFromLocal = useCallback(() => {
    try {
      const localData = localStorage.getItem(localStorageKey);
      const syncTime = localStorage.getItem(lastSyncKey);
      const dirty = localStorage.getItem(dirtyKey) === 'true';
      
      if (localData) {
        setData(JSON.parse(localData));
      }
      if (syncTime) {
        setLastSync(new Date(syncTime));
      }
      setIsDirty(dirty);
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, [localStorageKey, lastSyncKey, dirtyKey]);

  // Guardar datos en localStorage
  const saveToLocal = useCallback((newData: T[], markDirty = true) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(newData));
      if (markDirty) {
        localStorage.setItem(dirtyKey, 'true');
        setIsDirty(true);
      }
      setData(newData);
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, [localStorageKey, dirtyKey]);

  // Sincronizar desde GitHub
  const syncFromGitHub = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const githubService = getGitHubService();
      let githubData: T[];

      switch (dataType) {
        case 'users':
          githubData = await githubService.getUsers();
          break;
        case 'species':
          githubData = await githubService.getSpecies();
          break;
        case 'researchers':
          githubData = await githubService.getResearchers();
          break;
        case 'permissions':
          githubData = await githubService.getPermissions();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      // Guardar en localStorage sin marcar como dirty
      localStorage.setItem(localStorageKey, JSON.stringify(githubData));
      localStorage.setItem(lastSyncKey, new Date().toISOString());
      localStorage.setItem(dirtyKey, 'false');
      
      setData(githubData);
      setLastSync(new Date());
      setIsDirty(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error syncing from GitHub';
      setError(errorMessage);
      
      // Si falla y tenemos fallback, cargar desde local
      if (fallbackToLocal) {
        loadFromLocal();
      }
    } finally {
      setLoading(false);
    }
  }, [dataType, localStorageKey, lastSyncKey, dirtyKey, fallbackToLocal, loadFromLocal]);

  // Sincronizar hacia GitHub
  const syncToGitHub = useCallback(async () => {
    if (!isDirty) return;

    try {
      setLoading(true);
      setError(null);
      
      const githubService = getGitHubService();
      const message = `Update ${dataType} data from web app`;

      switch (dataType) {
        case 'users':
          await githubService.updateUsers(data as any[], message);
          break;
        case 'species':
          await githubService.updateSpecies(data as any[], message);
          break;
        case 'researchers':
          await githubService.updateResearchers(data as any[], message);
          break;
        case 'permissions':
          await githubService.updatePermissions(data as any[], message);
          break;
      }

      // Marcar como sincronizado
      localStorage.setItem(lastSyncKey, new Date().toISOString());
      localStorage.setItem(dirtyKey, 'false');
      
      setLastSync(new Date());
      setIsDirty(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error syncing to GitHub';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDirty, data, dataType, lastSyncKey, dirtyKey]);

  // Agregar elemento
  const addItem = useCallback(async (item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() } as T;
    const newData = [...data, newItem];
    saveToLocal(newData);
  }, [data, saveToLocal]);

  // Actualizar elemento
  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    const newData = data.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    saveToLocal(newData);
  }, [data, saveToLocal]);

  // Eliminar elemento
  const deleteItem = useCallback(async (id: string) => {
    const newData = data.filter(item => item.id !== id);
    saveToLocal(newData);
  }, [data, saveToLocal]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      // Primero cargar desde localStorage
      loadFromLocal();
      
      // Luego sincronizar desde GitHub si está habilitado
      if (syncOnMount) {
        await syncFromGitHub();
      } else {
        setLoading(false);
      }
    };

    initializeData();
  }, [syncOnMount, loadFromLocal, syncFromGitHub]);

  // Efecto para sincronización automática
  useEffect(() => {
    if (!syncInterval) return;

    const interval = setInterval(() => {
      // Sincronizar hacia GitHub si hay cambios
      if (isDirty) {
        syncToGitHub();
      }
      // Sincronizar desde GitHub para obtener cambios externos
      syncFromGitHub();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [syncInterval, isDirty, syncToGitHub, syncFromGitHub]);

  // Sincronizar antes de cerrar la ventana
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty) {
        // Intentar sincronización síncrona (limitada)
        navigator.sendBeacon('/api/sync', JSON.stringify({ dataType, data }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, dataType, data]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    syncToGitHub,
    syncFromGitHub,
    lastSync,
    isDirty
  };
}

// Hook específico para cada tipo de datos
export const useUsers = (options?: UseGitHubDataOptions) => 
  useGitHubData<{ id: string; email: string; name: string; role: string }>('users', options);

export const useSpecies = (options?: UseGitHubDataOptions) => 
  useGitHubData<{ id: string; name: string; scientificName: string; description: string; location: string }>('species', options);

export const useResearchers = (options?: UseGitHubDataOptions) => 
  useGitHubData<{ id: string; name: string; email: string; institution: string; specialization: string }>('researchers', options);

export const usePermissions = (options?: UseGitHubDataOptions) => 
  useGitHubData<{ id: string; userId: string; resource: string; action: string; granted: boolean }>('permissions', options);