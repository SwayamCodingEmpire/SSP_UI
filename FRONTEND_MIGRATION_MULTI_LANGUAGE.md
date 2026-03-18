# Frontend Migration: Multi-Language Translation Support

This document covers all breaking API changes introduced when decoupling translation from the project-level `targetLanguage`. The same analyzed chapter can now be translated into multiple languages independently.

---

## 1. Translation trigger — `POST /api/translation/chapters/{id}`

**Before:** `POST /api/translation/chapters/42?provider=openai`

**After:** `POST /api/translation/chapters/42?targetLanguage=en&provider=openai`

- `targetLanguage` is now a **required** query param (BCP-47: `"en"`, `"ko"`, `"es"`, etc.)
- Without it the request fails with 400.

---

## 2. Translation status — `GET /api/translation/chapters/{id}`

**Before:** `GET /api/translation/chapters/42`

**After:** `GET /api/translation/chapters/42?targetLanguage=en`

- `targetLanguage` is now a **required** query param.
- Response shape changed — added `targetLanguage` field:

```json
// Before
{ "chapterId": 42, "status": "AI_TRANSLATED", "provider": "openai" }

// After
{ "chapterId": 42, "targetLanguage": "en", "status": "AI_TRANSLATED", "provider": "openai" }
```

---

## 3. Get translated text — `GET /api/translation/chapters/{id}/text`

**Before:** `GET /api/translation/chapters/42/text`

**After:** `GET /api/translation/chapters/42/text?targetLanguage=en`

- `targetLanguage` is now a **required** query param.
- **Response type changed** from `TranslatedTextResponse` → `ChapterTranslationResponse`. Old fields are preserved; new fields added:

```json
{
  "id": 7,
  "chapterId": 42,
  "chapterNumber": 3,
  "title": "The Return",
  "targetLanguage": "en",
  "translationStatus": "AI_TRANSLATED",
  "translatedText": "...",
  "userEditedText": null,
  "userAccepted": null,
  "reviewedAt": null,
  "chunked": false,
  "totalSegments": null,
  "translatedSegments": null,
  "createdAt": "2026-03-14T10:00:00",
  "updatedAt": "2026-03-14T10:05:00"
}
```

---

## 4. Save translation review — `PUT /api/translation/chapters/{id}/save`

**Before:**
```json
{ "accepted": true, "editedText": null }
```

**After:**
```json
{ "targetLanguage": "en", "accepted": true, "editedText": null }
```

- `targetLanguage` is now a **required** field in the request body.
- Response is now `ChapterTranslationResponse` (same shape as above) instead of `TranslatedTextResponse`.

---

## 5. New endpoint — `GET /api/translation/chapters/{id}/languages`

Lists all language translations that exist for a chapter. Use this to populate a language switcher or show a per-language status overview.

```json
{
  "chapterId": 42,
  "translations": [
    {
      "targetLanguage": "en",
      "translationStatus": "AI_TRANSLATED",
      "userAccepted": true,
      "updatedAt": "2026-03-14T10:05:00"
    },
    {
      "targetLanguage": "ko",
      "translationStatus": "AI_TRANSLATED",
      "userAccepted": null,
      "updatedAt": "2026-03-14T11:00:00"
    }
  ]
}
```

---

## 6. Project creation — `POST /api/projects`

- `targetLanguage` is now **optional**. Existing projects with it set continue to work.
- The field remains in `ProjectResponse` and can be used as a UI default when suggesting a language for new translations.

---

## 7. New endpoint — `GET /api/projects/{id}/chapters/translations?targetLanguage=ko`

Returns every chapter in a project with its translation status for one specific language. Chapters not yet translated in that language return `null` for the translation fields.

```json
[
  {
    "chapterId": 1,
    "chapterNumber": 1,
    "title": "The Beginning",
    "analysisStatus": "ANALYZED",
    "targetLanguage": "ko",
    "translationStatus": "AI_TRANSLATED",
    "userAccepted": true,
    "updatedAt": "2026-03-14T11:00:00"
  },
  {
    "chapterId": 2,
    "chapterNumber": 2,
    "title": "The Return",
    "analysisStatus": "ANALYZED",
    "targetLanguage": "ko",
    "translationStatus": null,
    "userAccepted": null,
    "updatedAt": null
  }
]
```

Use this to render a chapter list with per-language progress — e.g. a progress bar, "Not translated" badges, and translate buttons for untranslated chapters.

**Recommended frontend flow for a language switcher:**
1. User opens a project → fetch `GET /api/languages` to populate the language picker
2. User selects a language (e.g. `ko`) → fetch `GET /api/projects/{id}/chapters/translations?targetLanguage=ko`
3. User clicks a chapter → fetch `GET /api/translation/chapters/{chapterId}/text?targetLanguage=ko`
4. If `translationStatus` is null → show a "Translate" button that calls `POST /api/translation/chapters/{id}?targetLanguage=ko`

---

## 8. Existing chapter list — `GET /api/projects/{id}/chapters`

- The `translationStatus` field on each chapter now reflects the **most advanced** status across all language translations (e.g. if `"en"` is `AI_TRANSLATED` and `"ko"` is `PENDING`, the field shows `AI_TRANSLATED`).
- This is a coarse indicator. For per-language status use `GET /api/translation/chapters/{id}/languages`.

---

## Migration summary

| Old flow | New flow |
|---|---|
| Translate button → fire and forget | Translate button → prompt for language → fire with `?targetLanguage=` |
| Poll status with no params | Poll status with `?targetLanguage=xx` or use `/languages` for all |
| Read `/text` with no params | Read `/text?targetLanguage=xx`, language picker required |
| Save review with `{ accepted, editedText }` | Save with `{ targetLanguage, accepted, editedText }` |
| Single translated text per chapter | Language tabs per chapter using `/languages` + `/text?targetLanguage=xx` |
