'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions } from '@/i18n/config/settings'

// 初始化一个单例 i18n 实例
const i18n = i18next.createInstance()
let initialized = false

interface I18nProviderProps {
  locale: string
  namespaces?: string[]
  children: React.ReactNode
}

export const I18nProvider = ({ locale, children, namespaces = ['common'] }: I18nProviderProps) => {
  useEffect(() => {
    if (!initialized) {
      i18n
        .use(initReactI18next)
        .use(resourcesToBackend((language: string, namespace: string) => 
          import(`@/i18n/locales/${language}/${namespace}.json`)))
        .init({
          ...getOptions(locale, namespaces),
          lng: locale
        })
      initialized = true
    } else {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
} 