import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'
import { getOptions } from '@/i18n/config/settings'

export async function createTranslation(locale: string, namespaces: string[]) {
  const i18nInstance = createInstance()
  
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`@/i18n/locales/${language}/${namespace}.json`)))
    .init(getOptions(locale, namespaces))

  return i18nInstance
} 