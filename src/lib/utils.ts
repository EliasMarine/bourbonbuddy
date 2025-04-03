// Default gradient cover photo
export const DEFAULT_COVER_PHOTO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzJkMzc0OCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFhMjAyYyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz48L3N2Zz4=';

// Default avatar background color
export const DEFAULT_AVATAR_BG = 'bg-amber-600';

// Get cover photo URL with fallback
export const getCoverPhotoUrl = (coverPhoto?: string | null) => {
  return coverPhoto || DEFAULT_COVER_PHOTO;
};

// Get initial letter for avatar
export const getInitialLetter = (name?: string | null) => {
  return name?.[0]?.toUpperCase() || '?';
}; 