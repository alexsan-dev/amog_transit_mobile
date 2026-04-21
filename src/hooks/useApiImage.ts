import { useMemo } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.amogtransit.com';

/**
 * Résout une URL d'image serveur.
 * Si l'URL commence déjà par http:// ou https://, elle est retournée telle quelle.
 * Sinon, elle est préfixée avec EXPO_PUBLIC_API_URL.
 */
export function resolveApiImageUrl(image: string | null | undefined): string | undefined {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  // Supprime le slash leading éventuel pour éviter les doubles slashes
  const cleanPath = image.startsWith('/') ? image.slice(1) : image;
  return `${API_URL}/${cleanPath}`;
}

/**
 * Hook pour résoudre une URL d'image API de manière memoïsée.
 */
export function useApiImage(image: string | null | undefined): string | undefined {
  return useMemo(() => resolveApiImageUrl(image), [image]);
}
