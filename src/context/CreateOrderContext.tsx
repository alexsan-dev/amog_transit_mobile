import React, { createContext, useContext, useState, useCallback } from 'react';

export interface WizardProduct {
  name: string;
  url: string;
  unit_price: string;
  currency: string;
  nature: string;
  quantity: string;
  notes: string;
}

export interface CreateOrderState {
  serviceType: 'transit' | 'purchase_assisted' | null;
  routeId: number | null;
  estimatedWeight: string;
  deliveryAddress: string;
  clientNotes: string;
  products: WizardProduct[];
  photos: { uri: string; name: string; type: string }[];
}

const initialState: CreateOrderState = {
  serviceType: null,
  routeId: null,
  estimatedWeight: '',
  deliveryAddress: '',
  clientNotes: '',
  products: [],
  photos: [],
};

interface CreateOrderContextValue {
  state: CreateOrderState;
  setServiceType: (v: CreateOrderState['serviceType']) => void;
  setRouteId: (v: number | null) => void;
  setEstimatedWeight: (v: string) => void;
  setDeliveryAddress: (v: string) => void;
  setClientNotes: (v: string) => void;
  setProducts: (v: WizardProduct[]) => void;
  addProduct: (v: WizardProduct) => void;
  removeProduct: (index: number) => void;
  setPhotos: (v: CreateOrderState['photos']) => void;
  addPhoto: (v: { uri: string; name: string; type: string }) => void;
  removePhoto: (index: number) => void;
  reset: () => void;
}

const CreateOrderContext = createContext<CreateOrderContextValue | null>(null);

export function CreateOrderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CreateOrderState>(initialState);

  const update = useCallback(
    <K extends keyof CreateOrderState>(key: K, value: CreateOrderState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setServiceType = useCallback((v) => update('serviceType', v), [update]);
  const setRouteId = useCallback((v) => update('routeId', v), [update]);
  const setEstimatedWeight = useCallback((v) => update('estimatedWeight', v), [update]);
  const setDeliveryAddress = useCallback((v) => update('deliveryAddress', v), [update]);
  const setClientNotes = useCallback((v) => update('clientNotes', v), [update]);
  const setProducts = useCallback((v) => update('products', v), [update]);
  const setPhotos = useCallback((v) => update('photos', v), [update]);

  const addProduct = useCallback((product: WizardProduct) => {
    setState((prev) => ({ ...prev, products: [...prev.products, product] }));
  }, []);

  const removeProduct = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  }, []);

  const addPhoto = useCallback((photo: { uri: string; name: string; type: string }) => {
    setState((prev) => ({
      ...prev,
      photos: [...prev.photos, photo].slice(0, 4),
    }));
  }, []);

  const removePhoto = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return (
    <CreateOrderContext.Provider
      value={{
        state,
        setServiceType,
        setRouteId,
        setEstimatedWeight,
        setDeliveryAddress,
        setClientNotes,
        setProducts,
        addProduct,
        removeProduct,
        setPhotos,
        addPhoto,
        removePhoto,
        reset,
      }}
    >
      {children}
    </CreateOrderContext.Provider>
  );
}

export function useCreateOrder() {
  const ctx = useContext(CreateOrderContext);
  if (!ctx) throw new Error('useCreateOrder must be used within CreateOrderProvider');
  return ctx;
}
