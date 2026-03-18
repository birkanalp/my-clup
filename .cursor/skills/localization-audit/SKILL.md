---
name: localization-audit
description: Ensure localization coverage for client-facing features. Use when reviewing UI changes, before merge, or auditing i18n. Verifies no hardcoded strings, translation keys, locale-aware formatting, fallback behavior. Outputs missing translations, unsafe strings, locale issues, recommended fixes.
---

# Localization Audit

## Purpose

Scan code changes and verify localization coverage for client-facing features. Output missing translations, unsafe strings, locale issues, and recommended fixes. **Client-facing work is not done until localization is audited.**

## Verification Checklist

| Check | Look for |
|-------|----------|
| **No hardcoded strings** | Literal strings in JSX, `children`, `label`, `placeholder`, `title`, `alt`, error messages, button text |
| **Translation keys exist** | `t()`, `useTranslation()`, or equivalent with key; keys present in translation files |
| **Locale-aware formatting** | Dates, times, numbers, currencies, units use shared locale utilities (not raw `toLocaleString` without locale param) |
| **Fallback behavior** | Missing translation handling; no empty strings or raw key names shown to users |

## In-Scope Paths

- `apps/mobile-user`
- `apps/mobile-admin`
- `apps/web-gym-admin`
- `apps/web-platform-admin`
- `apps/web-site`
- `packages/ui-web`
- `packages/ui-native`

## Output Template

Emit this structure for each audit:

```markdown
# Localization Audit: [Change Description]

## Missing Translations

| Location | String | Recommendation |
|----------|--------|----------------|
| [file:line] | [literal text] | Add key `[suggested.key]` to translation resources |

## Unsafe Strings

| Location | Issue | Recommendation |
|----------|-------|----------------|
| [file:line] | [hardcoded string / placeholder / alt] | Replace with `t('key')` or translation-driven value |

## Locale Issues

| Location | Issue | Recommendation |
|----------|-------|----------------|
| [file:line] | [Date/number without locale] | Use `formatDate(value, locale)` or shared locale utility |
| [file:line] | [Currency without locale] | Use `formatCurrency(value, locale)` |

## Recommended Fixes

1. [Fix 1 — specific action]
2. [Fix 2]
3. ...
```

## Patterns to Flag

- **Hardcoded**: `"Submit"`, `"Loading..."`, `"Error"`, `placeholder="Enter name"`
- **Raw formatting**: `new Date().toLocaleDateString()` without locale param; `number.toString()` for display
- **Missing key**: UI renders string but no `t()` or equivalent
- **Empty fallback**: `t('key') || ''` — user sees nothing; use default locale or placeholder
- **Key as display**: `t('key')` when key is missing and key name is shown — define fallback

## Rules

- **Client-facing only**: Skip server-only, config, or dev-only code unless it produces user-facing output
- **Shared packages**: `ui-web` and `ui-native` components must not contain hardcoded strings; they receive translated props or use shared i18n
- **Fallback**: Recommend defining default locale and safe placeholder behavior
- **Actionable**: Each finding should include a concrete fix recommendation
