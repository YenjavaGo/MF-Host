import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'

export type MessageLanguages = 'zh-TW' | 'en'

const messages = {
  'zh-TW': zhTW,
  'en': en
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: 'zh-TW', // 預設語言為繁體中文
  fallbackLocale: 'en', // 備用語言
  messages,
  globalInjection: true // 全域注入 $t
})

export default i18n
