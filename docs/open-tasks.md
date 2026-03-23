# MyClup — Açık Task Listesi

> **Oluşturulma:** 2026-03-21 · **Kaynak:** GitHub Issues  
> **Son güncelleme (bu dosya):** 2026-03-21  
> **Sıralama:** Öncelik (P0 → P2) → Issue numarası

## Bu listenin anlamı

- Aşağıdaki tablolar **GitHub Issue** kayıtlarını listeler.
- **`Durum (GitHub)`** sütunu, issue üzerindeki `state:*` etiketlerinin **bu dosyaya otomatik yansıması değildir**; güncel iş akışı için her zaman ilgili issue’yu açın.
- **`Repo (2026-03)`** sütunu, **kod tabanındaki** karşılığı için repo içi nottur (iskelet, spec, tam akış ayrımı PR açıklamalarında).

### Teslimat — PR eşlemesi (özet)

| Konu                                          | Issue aralığı (özet)            | PR / not                                              |
| --------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| P0 paylaşımlı paketler                        | #54–#58                         | `master` — 2026-03 batch (CI + paketler)              |
| Epic #30 üye mobil MVP                        | #140–#142                       | [#209](https://github.com/birkanalp/my-clup/pull/209) |
| Epic #29 analytics / observability            | #163–#167                       | [#210](https://github.com/birkanalp/my-clup/pull/210) |
| Epic #31 personel mobil MVP                   | #168–#172                       | [#211](https://github.com/birkanalp/my-clup/pull/211) |
| Epic #32 salon web admin MVP                  | #173–#177                       | [#212](https://github.com/birkanalp/my-clup/pull/212) |
| Epic #33 platform web admin MVP               | #179–#184                       | [#213](https://github.com/birkanalp/my-clup/pull/213) |
| Epic #34 public website                       | #178, #182, #185, #186, #189    | [#214](https://github.com/birkanalp/my-clup/pull/214) |
| Epic #35 discovery marketplace                | #192, #194, #197, #199, #202    | [#215](https://github.com/birkanalp/my-clup/pull/215) |
| P2 (üyelik gözetimi, satış, CMS, AI, add-on…) | #125, #171, #181, #187–#201 vb. | [#216](https://github.com/birkanalp/my-clup/pull/216) |
| Bu dosyadaki batch notu                       | —                               | [#217](https://github.com/birkanalp/my-clup/pull/217) |
| #190 AI dilimleri (chat + çok dilli)          | #190                            | [#218](https://github.com/birkanalp/my-clup/pull/218) |

**Repo sütunu kısaltmaları:** `✓` teslim (planlanan kapsamda iskelet veya akış), `◐` kısmen, `○` bu satıra göre repo’da net karşılık yok / doğrulanmadı.

---

## P0 — Kritik / Temel Altyapı

| #   | Issue | Task Adı                                           | Açıklama                                                                  | Durum (GitHub)      | Repo (2026-03) | Link                                                  |
| --- | ----- | -------------------------------------------------- | ------------------------------------------------------------------------- | ------------------- | -------------- | ----------------------------------------------------- |
| 1   | #54   | packages/types — Core domain type definitions      | Tüm platformun kullandığı framework-agnostic alan tiplerinin tanımlanması | `state:in-progress` | ✓              | [#54](https://github.com/birkanalp/my-clup/issues/54) |
| 2   | #55   | packages/supabase — Shared Supabase client         | Paylaşılan Supabase client, tip stub'ları ve sunucu yardımcıları          | `state:assigned`    | ✓              | [#55](https://github.com/birkanalp/my-clup/issues/55) |
| 3   | #56   | packages/utils — Locale predicate helpers          | Locale yardımcı fonksiyonları `packages/utils` içinde                     | `state:assigned`    | ✓              | [#56](https://github.com/birkanalp/my-clup/issues/56) |
| 4   | #57   | packages/contracts — Zod schema foundations        | Paylaşılan Zod şema temelleri                                             | `state:proposed`    | ✓              | [#57](https://github.com/birkanalp/my-clup/issues/57) |
| 5   | #58   | packages/api-client — Typed HTTP client foundation | Tek tipli HTTP client                                                     | `state:proposed`    | ✓              | [#58](https://github.com/birkanalp/my-clup/issues/58) |

---

## P1 — Yüksek Öncelik

### Üyelik ve Faturalandırma (Epic #18)

| #   | Issue | Task Adı                                                        | Açıklama                                      | Durum (GitHub)   | Repo (2026-03) | Link                                                    |
| --- | ----- | --------------------------------------------------------------- | --------------------------------------------- | ---------------- | -------------- | ------------------------------------------------------- |
| 6   | #123  | Task 18.6: Web Gym Admin — Membership Plans and Billing Finance | Salon paneli üyelik planları ve finans yüzeyi | `state:proposed` | ✓              | [#123](https://github.com/birkanalp/my-clup/issues/123) |
| 7   | #124  | Task 18.5: Mobile Admin — Staff Membership Operations           | Mobil admin üyelik işlemleri                  | `state:proposed` | ✓              | [#124](https://github.com/birkanalp/my-clup/issues/124) |

### Üye Mobil App MVP (Epic #30)

| #   | Issue | Task Adı                                              | Açıklama              | Durum (GitHub)  | Repo (2026-03)                                            | Link                                                    |
| --- | ----- | ----------------------------------------------------- | --------------------- | --------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| 8   | #140  | Task 30.4: Mobile User — Booking and Calendar Surface | Rezervasyon ve takvim | `state:blocked` | ✓ · [#209](https://github.com/birkanalp/my-clup/pull/209) | [#140](https://github.com/birkanalp/my-clup/issues/140) |
| 9   | #141  | Task 30.5: Mobile User — Discovery Basics Surface     | Keşif temelleri       | `state:blocked` | ✓ · [#209](https://github.com/birkanalp/my-clup/pull/209) | [#141](https://github.com/birkanalp/my-clup/issues/141) |
| 10  | #142  | Task 30.6: Mobile User — Progress Foundations Surface | İlerleme yüzeyi       | `state:blocked` | ✓ · [#209](https://github.com/birkanalp/my-clup/pull/209) | [#142](https://github.com/birkanalp/my-clup/issues/142) |

### Analytics ve Observability (Epic #29)

| #   | Issue | Task Adı                                                                | Açıklama                       | Durum (GitHub)   | Repo (2026-03)                                            | Link                                                    |
| --- | ----- | ----------------------------------------------------------------------- | ------------------------------ | ---------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| 11  | #163  | Task 29.1: Shared Analytics Event Naming Conventions                    | Analitik olay adlandırma       | `state:proposed` | ✓ · [#210](https://github.com/birkanalp/my-clup/pull/210) | [#163](https://github.com/birkanalp/my-clup/issues/163) |
| 12  | #164  | Task 29.2: Audit Log Requirements for Sensitive Actions                 | Denetim günlüğü gereksinimleri | `state:proposed` | ✓ · [#210](https://github.com/birkanalp/my-clup/pull/210) | [#164](https://github.com/birkanalp/my-clup/issues/164) |
| 13  | #165  | Task 29.3: Structured Logging and Error Visibility Standards            | Log / hata görünürlüğü         | `state:proposed` | ✓ · [#210](https://github.com/birkanalp/my-clup/pull/210) | [#165](https://github.com/birkanalp/my-clup/issues/165) |
| 14  | #166  | Task 29.4: Observability for Auth, Chat, AI, and Tenant-Sensitive Flows | İzlenebilirlik                 | `state:proposed` | ✓ · [#210](https://github.com/birkanalp/my-clup/pull/210) | [#166](https://github.com/birkanalp/my-clup/issues/166) |
| 15  | #167  | Task 29.5: Admin Reporting and Monitoring Integration Points            | Raporlama entegrasyonu         | `state:proposed` | ✓ · [#210](https://github.com/birkanalp/my-clup/pull/210) | [#167](https://github.com/birkanalp/my-clup/issues/167) |

### Personel Mobil App MVP (Epic #31)

| #   | Issue | Task Adı                                                              | Açıklama                | Durum (GitHub)   | Repo (2026-03)                                                               | Link                                                    |
| --- | ----- | --------------------------------------------------------------------- | ----------------------- | ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| 16  | #168  | Task 31.1: Mobile Admin — Staff App Shell and Role-Aware Navigation   | Shell ve navigasyon     | `state:proposed` | ✓ · [#211](https://github.com/birkanalp/my-clup/pull/211)                    | [#168](https://github.com/birkanalp/my-clup/issues/168) |
| 17  | #169  | Task 31.2: Mobile Admin — Member Operations and Attendance Workflows  | Üye ve yoklama          | `state:proposed` | ✓ · [#211](https://github.com/birkanalp/my-clup/pull/211)                    | [#169](https://github.com/birkanalp/my-clup/issues/169) |
| 18  | #170  | Task 31.3: Mobile Admin — Chat, Class, and Workout Mobile Slices      | Sohbet, ders, antrenman | `state:proposed` | ◐ · [#211](https://github.com/birkanalp/my-clup/pull/211) (workouts iskelet) | [#170](https://github.com/birkanalp/my-clup/issues/170) |
| 19  | #172  | Task 31.5: Mobile Admin — QA and Localization Acceptance Requirements | QA / i18n kabul         | `state:proposed` | ✓ · [#211](https://github.com/birkanalp/my-clup/pull/211)                    | [#172](https://github.com/birkanalp/my-clup/issues/172) |

### Salon Admin Web MVP (Epic #32)

| #   | Issue | Task Adı                                                           | Açıklama                         | Durum (GitHub)   | Repo (2026-03)                                            | Link                                                    |
| --- | ----- | ------------------------------------------------------------------ | -------------------------------- | ---------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| 20  | #173  | Task 32.1: Web Gym Admin — Shell, Dashboard, Navigation            | Shell ve navigasyon              | `state:proposed` | ✓ · [#212](https://github.com/birkanalp/my-clup/pull/212) | [#173](https://github.com/birkanalp/my-clup/issues/173) |
| 21  | #174  | Task 32.2: Web Gym Admin — Member, Membership, Billing, Scheduling | Üye / üyelik / fatura / planlama | `state:proposed` | ◐ · [#212](https://github.com/birkanalp/my-clup/pull/212) | [#174](https://github.com/birkanalp/my-clup/issues/174) |
| 22  | #175  | Task 32.3: Web Gym Admin — Inbox, Campaign, Reporting              | Gelen kutusu, kampanya, rapor    | `state:proposed` | ◐ · [#212](https://github.com/birkanalp/my-clup/pull/212) | [#175](https://github.com/birkanalp/my-clup/issues/175) |
| 23  | #176  | Task 32.4: Web Gym Admin — Listing and Discovery Integration       | Liste ve keşif                   | `state:proposed` | ◐ · [#212](https://github.com/birkanalp/my-clup/pull/212) | [#176](https://github.com/birkanalp/my-clup/issues/176) |
| 24  | #177  | Task 32.5: Web Gym Admin — QA and Localization                     | QA / i18n                        | `state:proposed` | ✓ · [#212](https://github.com/birkanalp/my-clup/pull/212) | [#177](https://github.com/birkanalp/my-clup/issues/177) |

### Platform Admin Web MVP (Epic #33)

| #   | Issue | Task Adı                                                                | Açıklama                  | Durum (GitHub)   | Repo (2026-03)                                                            | Link                                                    |
| --- | ----- | ----------------------------------------------------------------------- | ------------------------- | ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| 25  | #179  | Task 33.1: Web Platform Admin — Shell and Dashboard                     | Shell                     | `state:proposed` | ✓ · [#213](https://github.com/birkanalp/my-clup/pull/213)                 | [#179](https://github.com/birkanalp/my-clup/issues/179) |
| 26  | #180  | Task 33.2: Web Platform Admin — Gym, User, Support, Moderation, Billing | Çoklu oversight yüzeyleri | `state:proposed` | ◐ · [#213](https://github.com/birkanalp/my-clup/pull/213) (stub sayfalar) | [#180](https://github.com/birkanalp/my-clup/issues/180) |
| 27  | #183  | Task 33.4: Audited Elevated-Action and Impersonation Boundaries         | Yükseltilmiş işlemler     | `state:proposed` | ◐ (docs + iskelet; `docs/23-…`)                                           | [#183](https://github.com/birkanalp/my-clup/issues/183) |
| 28  | #184  | Task 33.5: QA and Release Sensitivity                                   | QA / sürüm                | `state:proposed` | ✓ · [#213](https://github.com/birkanalp/my-clup/pull/213)                 | [#184](https://github.com/birkanalp/my-clup/issues/184) |

> **Not:** Epic #33 içinde **#181** (CMS) P2 tablosunda listelenir; repo karşılığı [#216](https://github.com/birkanalp/my-clup/pull/216) ile güçlendirildi.

### Public Website (Epic #34)

| #   | Issue | Task Adı                                               | Açıklama                    | Durum (GitHub)   | Repo (2026-03)                                            | Link                                                    |
| --- | ----- | ------------------------------------------------------ | --------------------------- | ---------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| 29  | #178  | Task 34.1: Marketing, Conversion, Legal, Support Pages | Pazarlama ve yasal sayfalar | `state:proposed` | ✓ · [#214](https://github.com/birkanalp/my-clup/pull/214) | [#178](https://github.com/birkanalp/my-clup/issues/178) |
| 30  | #182  | Task 34.2: Locale-Aware Routing and SEO                | SEO, hreflang, sitemap      | `state:proposed` | ✓ · [#214](https://github.com/birkanalp/my-clup/pull/214) | [#182](https://github.com/birkanalp/my-clup/issues/182) |
| 31  | #185  | Task 34.3: Lead Capture and Analytics                  | Lead formu, GA4             | `state:proposed` | ✓ · [#214](https://github.com/birkanalp/my-clup/pull/214) | [#185](https://github.com/birkanalp/my-clup/issues/185) |
| 32  | #186  | Task 34.4: Localization and Content Governance         | i18n yönetişimi             | `state:proposed` | ◐ · [#214](https://github.com/birkanalp/my-clup/pull/214) | [#186](https://github.com/birkanalp/my-clup/issues/186) |
| 33  | #189  | Task 34.5: QA and Performance Validation               | CWV / erişilebilirlik       | `state:proposed` | ◐ (dokümantasyon / kısmi)                                 | [#189](https://github.com/birkanalp/my-clup/issues/189) |

### Discovery Marketplace (Epic #35)

| #   | Issue | Task Adı                                  | Açıklama               | Durum (GitHub)   | Repo (2026-03)                                                                          | Link                                                    |
| --- | ----- | ----------------------------------------- | ---------------------- | ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 34  | #192  | Task 35.1: Discovery Domain Boundaries    | Model ve API sınırları | `state:proposed` | ◐ · [#215](https://github.com/birkanalp/my-clup/pull/215) + `docs/26-…`                 | [#192](https://github.com/birkanalp/my-clup/issues/192) |
| 35  | #194  | Task 35.2: Website and Mobile Discovery   | Web + mobil keşif      | `state:proposed` | ◐ · [#215](https://github.com/birkanalp/my-clup/pull/215) (web `/discover`; mobil ayrı) | [#194](https://github.com/birkanalp/my-clup/issues/194) |
| 36  | #197  | Task 35.3: Listing Content and Moderation | İçerik ve moderasyon   | `state:proposed` | ◐ · spec                                                                                | [#197](https://github.com/birkanalp/my-clup/issues/197) |
| 37  | #199  | Task 35.4: Review, Trial, Lead Routing    | Değerlendirme ve lead  | `state:proposed` | ◐ · spec                                                                                | [#199](https://github.com/birkanalp/my-clup/issues/199) |
| 38  | #202  | Task 35.5: Discovery SEO and Governance   | Keşif SEO              | `state:proposed` | ◐ · [#215](https://github.com/birkanalp/my-clup/pull/215)                               | [#202](https://github.com/birkanalp/my-clup/issues/202) |

---

## P2 — Orta Öncelik

### Üyelik ve Faturalandırma — Ek (Epic #18)

| #   | Issue | Task Adı                                                         | Açıklama                          | Durum (GitHub)   | Repo (2026-03)                                                             | Link                                                    |
| --- | ----- | ---------------------------------------------------------------- | --------------------------------- | ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| 39  | #125  | Task 18.7: Web Platform Admin — Membership and Finance Oversight | Platform üyelik / finans gözetimi | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216) (`/memberships`) | [#125](https://github.com/birkanalp/my-clup/issues/125) |

### Personel Mobil App — Satış (Epic #31)

| #   | Issue | Task Adı                                                      | Açıklama            | Durum (GitHub)   | Repo (2026-03)                                                           | Link                                                    |
| --- | ----- | ------------------------------------------------------------- | ------------------- | ---------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| 40  | #171  | Task 31.4: Mobile Admin — Sales and Lead Workflow Foundations | Satış / lead temeli | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216) (AsyncStorage) | [#171](https://github.com/birkanalp/my-clup/issues/171) |

### Platform Admin Web — CMS (Epic #33)

| #   | Issue | Task Adı                                   | Açıklama          | Durum (GitHub)   | Repo (2026-03)                                                               | Link                                                    |
| --- | ----- | ------------------------------------------ | ----------------- | ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| 41  | #181  | Task 33.3: CMS and Localization Operations | CMS operasyonları | `state:proposed` | ◐ · [#216](https://github.com/birkanalp/my-clup/pull/216) (governance metni) | [#181](https://github.com/birkanalp/my-clup/issues/181) |

### AI Service Foundation (Epic #36)

| #   | Issue | Task Adı                                             | Açıklama                  | Durum (GitHub)   | Repo (2026-03)                                                                                                    | Link                                                    |
| --- | ----- | ---------------------------------------------------- | ------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 42  | #187  | Task 36.1: AI — Server-Side Boundary and Runtime     | Ollama / sunucu sınırı    | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216) (`packages/ai`)                                         | [#187](https://github.com/birkanalp/my-clup/issues/187) |
| 43  | #188  | Task 36.2: Schema-Validated Outputs and Feature Flag | Zod + kill switch         | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216)                                                         | [#188](https://github.com/birkanalp/my-clup/issues/188) |
| 44  | #190  | Task 36.3: Workout, Chat, Multilingual AI Slices     | Dilimler                  | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216) + [#218](https://github.com/birkanalp/my-clup/pull/218) | [#190](https://github.com/birkanalp/my-clup/issues/190) |
| 45  | #191  | Task 36.4: Logging, Fallback, Review for AI Flows    | Log / fallback / inceleme | `state:proposed` | ◐ (`AiLogger`; ürün review akışı ayrı)                                                                            | [#191](https://github.com/birkanalp/my-clup/issues/191) |
| 46  | #193  | Task 36.5: Web and Mobile AI Integration Boundaries  | İstemci sınırları         | `state:proposed` | ✓ · `docs/27-ai-server-boundary.md` + paket README                                                                | [#193](https://github.com/birkanalp/my-clup/issues/193) |

### Add-On Platform (Epic #37)

| #   | Issue | Task Adı                                               | Açıklama             | Durum (GitHub)   | Repo (2026-03)                                                                 | Link                                                    |
| --- | ----- | ------------------------------------------------------ | -------------------- | ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| 47  | #195  | Task 37.1: Entitlement and Activation Model            | Yetki modeli         | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216) (`contracts/addons`) | [#195](https://github.com/birkanalp/my-clup/issues/195) |
| 48  | #196  | Task 37.2: Platform Admin Governance and Billing       | Platform yönetişimi  | `state:proposed` | ◐ · spec (`docs/28-…`)                                                         | [#196](https://github.com/birkanalp/my-clup/issues/196) |
| 49  | #198  | Task 37.3: Gym Admin Package Visibility                | Salon add-on sayfası | `state:proposed` | ✓ · [#216](https://github.com/birkanalp/my-clup/pull/216) (`/addons`)          | [#198](https://github.com/birkanalp/my-clup/issues/198) |
| 50  | #200  | Task 37.4: Downstream Issue Families                   | Alt modül aileleri   | `state:proposed` | ◐ · `docs/28-…`                                                                | [#200](https://github.com/birkanalp/my-clup/issues/200) |
| 51  | #201  | Task 37.5: Localization, Audit, Reporting for Packages | i18n / denetim       | `state:proposed` | ◐ · spec                                                                       | [#201](https://github.com/birkanalp/my-clup/issues/201) |

---

## Eski Format — Phase 1 Issues

> Bu issue'lar Phase 1 döneminden kalma etiketli kayıtlardır. Çoğu iş **yeni epic görevleri ve paket yapısı** ile örtüşür veya değişmiştir. Kapatma / birleştirme kararı için issue bazında GitHub’da kontrol edin; bu dosyada **Repo** sütunu yoktur.

| #   | Issue | Task Adı                                                             | Link                                                  |
| --- | ----- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| —   | #1    | [Phase 1] Monorepo kurulumu: pnpm, Turborepo, TypeScript             | [#1](https://github.com/birkanalp/my-clup/issues/1)   |
| —   | #2    | [Phase 1] Shared packages: contracts, types, utils, supabase         | [#2](https://github.com/birkanalp/my-clup/issues/2)   |
| —   | #3    | [Phase 1] Supabase kurulumu ve Auth yapılandırması                   | [#3](https://github.com/birkanalp/my-clup/issues/3)   |
| —   | #4    | [Phase 1] Data model: Gym, Branch, Member, Roles                     | [#4](https://github.com/birkanalp/my-clup/issues/4)   |
| —   | #5    | [Phase 1] Membership management: Plans, instances, renewals          | [#5](https://github.com/birkanalp/my-clup/issues/5)   |
| —   | #6    | [Phase 1] Class scheduling ve basic booking                          | [#6](https://github.com/birkanalp/my-clup/issues/6)   |
| —   | #7    | [Phase 1] Basic 1:1 Chat altyapısı                                   | [#7](https://github.com/birkanalp/my-clup/issues/7)   |
| —   | #8    | [Phase 1] User App (Expo): Proje iskeleti ve core profile/membership | [#8](https://github.com/birkanalp/my-clup/issues/8)   |
| —   | #9    | [Phase 1] User Admin Panel (Next.js): Gym web panel iskeleti         | [#9](https://github.com/birkanalp/my-clup/issues/9)   |
| —   | #10   | [Phase 1] User Admin App (Expo): Gym/instructor mobile iskeleti      | [#10](https://github.com/birkanalp/my-clup/issues/10) |
| —   | #11   | [Phase 1] Website: Marketing pages (Next.js)                         | [#11](https://github.com/birkanalp/my-clup/issues/11) |
| —   | #12   | [Phase 1] Admin Panel: Platform super-admin iskeleti                 | [#12](https://github.com/birkanalp/my-clup/issues/12) |

---

## Özet

| Kategori         | Satır sayısı (bu dosya) | Açıklama                                 |
| ---------------- | ----------------------: | ---------------------------------------- |
| P0               |                       5 | GitHub `state:*` bu dosyada güncellenmez |
| P1               |                      33 | Repo sütunu Mart 2026 teslimatına göre   |
| P2               |                      13 |                                          |
| Phase 1 (eski)   |                      12 | Ayrı doğrulama                           |
| **Toplam satır** |                  **63** | Issue başına bir satır (P0–P2)           |

**Repo özeti (2026-03):** P0–P2 satırlarının çoğunda kod veya spec karşılığı vardır; tam ürün derinliği (moderasyon, trial API, platform billing UI, insan onaylı AI yayın akışı vb.) için ilgili issue + PR gövdesindeki acceptance maddelerine bakın.
