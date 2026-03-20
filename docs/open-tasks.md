# MyClup — Açık Task Listesi

> Oluşturulma: 2026-03-21 | Kaynak: GitHub Issues
> Sıralama: Öncelik (P0 → P2) → Issue numarası

> **Batch execution (2026-03-21):** P0/P1 maddeleri ve P2’nin büyük kısmı ardışık PR’larla `master`’a alındı (ör. `#203`–`#215` ve sonraki P2 PR). Bu dosyadaki **Durum** sütunu GitHub etiketleriyle otomatik senkron değildir — güncel durum için ilgili issue’ya bakın.

---

## P0 — Kritik / Temel Altyapı

| #   | Issue | Task Adı                                           | Açıklama                                                                          | Durum               | Link                                                  |
| --- | ----- | -------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| 1   | #54   | packages/types — Core domain type definitions      | Tüm platformun kullandığı framework-agnostic alan tiplerininin tanımlanması       | `state:in-progress` | [#54](https://github.com/birkanalp/my-clup/issues/54) |
| 2   | #55   | packages/supabase — Shared Supabase client         | Paylaşılan Supabase client, tip stub'ları ve sunucu yardımcılarının oluşturulması | `state:assigned`    | [#55](https://github.com/birkanalp/my-clup/issues/55) |
| 3   | #56   | packages/utils — Locale predicate helpers          | Locale yardımcı fonksiyonlarının `packages/utils` içine eklenmesi                 | `state:assigned`    | [#56](https://github.com/birkanalp/my-clup/issues/56) |
| 4   | #57   | packages/contracts — Zod schema foundations        | Tüm API sözleşmeleri için paylaşılan Zod şema temellerinin oluşturulması          | `state:proposed`    | [#57](https://github.com/birkanalp/my-clup/issues/57) |
| 5   | #58   | packages/api-client — Typed HTTP client foundation | Tüm uygulamaların kullanacağı tek tipli HTTP client'ın oluşturulması              | `state:proposed`    | [#58](https://github.com/birkanalp/my-clup/issues/58) |

---

## P1 — Yüksek Öncelik

### Üyelik ve Faturalandırma (Epic #18)

| #   | Issue | Task Adı                                                        | Açıklama                                                                  | Durum            | Link                                                    |
| --- | ----- | --------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 6   | #123  | Task 18.6: Web Gym Admin — Membership Plans and Billing Finance | Salon yönetim panelinde üyelik planları ve faturalandırma finansı arayüzü | `state:proposed` | [#123](https://github.com/birkanalp/my-clup/issues/123) |
| 7   | #124  | Task 18.5: Mobile Admin — Staff Membership Operations           | Mobil admin uygulamasında personel üyelik işlemleri                       | `state:proposed` | [#124](https://github.com/birkanalp/my-clup/issues/124) |

### Üye Mobil App MVP (Epic #30)

| #   | Issue | Task Adı                                              | Açıklama                                       | Durum           | Link                                                    |
| --- | ----- | ----------------------------------------------------- | ---------------------------------------------- | --------------- | ------------------------------------------------------- |
| 8   | #140  | Task 30.4: Mobile User — Booking and Calendar Surface | Üye uygulamasında rezervasyon ve takvim yüzeyi | `state:blocked` | [#140](https://github.com/birkanalp/my-clup/issues/140) |
| 9   | #141  | Task 30.5: Mobile User — Discovery Basics Surface     | Üye uygulamasında temel keşif yüzeyi           | `state:blocked` | [#141](https://github.com/birkanalp/my-clup/issues/141) |
| 10  | #142  | Task 30.6: Mobile User — Progress Foundations Surface | Üye uygulamasında ilerleme takibi yüzeyi       | `state:blocked` | [#142](https://github.com/birkanalp/my-clup/issues/142) |

### Analytics ve Observability (Epic #29)

| #   | Issue | Task Adı                                                                | Açıklama                                                                                   | Durum            | Link                                                    |
| --- | ----- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------- |
| 11  | #163  | Task 29.1: Shared Analytics Event Naming Conventions                    | Tüm yüzeylerde kullanılacak analitik olay adlandırma kurallarının tanımlanması             | `state:proposed` | [#163](https://github.com/birkanalp/my-clup/issues/163) |
| 12  | #164  | Task 29.2: Audit Log Requirements for Sensitive Actions                 | Hassas işlemler için denetim günlüğü gereksinimlerinin belirlenmesi                        | `state:proposed` | [#164](https://github.com/birkanalp/my-clup/issues/164) |
| 13  | #165  | Task 29.3: Structured Logging and Error Visibility Standards            | Yapılandırılmış log formatı ve hata görünürlük standartlarının tanımlanması                | `state:proposed` | [#165](https://github.com/birkanalp/my-clup/issues/165) |
| 14  | #166  | Task 29.4: Observability for Auth, Chat, AI, and Tenant-Sensitive Flows | Auth, chat, AI ve tenant-hassas akışlar için izlenebilirlik gereksinimlerinin belirlenmesi | `state:proposed` | [#166](https://github.com/birkanalp/my-clup/issues/166) |
| 15  | #167  | Task 29.5: Admin Reporting and Monitoring Integration Points            | Admin yüzeylerinde raporlama ve izleme entegrasyon noktalarının belirlenmesi               | `state:proposed` | [#167](https://github.com/birkanalp/my-clup/issues/167) |

### Personel Mobil App MVP (Epic #31)

| #   | Issue | Task Adı                                                              | Açıklama                                                                    | Durum            | Link                                                    |
| --- | ----- | --------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 16  | #168  | Task 31.1: Mobile Admin — Staff App Shell and Role-Aware Navigation   | Personel uygulaması shell'i ve role göre navigasyon yapısının oluşturulması | `state:proposed` | [#168](https://github.com/birkanalp/my-clup/issues/168) |
| 17  | #169  | Task 31.2: Mobile Admin — Member Operations and Attendance Workflows  | Mobil personel için üye işlemleri ve devam takibi iş akışları               | `state:proposed` | [#169](https://github.com/birkanalp/my-clup/issues/169) |
| 18  | #170  | Task 31.3: Mobile Admin — Chat, Class, and Workout Mobile Slices      | Mobil personel için sohbet, ders ve antrenman yönetimi yüzeyleri            | `state:proposed` | [#170](https://github.com/birkanalp/my-clup/issues/170) |
| 19  | #172  | Task 31.5: Mobile Admin — QA and Localization Acceptance Requirements | Mobil admin için QA kapsam ve yerelleştirme kabul kriterleri                | `state:proposed` | [#172](https://github.com/birkanalp/my-clup/issues/172) |

### Salon Admin Web MVP (Epic #32)

| #   | Issue | Task Adı                                                                         | Açıklama                                                          | Durum            | Link                                                    |
| --- | ----- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 20  | #173  | Task 32.1: Web Gym Admin — Admin Shell, Dashboard, and Navigation                | Salon yönetim paneli shell'i, dashboard ve navigasyon yapısı      | `state:proposed` | [#173](https://github.com/birkanalp/my-clup/issues/173) |
| 21  | #174  | Task 32.2: Web Gym Admin — Member, Membership, Billing, and Scheduling Workflows | Web panelinde üye, üyelik, fatura ve ders planlama iş akışları    | `state:proposed` | [#174](https://github.com/birkanalp/my-clup/issues/174) |
| 22  | #175  | Task 32.3: Web Gym Admin — Shared Inbox, Campaign, and Reporting                 | Ortak mesaj kutusu, kampanya yönetimi ve operasyonel raporlama    | `state:proposed` | [#175](https://github.com/birkanalp/my-clup/issues/175) |
| 23  | #176  | Task 32.4: Web Gym Admin — Listing Management and Discovery Integration          | Salon listesi yönetimi ve keşif marketplace entegrasyonu          | `state:proposed` | [#176](https://github.com/birkanalp/my-clup/issues/176) |
| 24  | #177  | Task 32.5: Web Gym Admin — QA and Localization Acceptance Requirements           | Web salon paneli için QA kapsam ve yerelleştirme kabul kriterleri | `state:proposed` | [#177](https://github.com/birkanalp/my-clup/issues/177) |

### Platform Admin Web MVP (Epic #33)

| #   | Issue | Task Adı                                                                              | Açıklama                                                                  | Durum            | Link                                                    |
| --- | ----- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 25  | #179  | Task 33.1: Web Platform Admin — Admin Shell and Dashboard                             | Platform admin paneli shell ve genel bakış dashboard'u                    | `state:proposed` | [#179](https://github.com/birkanalp/my-clup/issues/179) |
| 26  | #180  | Task 33.2: Web Platform Admin — Gym, User, Support, Moderation, and Billing Oversight | Salon/kullanıcı yönetimi, destek, moderasyon ve platform faturalandırması | `state:proposed` | [#180](https://github.com/birkanalp/my-clup/issues/180) |
| 27  | #183  | Task 33.4: Web Platform Admin — Audited Elevated-Action and Impersonation Boundaries  | Denetimli yüksek yetkili işlemler ve kullanıcı kimliğine bürünme akışları | `state:proposed` | [#183](https://github.com/birkanalp/my-clup/issues/183) |
| 28  | #184  | Task 33.5: Web Platform Admin — QA and Release Sensitivity Expectations               | Platform admin için QA kapsam ve sürüm hassasiyet gereksinimleri          | `state:proposed` | [#184](https://github.com/birkanalp/my-clup/issues/184) |

### Public Website (Epic #34)

| #   | Issue | Task Adı                                                              | Açıklama                                                         | Durum            | Link                                                    |
| --- | ----- | --------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 29  | #178  | Task 34.1: Web Site — Marketing, Conversion, Legal, and Support Pages | Pazarlama, dönüşüm, yasal ve destek sayfalarının oluşturulması   | `state:proposed` | [#178](https://github.com/birkanalp/my-clup/issues/178) |
| 30  | #182  | Task 34.2: Web Site — Locale-Aware Routing and SEO Implementation     | Locale-aware URL yapısı, SEO meta, hreflang ve sitemap           | `state:proposed` | [#182](https://github.com/birkanalp/my-clup/issues/182) |
| 31  | #185  | Task 34.3: Web Site — Lead Capture and Analytics Integration          | Salon kayıt formu, lead yakalama ve GA4 entegrasyonu             | `state:proposed` | [#185](https://github.com/birkanalp/my-clup/issues/185) |
| 32  | #186  | Task 34.4: Web Site — Localization and Content Governance             | Website yerelleştirme, içerik yönetimi ve locale switcher        | `state:proposed` | [#186](https://github.com/birkanalp/my-clup/issues/186) |
| 33  | #189  | Task 34.5: Web Site — QA and Performance Validation                   | Core Web Vitals, erişilebilirlik ve SEO doğrulama gereksinimleri | `state:proposed` | [#189](https://github.com/birkanalp/my-clup/issues/189) |

### Discovery Marketplace (Epic #35)

| #   | Issue | Task Adı                                                                   | Açıklama                                                               | Durum            | Link                                                    |
| --- | ----- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 34  | #192  | Task 35.1: Discovery — Public Listing and Discovery Domain Boundaries      | Salon listesi veri modeli, arama alanı ve API sözleşmeleri             | `state:proposed` | [#192](https://github.com/birkanalp/my-clup/issues/192) |
| 35  | #194  | Task 35.2: Discovery — Website and Mobile Discovery Experience             | Website ve mobil üyede salon keşif arama ve detay sayfaları            | `state:proposed` | [#194](https://github.com/birkanalp/my-clup/issues/194) |
| 36  | #197  | Task 35.3: Discovery — Gym-Managed Listing Content and Moderation          | Salon tarafından yönetilen liste içeriği ve platform admin moderasyonu | `state:proposed` | [#197](https://github.com/birkanalp/my-clup/issues/197) |
| 37  | #199  | Task 35.4: Discovery — Review, Trial-Request, and Lead-Routing Integration | Üye değerlendirme sistemi, deneme ders talebi ve lead yönlendirme      | `state:proposed` | [#199](https://github.com/birkanalp/my-clup/issues/199) |
| 38  | #202  | Task 35.5: Discovery — Locale-Aware Discovery SEO and Content Governance   | Keşif sayfaları için locale-aware URL, structured data ve sitemap      | `state:proposed` | [#202](https://github.com/birkanalp/my-clup/issues/202) |

---

## P2 — Orta Öncelik

### Üyelik ve Faturalandırma — Ek (Epic #18)

| #   | Issue | Task Adı                                                         | Açıklama                                           | Durum            | Link                                                    |
| --- | ----- | ---------------------------------------------------------------- | -------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 39  | #125  | Task 18.7: Web Platform Admin — Membership and Finance Oversight | Platform admin panelinde üyelik ve finans denetimi | `state:proposed` | [#125](https://github.com/birkanalp/my-clup/issues/125) |

### Personel Mobil App — Satış (Epic #31)

| #   | Issue | Task Adı                                                      | Açıklama                                                           | Durum            | Link                                                    |
| --- | ----- | ------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------- | ------------------------------------------------------- |
| 40  | #171  | Task 31.4: Mobile Admin — Sales and Lead Workflow Foundations | Mobil personel için satış ve potansiyel müşteri iş akışı temelleri | `state:proposed` | [#171](https://github.com/birkanalp/my-clup/issues/171) |

### Platform Admin Web — CMS (Epic #33)

| #   | Issue | Task Adı                                                        | Açıklama                                       | Durum            | Link                                                    |
| --- | ----- | --------------------------------------------------------------- | ---------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 41  | #181  | Task 33.3: Web Platform Admin — CMS and Localization Operations | CMS ve çok dilli içerik operasyonları araçları | `state:proposed` | [#181](https://github.com/birkanalp/my-clup/issues/181) |

### AI Service Foundation (Epic #36)

| #   | Issue | Task Adı                                                                | Açıklama                                                                    | Durum            | Link                                                    |
| --- | ----- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 42  | #187  | Task 36.1: AI — Shared Server-Side AI Service Boundary and Runtime      | Paylaşılan sunucu taraflı AI servis sınırı ve Ollama runtime entegrasyonu   | `state:proposed` | [#187](https://github.com/birkanalp/my-clup/issues/187) |
| 43  | #188  | Task 36.2: AI — Schema-Validated Outputs and Feature-Flag Requirements  | AI çıktıları için Zod şema doğrulama ve feature flag altyapısı              | `state:proposed` | [#188](https://github.com/birkanalp/my-clup/issues/188) |
| 44  | #190  | Task 36.3: AI — Workout, Chat, and Multilingual Rewrite AI Slices       | Antrenman üretimi, sohbet önerileri ve çok dilli yeniden yazma AI dilimleri | `state:proposed` | [#190](https://github.com/birkanalp/my-clup/issues/190) |
| 45  | #191  | Task 36.4: AI — Logging, Fallback, and Review Requirements for AI Flows | AI akışları için loglama, yedek davranış ve insan incelemesi gereksinimleri | `state:proposed` | [#191](https://github.com/birkanalp/my-clup/issues/191) |
| 46  | #193  | Task 36.5: AI — Web and Mobile AI Integration Boundaries                | Web ve mobil uygulamalarda AI özelliklerinin entegrasyon sınırları          | `state:proposed` | [#193](https://github.com/birkanalp/my-clup/issues/193) |

### Add-On Platform (Epic #37)

| #   | Issue | Task Adı                                                                              | Açıklama                                                                   | Durum            | Link                                                    |
| --- | ----- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 47  | #195  | Task 37.1: Add-On Platform — Shared Entitlement and Activation Model                  | Ek paket yetki modeli ve aktivasyon API'si                                 | `state:proposed` | [#195](https://github.com/birkanalp/my-clup/issues/195) |
| 48  | #196  | Task 37.2: Add-On Platform — Platform Admin Governance and Billing Controls           | Platform admin için paket yönetimi ve faturalandırma denetimi              | `state:proposed` | [#196](https://github.com/birkanalp/my-clup/issues/196) |
| 49  | #198  | Task 37.3: Add-On Platform — Gym Admin Package Visibility and Configuration           | Salon admin panelinde ek paket görünürlüğü ve konfigürasyonu               | `state:proposed` | [#198](https://github.com/birkanalp/my-clup/issues/198) |
| 50  | #200  | Task 37.4: Add-On Platform — Package-Specific Downstream Issue Families               | AI chatbot, SMS, e-imza ve reklam modülü kapsam tanımları                  | `state:proposed` | [#200](https://github.com/birkanalp/my-clup/issues/200) |
| 51  | #201  | Task 37.5: Add-On Platform — Localization, Audit, and Reporting for Package Behaviors | Paket davranışları için yerelleştirme, denetim ve raporlama gereksinimleri | `state:proposed` | [#201](https://github.com/birkanalp/my-clup/issues/201) |

---

## Eski Format — Phase 1 Issues (Hâlâ Açık)

> Bu issue'lar projenin ilk döneminden kalma, yeni iş akışı formatına geçilmeden önceki görevlerdir.

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

| Kategori              | Sayı   |
| --------------------- | ------ |
| P0 — Kritik altyapı   | 5      |
| P1 — Yüksek öncelik   | 33     |
| P2 — Orta öncelik     | 13     |
| Eski format (Phase 1) | 12     |
| **Toplam açık task**  | **63** |
