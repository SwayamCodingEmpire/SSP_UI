# API Migration Guide — v1 → v2

All endpoints have moved from `/api/` to `/api/v2/`.
This document covers every breaking change and new feature the frontend must accommodate.

---

## 1. Base Path Change (ALL ENDPOINTS)

| Before | After |
|--------|-------|
| `/api/...` | `/api/v2/...` |

This is the single most impactful change. Every request URL must be updated.

---

## 2. Chapter Ingestion (`/api/v2/chapters`)

### 2a. Endpoint path renames

| Before | After |
|--------|-------|
| `POST /api/chapters/upload` | `POST /api/v2/chapters/upload` |
| `POST /api/chapters/process` | `POST /api/v2/chapters` *(path simplified — no `/process` suffix)* |
| `POST /api/chapters/process-text` | `POST /api/v2/chapters/text` *(renamed from `/process-text`)* |
| `GET /api/chapters/{id}` | `GET /api/v2/chapters/{id}` |

### 2b. Response body change

**Before** (`ChapterProcessingResponse`):
```json
{
  "id": 1,
  "chapterNumber": 3,
  "title": "Chapter 3",
  "status": "PROCESSED",
  "translationStatus": "PENDING",
  "analysisStatus": "ANALYZED",
  "preview": "First 200 chars...",
  "fullOriginalText": "Full text here..."
}
```

**After** (`IngestChapterResponse`):
```json
{
  "chapterId": 1,
  "chapterNumber": 3,
  "title": "Chapter 3",
  "status": "PROCESSED",
  "analysisStatus": "ANALYZED",
  "originalTextPreview": "First 200 chars..."
}
```

**Breaking changes:**
- `id` → renamed to `chapterId`
- `preview` → renamed to `originalTextPreview`
- `translationStatus` field **removed** — use `GET /api/v2/translation/chapters/{id}?targetLanguage=X` instead
- `fullOriginalText` field **removed** — full text is never returned in this endpoint

---

## 3. Translation (`/api/v2/translation`)

### 3a. All paths gain `/v2/` prefix — no other path changes

| Before | After |
|--------|-------|
| `POST /api/translation/chapters/{id}` | `POST /api/v2/translation/chapters/{id}` |
| `GET /api/translation/chapters/{id}` | `GET /api/v2/translation/chapters/{id}` |
| `GET /api/translation/chapters/{id}/text` | `GET /api/v2/translation/chapters/{id}/text` |
| `GET /api/translation/chapters/{id}/languages` | `GET /api/v2/translation/chapters/{id}/languages` |
| `PUT /api/translation/chapters/{id}/save` | `PUT /api/v2/translation/chapters/{id}/save` |

### 3b. New `translationStatus` values

Two new values added to `translationStatus` across all translation endpoints:

| Value | Meaning |
|-------|---------|
| `TRANSLATING` | AI translation is actively running — show spinner |
| `FAILED` | AI translation failed — show retry option |

**Existing values unchanged:** `PENDING`, `AI_TRANSLATED`, `HUMAN_REVIEWED`, `APPROVED`

### 3c. Translation status response — unchanged shape

`GET /api/v2/translation/chapters/{id}?targetLanguage=en`
```json
{
  "chapterId": 1,
  "targetLanguage": "en",
  "status": "TRANSLATING",
  "provider": "openai"
}
```
> **Frontend polling**: Poll this endpoint until `status` is `AI_TRANSLATED` or `FAILED`.
> Same polling pattern as analysis. Do not wait on the POST — it returns 202 immediately.

### 3d. Translated text response — shape change

`GET /api/v2/translation/chapters/{id}/text?targetLanguage=en`

**Before** (`ChapterTranslationResponse`):
```json
{
  "id": 5,
  "chapterId": 1,
  "chapterNumber": 3,
  "title": "Chapter 3",
  "targetLanguage": "en",
  "translationStatus": { "name": "AI_TRANSLATED" },
  "translatedText": "...",
  "userEditedText": null,
  "userAccepted": null,
  "reviewedAt": null,
  "chunked": false,
  "totalSegments": 1,
  "translatedSegments": 1,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:05:00"
}
```

**After** (`TranslatedTextResult`):
```json
{
  "id": 5,
  "chapterId": 1,
  "chapterNumber": 3,
  "title": "Chapter 3",
  "targetLanguage": "en",
  "translationStatus": "AI_TRANSLATED",
  "translatedText": "...",
  "userEditedText": null,
  "userAccepted": null,
  "reviewedAt": null,
  "chunked": false,
  "totalSegments": 1,
  "translatedSegments": 1,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:05:00"
}
```

**Breaking change:** `translationStatus` is now a plain `String` (`"AI_TRANSLATED"`) instead of an object.

### 3e. Review save response — shape change

`PUT /api/v2/translation/chapters/{id}/save`

Request body — **unchanged**:
```json
{
  "targetLanguage": "en",
  "accepted": false,
  "editedText": "User's corrected version..."
}
```

**Before** — returned full `ChapterTranslationResponse` (many fields including chapterNumber, title, chunked, etc.)

**After** — returns a leaner `ReviewResult`:
```json
{
  "translationId": 5,
  "chapterId": 1,
  "targetLanguage": "en",
  "translationStatus": "HUMAN_REVIEWED",
  "translatedText": "Original AI text...",
  "userEditedText": "User's corrected version...",
  "userAccepted": false
}
```

**Breaking change:** Fields `chapterNumber`, `title`, `reviewedAt`, `chunked`, `totalSegments`, `translatedSegments`, `createdAt`, `updatedAt` **no longer returned** from this endpoint. Fetch from `/text` if needed.

### 3f. Available languages response — shape change

`GET /api/v2/translation/chapters/{id}/languages`

**Before** (`AvailableTranslationsResponse`):
```json
{
  "chapterId": 1,
  "translations": [
    { "targetLanguage": "en", "translationStatus": {...}, "userAccepted": null, "updatedAt": "..." }
  ]
}
```

**After** (flat `List<AvailableTranslation>`):
```json
[
  { "targetLanguage": "en", "status": "AI_TRANSLATED", "userAccepted": null, "updatedAt": "..." }
]
```

**Breaking changes:**
- Top-level wrapper object removed — response is now a direct array
- `translationStatus` object → `status` string

---

## 4. Analysis (`/api/v2/analysis`)

### 4a. Path — `/v2/` prefix only, no other changes

### 4b. Status response — `tensionLevel` type change

`GET /api/v2/analysis/chapters/{id}`

```json
{
  "chapterId": 1,
  "status": "ANALYZED",
  "characterCount": 5,
  "sceneCount": 3,
  "characterNames": ["Shirou", "Rin", "Archer"],
  "scenePreviews": [
    {
      "type": "BATTLE",
      "summary": "Shirou faces Archer in the arena",
      "tensionLevel": 9
    }
  ]
}
```

**Breaking change:** `tensionLevel` in `ScenePreview` changed from `Double` (0.0–1.0) to `Integer` (0–10). Multiply old values by 10 for equivalence.

---

## 5. Narrative Data (`/api/v2/projects/{projectId}`)

### 5a. Removed endpoint

`GET /api/projects/{id}/chapters/translations?targetLanguage=X` — **REMOVED, no replacement.**

Use `GET /api/v2/projects/{id}/chapters` for the chapter list, then call the translation endpoint per chapter if needed.

### 5b. Chapter list response change

`GET /api/v2/projects/{projectId}/chapters`

**Before** — returned full `ChapterProcessingResponse` (included `translationStatus`, `fullOriginalText`, `preview`)

**After** (`ChapterSummary`):
```json
[
  {
    "id": 1,
    "chapterNumber": 1,
    "title": "Prologue",
    "status": "PROCESSED",
    "analysisStatus": "ANALYZED",
    "preview": "First 200 chars..."
  }
]
```

**Breaking changes:**
- `translationStatus` **removed** from chapter list
- `fullOriginalText` **removed**

### 5c. Character response — enum fields now strings

`GET /api/v2/projects/{projectId}/characters`

**Before** — `role` was an enum object: `{ "name": "PROTAGONIST" }`
**After** — `role` is a plain string: `"PROTAGONIST"`

Also: `aliases` was `List<String>` before and remains `List<String>` — no change.

### 5d. CharacterState — `dialogueEmotionIntensity` type change

`GET /api/v2/projects/{projectId}/characters/{characterId}/states`

**Breaking change:** `dialogueEmotionIntensity` changed from `Double` (0.0–1.0) to `Integer` (0–100).

### 5e. Relationship response — enum fields now strings

`GET /api/v2/projects/{projectId}/relationships`

**Before** — `type` was enum object: `{ "name": "ALLY" }`
**After** — `type` is plain string: `"ALLY"`

### 5f. Scene response — enum fields and tensionLevel type change

`GET /api/v2/projects/{projectId}/scenes`

**Breaking changes:**
- `type`, `pace`, `tone`, `narrativeTimeType` — all changed from enum objects to plain strings
- `tensionLevel` — changed from `Double` (0.0–1.0) to `Integer` (0–10)

---

## 6. Projects (`/api/v2/projects`)

### 6a. Path — `/v2/` prefix only

### 6b. Response — `status` is now a string, extra counts added

**Before** (`ProjectResponse`):
```json
{
  "id": 1,
  "title": "My Novel",
  "sourceLanguage": "ja",
  "targetLanguage": "en",
  "status": { "name": "ACTIVE" },
  "description": "...",
  "translationStyle": "..."
}
```

**After** (`ProjectResult`):
```json
{
  "id": 1,
  "title": "My Novel",
  "sourceLanguage": "ja",
  "targetLanguage": "en",
  "status": "ACTIVE",
  "description": "...",
  "originalFileName": "novel.epub",
  "fileFormat": "EPUB",
  "translationStyle": "...",
  "chapterCount": 12,
  "characterCount": 7,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-02T10:00:00"
}
```

**Changes:**
- `status` — object → plain string
- **New fields**: `originalFileName`, `fileFormat`, `chapterCount`, `characterCount`, `createdAt`, `updatedAt`

---

## 7. Error Responses

All error responses now follow a consistent shape:
```json
{
  "error": "CHAPTER_NOT_FOUND",
  "message": "Chapter not found: 42"
}
```

| Error code | HTTP status | Trigger |
|---|---|---|
| `CHAPTER_NOT_FOUND` | 404 | Chapter ID doesn't exist |
| `PROJECT_NOT_FOUND` | 404 | Project ID doesn't exist |
| `TRANSLATION_NOT_FOUND` | 404 | No translation for chapter+language |
| `TRANSLATION_NOT_COMPLETE` | 409 | Tried to review before translation finished |
| `DOMAIN_ERROR` | 400 | Any other domain validation failure |
| `DOCUMENT_PARSE_FAILED` | 422 | Uploaded file could not be parsed |

**Before** — errors returned HTTP 400/500 with no consistent body shape.

---

## 8. Quick Migration Checklist for Frontend

- [ ] Update base URL from `/api/` to `/api/v2/` across all HTTP calls
- [ ] `POST /api/chapters/process` → `POST /api/v2/chapters` (remove `/process` suffix)
- [ ] `POST /api/chapters/process-text` → `POST /api/v2/chapters/text`
- [ ] Chapter response: `id` → `chapterId`, `preview` → `originalTextPreview`, remove `translationStatus` usage
- [ ] Translation: `translationStatus` is now a string, not an object — update `.name` accessors
- [ ] Translation polling: add `TRANSLATING` and `FAILED` states to the status display
- [ ] Review response: fewer fields — don't rely on `chapterNumber`/`title` from this response
- [ ] Languages response: unwrap from `{ chapterId, translations: [...] }` — now a plain array
- [ ] Analysis: `tensionLevel` in scene previews is now 0–10 integer (was 0.0–1.0 double)
- [ ] Character states: `dialogueEmotionIntensity` is now 0–100 integer (was 0.0–1.0 double)
- [ ] All enum fields (`role`, `type`, `status`, `pace`, `tone`, etc.) are now plain strings — remove any `.name` unwrapping
- [ ] Remove all usage of `GET /api/projects/{id}/chapters/translations` — endpoint removed
- [ ] Error handling: update to read `{ error, message }` body shape consistently
