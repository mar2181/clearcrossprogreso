'use client';

import { createContext, useContext, ReactNode } from 'react';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';

export type Locale = 'en' | 'es';

// Recursively widen string literal types to string so ES dict can satisfy the same shape
type WidenStrings<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly (infer U)[]
      ? U extends string
        ? readonly string[]
        : readonly WidenStrings<U>[]
      : T[K] extends object
        ? WidenStrings<T[K]>
        : T[K];
};

export type Dictionary = WidenStrings<typeof en>;

const dictionaries: Record<Locale, Dictionary> = { en, es };

const I18nContext = createContext<{
  dict: Dictionary;
  locale: Locale;
}>({
  dict: en,
  locale: 'en',
});

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = dictionaries[locale] || en;
  return <I18nContext.Provider value={{ dict, locale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
