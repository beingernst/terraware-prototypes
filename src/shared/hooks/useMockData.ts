import { useState, useEffect } from 'react';

/**
 * Hook to simulate async data loading with mock data
 * Replaces RTK Query hooks in prototypes
 *
 * @example
 * const mockProjects = [{ id: 1, name: 'Project A' }];
 * const { data, loading, error } = useMockData(mockProjects, 800);
 *
 * if (loading) return <BusySpinner />;
 * return <div>{data.map(p => p.name)}</div>;
 */
export function useMockData<T>(
  data: T,
  delay: number = 500
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({ data, loading: false, error: null });
    }, delay);

    return () => clearTimeout(timer);
  }, [data, delay]);

  return state;
}
