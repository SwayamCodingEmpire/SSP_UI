# Supported Languages

All 82 languages supported by SSP's AI translation pipeline. Use the `code` value as the `targetLanguage` parameter in all translation API calls.

---

## API

```
GET /api/languages              → full list
GET /api/languages?script=CJK   → filter by script family
GET /api/languages/{code}       → single language (404 if unknown)
```

**Response shape:**
```json
{
  "code": "ar",
  "englishName": "Arabic",
  "nativeName": "العربية",
  "script": "Arabic",
  "rtl": true
}
```

---

## Language Table

### Latin Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `af` | Afrikaans | Afrikaans |
| `sq` | Albanian | Shqip |
| `az` | Azerbaijani | Azərbaycan |
| `eu` | Basque | Euskara |
| `bs` | Bosnian | Bosanski |
| `ca` | Catalan | Català |
| `hr` | Croatian | Hrvatski |
| `cs` | Czech | Čeština |
| `da` | Danish | Dansk |
| `nl` | Dutch | Nederlands |
| `en` | English | English |
| `eo` | Esperanto | Esperanto |
| `et` | Estonian | Eesti |
| `tl` | Tagalog | Tagalog |
| `fi` | Finnish | Suomi |
| `fr` | French | Français |
| `gl` | Galician | Galego |
| `de` | German | Deutsch |
| `ht` | Haitian Creole | Kreyòl ayisyen |
| `ha` | Hausa | Hausa |
| `hu` | Hungarian | Magyar |
| `is` | Icelandic | Íslenska |
| `ig` | Igbo | Igbo |
| `id` | Indonesian | Bahasa Indonesia |
| `ga` | Irish | Gaeilge |
| `it` | Italian | Italiano |
| `lv` | Latvian | Latviešu |
| `lt` | Lithuanian | Lietuvių |
| `lb` | Luxembourgish | Lëtzebuergesch |
| `mg` | Malagasy | Malagasy |
| `ms` | Malay | Bahasa Melayu |
| `mt` | Maltese | Malti |
| `mi` | Maori | Te Reo Māori |
| `no` | Norwegian | Norsk |
| `pl` | Polish | Polski |
| `pt` | Portuguese | Português |
| `ro` | Romanian | Română |
| `sm` | Samoan | Gagana Sāmoa |
| `sn` | Shona | chiShona |
| `sk` | Slovak | Slovenčina |
| `sl` | Slovenian | Slovenščina |
| `so` | Somali | Soomaali |
| `st` | Sotho | Sesotho |
| `es` | Spanish | Español |
| `su` | Sundanese | Basa Sunda |
| `sw` | Swahili | Kiswahili |
| `sv` | Swedish | Svenska |
| `tk` | Turkmen | Türkmen |
| `tr` | Turkish | Türkçe |
| `uz` | Uzbek | O'zbek |
| `vi` | Vietnamese | Tiếng Việt |
| `cy` | Welsh | Cymraeg |
| `xh` | Xhosa | IsiXhosa |
| `yo` | Yoruba | Yorùbá |
| `zu` | Zulu | IsiZulu |

### Cyrillic Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `be` | Belarusian | Беларуская |
| `bg` | Bulgarian | Български |
| `kk` | Kazakh | Қазақша |
| `ky` | Kyrgyz | Кыргызча |
| `mk` | Macedonian | Македонски |
| `mn` | Mongolian | Монгол |
| `ru` | Russian | Русский |
| `sr` | Serbian | Српски |
| `tg` | Tajik | Тоҷикӣ |
| `tt` | Tatar | Татар |
| `uk` | Ukrainian | Українська |

### Arabic Script (RTL)

| Code | English Name | Native Name | `rtl` |
|------|-------------|-------------|-------|
| `ar` | Arabic | العربية | `true` |
| `fa` | Persian | فارسی | `true` |
| `ps` | Pashto | پښتو | `true` |
| `ur` | Urdu | اردو | `true` |

### Hebrew Script (RTL)

| Code | English Name | Native Name | `rtl` |
|------|-------------|-------------|-------|
| `he` | Hebrew | עברית | `true` |

### Greek Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `el` | Greek | Ελληνικά |

### Armenian Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `hy` | Armenian | Հայերեն |

### Georgian Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `ka` | Georgian | ქართული |

### Devanagari Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `hi` | Hindi | हिन्दी |
| `mr` | Marathi | मराठी |
| `ne` | Nepali | नेपाली |
| `sa` | Sanskrit | संस्कृतम् |

### Other Indic Scripts

| Code | English Name | Native Name | Script |
|------|-------------|-------------|--------|
| `bn` | Bengali | বাংলা | Bengali |
| `gu` | Gujarati | ગુજરાતી | Gujarati |
| `kn` | Kannada | ಕನ್ನಡ | Kannada |
| `ml` | Malayalam | മലയാളം | Malayalam |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi |
| `si` | Sinhala | සිංහල | Sinhala |
| `ta` | Tamil | தமிழ் | Tamil |
| `te` | Telugu | తెలుగు | Telugu |

### CJK

| Code | English Name | Native Name |
|------|-------------|-------------|
| `zh-Hans` | Chinese (Simplified) | 中文（简体） |
| `zh-Hant` | Chinese (Traditional) | 中文（繁體） |
| `ja` | Japanese | 日本語 |
| `ko` | Korean | 한국어 |

### Southeast Asian Scripts

| Code | English Name | Native Name | Script |
|------|-------------|-------------|--------|
| `km` | Khmer | ភាសាខ្មែរ | Khmer |
| `lo` | Lao | ລາວ | Lao |
| `my` | Burmese | မြန်မာဘာသာ | Myanmar |
| `th` | Thai | ภาษาไทย | Thai |

### Ethiopic Script

| Code | English Name | Native Name |
|------|-------------|-------------|
| `am` | Amharic | አማርኛ |

---

## Validation behavior

| Input | Behavior |
|-------|----------|
| Blank or missing | **400 Bad Request** |
| Longer than 10 characters | **400 Bad Request** |
| Valid code not in this list | **Warning logged**, translation proceeds — the AI may still handle it |
| Valid code in this list | Normal |

Languages outside the curated list are not blocked. The underlying AI models (GPT-4o, Claude Sonnet) support additional languages beyond what is listed here. Unknown codes will produce a server-side warning in the logs.

---

## Notes for the frontend

- Always fetch the live list from `GET /api/languages` rather than hardcoding — new languages can be added to the backend without a frontend release.
- Use `?script=` to group languages in a picker (e.g. show CJK, Latin, Cyrillic as sections).
- RTL languages require `dir="rtl"` when rendering translated text. Use the `rtl` field from the API response — do not hardcode this. Currently `rtl: true` for: Arabic (`ar`), Persian (`fa`), Pashto (`ps`), Urdu (`ur`), Hebrew (`he`).
- CJK and Indic scripts do not use spaces between words in the same way as Latin — avoid truncating translated text mid-character.
- Chinese has two codes (`zh-Hans`, `zh-Hant`) — treat them as distinct languages in the UI.
