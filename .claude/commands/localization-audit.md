Audit localization coverage for the client-facing code changes described.

Client-facing work is not done until localization is audited. Scan the specified files or changes and output missing translations, unsafe strings, locale issues, and recommended fixes.

Files, PR, or change description to audit: $ARGUMENTS

If no argument provided, audit recently modified files in the client-facing paths.

## In-Scope Paths

- `apps/mobile-user`
- `apps/mobile-admin`
- `apps/web-gym-admin`
- `apps/web-platform-admin`
- `apps/web-site`
- `packages/ui-web`
- `packages/ui-native`

## Verification Checklist

| Check | What to look for |
|-------|-----------------|
| No hardcoded strings | Literal strings in JSX `children`, `label`, `placeholder`, `title`, `alt`, error messages, button text |
| Translation keys exist | `t()`, `useTranslation()`, or equivalent; keys present in translation files |
| Locale-aware formatting | Dates, times, numbers, currencies, units use shared locale utilities — not raw `toLocaleDateString()` without locale param |
| Fallback behavior | Missing translation handling; no empty strings or raw key names shown to users |

## Output

### Missing Translations

| Location | String | Recommendation |
|----------|--------|----------------|
| `file:line` | `"literal text"` | Add key `suggested.key` to translation resources |

### Unsafe Strings

| Location | Issue | Recommendation |
|----------|-------|----------------|
| `file:line` | Hardcoded string / placeholder / alt text | Replace with `t('key')` |

### Locale Issues

| Location | Issue | Recommendation |
|----------|-------|----------------|
| `file:line` | Date without locale | Use `formatDate(value, locale)` |
| `file:line` | Currency without locale | Use `formatCurrency(value, locale)` |

### Recommended Fixes

1. [Fix 1 — specific action with file location]
2. [Fix 2]

## Patterns to Flag

- Hardcoded: `"Submit"`, `"Loading..."`, `"Error"`, `placeholder="Enter name"`
- Raw formatting: `new Date().toLocaleDateString()` without locale; `number.toString()` for display
- Missing key: UI renders string but no `t()` or equivalent
- Empty fallback: `t('key') || ''` — user sees nothing; should use default locale
- Key as display: when `t('key')` is missing and key name itself is shown

## Rules

- Skip server-only, config, and dev-only code unless it produces user-facing output
- `ui-web` and `ui-native` components must not contain hardcoded strings — they receive translated props or use shared i18n
- Each finding must include a concrete fix recommendation
