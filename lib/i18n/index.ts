import { en } from './dictionaries/en';

type Dictionary = typeof en;

export function useI18n(): { dict: Dictionary; locale: string } {
  return { dict: en, locale: 'en' };
}
