import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver, HeaderResolver, CookieResolver } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'zh',
      fallbacks: {
        'en-*': 'en',
        'zh-*': 'zh',
      },
      loaderOptions: {
        path: join(__dirname),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] },
        new HeaderResolver(['x-custom-lang', 'accept-language']),
        new CookieResolver(['lang', 'locale', 'l']),
      ],
      typesOutputPath: join(__dirname, '../types/i18n.generated.ts'),
    }),
  ],
  exports: [I18nModule],
})
export class I18nConfigModule {} 