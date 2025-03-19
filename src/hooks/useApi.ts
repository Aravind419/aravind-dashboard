
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

type ApiOptions<T> = {
  endpoint: string;
  initialData?: T;
  transformResponse?: (data: any) => T;
};

function useApi<T>({ endpoint, initialData, transformResponse }: ApiOptions<T>) {
  const [data, setData] = useState<T>(initialData as T);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/${endpoint}`);
      const result = transformResponse ? transformResponse(response.data) : response.data;
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, transformResponse]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = async (item: Omit<T extends Array<infer U> ? U : T, '_id'>) => {
    try {
      const response = await axios.post(`${API_URL}/${endpoint}`, item);
      if (Array.isArray(data)) {
        setData([...data, response.data] as unknown as T);
      } else {
        setData(response.data);
      }
      return response.data;
    } catch (err) {
      console.error("Error creating item:", err);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<T extends Array<infer U> ? U : T>) => {
    try {
      const response = await axios.put(`${API_URL}/${endpoint}/${id}`, updates);
      if (Array.isArray(data)) {
        setData(data.map((item: any) => 
          item._id === id ? response.data : item
        ) as unknown as T);
      } else {
        setData(response.data);
      }
      return response.data;
    } catch (err) {
      console.error("Error updating item:", err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${endpoint}/${id}`);
      if (Array.isArray(data)) {
        setData(data.filter((item: any) => item._id !== id) as unknown as T);
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      throw err;
    }
  };

  return {
    data,
    setData,
    isLoading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem
  };
}

export default useApi;
