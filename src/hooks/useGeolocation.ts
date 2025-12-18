import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  region: string;
  country: string;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (): LocationData => {
  const [location, setLocation] = useState<LocationData>({
    city: '',
    region: '',
    country: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Using ip-api.com for geolocation (free, no API key needed)
        const response = await fetch('http://ip-api.com/json/?lang=pt-BR');
        const data = await response.json();
        
        if (data.status === 'success') {
          setLocation({
            city: data.city || 'Sua cidade',
            region: data.regionName || '',
            country: data.country || 'Brasil',
            loading: false,
            error: null,
          });
        } else {
          setLocation(prev => ({
            ...prev,
            city: 'Brasil',
            loading: false,
            error: null,
          }));
        }
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          city: 'Brasil',
          loading: false,
          error: null,
        }));
      }
    };

    fetchLocation();
  }, []);

  return location;
};
