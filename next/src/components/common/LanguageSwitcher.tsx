'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { languages } from '@/i18n/config/settings'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const router = useRouter()

  const handleLanguageChange = async (lng: string) => {
    await i18n.changeLanguage(lng)
    router.refresh()
  }

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lng) => (
        <button
          key={lng}
          onClick={() => handleLanguageChange(lng)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            i18n.language === lng
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {lng === 'zh' ? '中文' : 'English'}
        </button>
      ))}
    </div>
  )
} 