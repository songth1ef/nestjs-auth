import type { InitOptions } from 'i18next'

export const defaultNS = 'common'
export const fallbackLng = 'zh'
export const languages = ['zh', 'en'] as const

export function getOptions(locale: string, namespaces: string[]): InitOptions {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng: locale,
    fallbackNS: defaultNS,
    defaultNS,
    ns: namespaces,
  }
} 