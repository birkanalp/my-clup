# Add-on Packages Plan

## 1. Overview

MyClup add-on packages are optional, independently purchasable modules that gyms can activate on top of their core subscription. Each package targets a specific pain point or growth lever. Gyms choose only what they need.

All packages are managed from the platform admin panel (activate, deactivate, billing) and reflected in the gym's User Admin Panel and App.

All add-on packages must operate correctly in a multilingual product environment. Package settings, UI, generated content, and member-facing outputs should support locale awareness where applicable.

---

## 2. Package Catalog

### 2.1 AI Chatbot

**Hedef salon:** Büyük üye tabanına sahip, mesai saati dışında üye sorularıyla boğuşan salonlar.

**Ne yapar:**
- Üyelerin sıkça sorduğu soruları (çalışma saatleri, ders programı, paket fiyatları, dondurma koşulları) otomatik yanıtlar
- Mesai saati dışında 24/7 destek sağlar
- Yanıt veremediği durumlarda konuşmayı insan personele devreder (handoff)
- Salon, chatbot'un bilgi tabanını (SSS, duyurular, kurallar) kendi panelinden yönetir
- Chatbot mesajları normal chat inbox'ında görünür, transfer edildiğinde personel devralır

**Özellikler:**
- Salon-bazlı bilgi tabanı editörü
- Otomatik yanıt kurallari ve tetikleyiciler
- Handoff eşiği ayarı (örn: 2 mesajda cevap veremezse devret)
- Chatbot konuşma istatistikleri (çözüm oranı, devir oranı)
- Dil desteği (TR + EN başlangıç)

**Platform gereksinimleri:**
- Chat altyapısına bot kullanıcı tipi eklenmesi
- Bilgi tabanı CRUD API'si
- Handoff mekanizması
- Admin panel: chatbot içerik yönetimi, istatistik görüntüleme
- Çok dilli bilgi tabanı ve locale-aware yanıt üretimi

---

### 2.2 Platform Reklamcılığı

**Hedef salon:** Marka bilinirliğini artırmak, yeni üye kazanmak ve mevcut üyelerine kampanya duyurmak isteyen salonlar.

**Ne yapar:**
- Salon, platformdaki diğer kullanıcılara (henüz üyesi olmayan, yakın çevredeki) hedefli reklam yayınlar
- Discovery / Keşfet bölümünde öne çıkarılmış listeleme
- Push bildirim kampanyası gönderimi (platform üyelerine, üye olmayan yakın çevredeki kullanıcılara)
- In-app banner veya öne çıkarılmış kart reklamları

**Özellikler:**
- Kampanya oluşturma (başlık, görsel, CTA, bütçe, süre)
- Hedef kitle seçimi (konum, yaş, ilgi, daha önce trial kullanan)
- Harcama limiti ve günlük bütçe kontrolü
- Performans raporu (gösterim, tıklama, dönüşüm, maliyet)
- Reklam içeriği platform tarafından onaylanır

**Platform gereksinimleri:**
- Reklam envanteri ve placement sistemi
- Kitle hedefleme motoru
- Admin panel: kampanya onay kuyruğu, billing entegrasyonu
- Analytics pipeline: impression, click, conversion tracking
- Çok dilli reklam kreatifi ve locale bazlı hedefleme desteği

---

### 2.3 Üye Koruma

**Hedef salon:** Rakip salonların kendi üyelerine ulaşmasını engellemek isteyen, üye bağlılığına önem veren salonlar.

**Ne yapar:**
- Bu paketi alan salonun aktif üyeleri, başka salonların platform reklamları ve push kampanyalarından muaf tutulur
- Discovery bölümünde, aktif üye olan kullanıcılara rakip salonlar öne çıkarılmaz
- Platform, bu üyelerin verilerini reklam hedefleme havuzunun dışında tutar

**Özellikler:**
- Üye koruma aktif/pasif durumu salon panelinden görülebilir
- Korunan üye sayısı istatistiği
- Koruma kapsamı açıklaması (hangi reklam tipleri engelleniyor)

**Platform gereksinimleri:**
- Reklam hedefleme motoru üye koruma filter desteği
- Discovery sıralamasında üye koruma flag'i
- Admin panel: koruma durumu görüntüleme ve override (abuse durumları için)

**Not:** Bu paket Reklam Paketi ile bağımsızdır. Salon reklam vermeden sadece koruma alabilir ya da ikisini birden kullanabilir.

---

### 2.4 Gelişmiş Analitik

**Hedef salon:** Veriye dayalı karar vermek isteyen, büyük üye tabanına sahip veya çok şubeli salonlar.

**Ne yapar:**
- Temel raporların ötesinde derinlemesine üye ve gelir analizi sunar
- Churn riski yüksek üyeleri önceden tespit eder
- Cohort analizi ile üye yaşam boyu değerini gösterir
- Gelir projeksiyonu ve sezonsal trend analizleri sağlar

**Özellikler:**
- Churn risk skoru: her üye için risk puanı ve tetikleyen sebepler
- Cohort analizi: belirli dönemlerde kazanılan üyelerin tutma oranları
- Gelir projeksiyonu: mevcut paket yapısına göre önümüzdeki 3–6 aylık gelir tahmini
- Üye segmentasyonu: aktif, risk, uyuyan, VIP, yeni segmentleri
- Instructor performans analizi: ders doluluk oranı, üye memnuniyeti
- CSV / Excel dışa aktarım
- Özelleştirilebilir dashboard widget'ları

**Platform gereksinimleri:**
- Analytics data pipeline (event aggregation)
- ML model veya kural tabanlı churn skoring servisi
- Raporlama API katmanı
- Admin panel: gym başına analitik paket kontrolü

---

### 2.5 Toplu SMS / WhatsApp

**Hedef salon:** Üyelerine platform dışı kanallardan ulaşmak isteyen, platform uygulamasını indirmemiş üyeleri olan salonlar.

**Ne yapar:**
- SMS ve/veya WhatsApp Business API üzerinden toplu veya tetikleyici bazlı mesaj gönderimi
- Üyelik yenileme, ödeme hatırlatma, kampanya duyurusu gibi kritik iletişimleri platform dışına taşır
- Platforma giriş yapmayan üyelere de ulaşmayı sağlar

**Özellikler:**
- Toplu SMS gönderimi (segmente edilmiş kitleye)
- WhatsApp Business API entegrasyonu (onaylı mesaj şablonları)
- Otomatik tetikleyiciler: üyelik bitişinden X gün önce, ödeme gecikmesinde
- Mesaj şablonu editörü
- Gönderim ve okunma istatistikleri
- Aylık mesaj kredisi ve aşım uyarısı

**Platform gereksinimleri:**
- SMS gateway entegrasyonu (örn: Netgsm, iletimerkezi)
- WhatsApp Business API entegrasyonu
- Mesaj kredi yönetim sistemi
- Admin panel: gönderim logları, kota yönetimi
- Şablonların locale bazlı yönetimi

---

### 2.6 Dijital Sözleşme & E-imza

**Hedef salon:** Kağıt sözleşme sürecini dijitalleştirmek isteyen, yasal uyumluluk gereksinimleri olan salonlar.

**Ne yapar:**
- Üyelik sözleşmeleri mobil cihaz veya tablet üzerinden dijital imzalanır
- İmzalanan belgeler arşivlenir ve üyenin profilinden erişilebilir
- Sözleşme şablonları salon tarafından özelleştirilebilir

**Özellikler:**
- Sözleşme şablonu editörü (değişken alanları: üye adı, paket, fiyat, tarih vb.)
- Mobil e-imza arayüzü (parmak veya stylus)
- Onay ve imza zaman damgası
- Otomatik PDF oluşturma ve arşivleme
- Üyeye e-posta ile kopyasını gönderme
- KVKK açık rıza metni entegrasyonu
- Toplu sözleşme durumu görüntüleme (imzalandı / bekliyor)

**Platform gereksinimleri:**
- PDF oluşturma servisi
- Güvenli belge saklama (encrypted, long-term storage)
- E-imza yasal geçerlilik standartlarına uyumluluk
- Admin panel: şablon yönetimi, imza log görüntüleme
- Sözleşme ve açık rıza metinlerinin çok dilli sürüm yönetimi

---

### 2.7 CRM & Otomasyon

**Hedef salon:** Üye tutma oranını artırmak, satış süreçlerini otomatikleştirmek isteyen büyüme odaklı salonlar.

**Ne yapar:**
- Lead ve üye yaşam döngüsü boyunca otomatik iletişim akışları tanımlanır
- Manuel takip gerektiren süreçler (yenileme hatırlatma, kayıp geri kazanma, yeni üye karşılama) otomatize edilir
- Drip kampanyalar ile doğru zamanda doğru mesaj gönderilir

**Özellikler:**
- Görsel workflow builder (tetikleyici → koşul → eylem)
- Tetikleyiciler: üyelik bitiş tarihi, son check-in tarihi, ödeme durumu, lead formu doldurma
- Eylemler: chat mesajı gönder, SMS gönder, görev oluştur, etiketi değiştir, personele bildir
- Hazır şablon workflow'ları: yeni üye karşılama, kayıp üye geri kazanma, yenileme kampanyası
- A/B mesaj testi
- Otomasyon performans raporu (tetiklenme sayısı, dönüşüm oranı)

**Platform gereksinimleri:**
- Workflow engine (event-driven)
- Koşul ve eylem kütüphanesi
- Mesaj gönderim entegrasyonları (chat, SMS, push)
- Admin panel: salon başına aktif workflow sayısı, hata logları
- Locale-aware mesaj varyantları ve dil tercihine göre tetikleme

---

### 2.8 White-label Uygulama

**Hedef salon:** Güçlü bir marka kimliğine sahip, kendi adıyla App Store / Play Store'da yer almak isteyen büyük salonlar veya zincirler.

**Ne yapar:**
- Üye uygulaması, salonun adı, logosu ve renk paleti ile ayrı bir uygulama olarak yayınlanır
- Üyeler, MyClup yerine doğrudan salonun uygulamasını indirir
- Tüm MyClup özellikleri (üyelik, chat, sınıf rezervasyon, antrenman) korunur

**Özellikler:**
- Özelleştirilebilir uygulama adı, ikon, splash ekranı, renk teması
- App Store ve Google Play listing desteği
- Push bildirimlerinde salon adıyla gönderim
- Login ekranında salon logosu
- İsteğe bağlı özel domain bağlantısı (web tarafı için)
- Çok dilli white-label içerik ve store listing yönetimi

**Platform gereksinimleri:**
- Temaya dayalı build pipeline (Expo EAS ile per-gym build)
- Asset yönetim sistemi (logo, renk, ikon uploads)
- App Store / Play Store hesap yönetimi süreci
- Admin panel: white-label başvuru ve onay süreci, build durumu takibi

**Not:** Bu paket yüksek operasyonel maliyet gerektirir (build süreci, store yönetimi). Fiyatlandırma diğer paketlerden önemli ölçüde yüksek tutulmalıdır.

---

### 2.9 Entegrasyon Paketi

**Hedef salon:** Mevcut muhasebe, reklam veya CRM araçlarıyla senkronizasyon isteyen salonlar.

**Ne yapar:**
- MyClup verisini dış sistemlerle senkronize eder
- Manuel veri girişini ortadan kaldırır, operasyonel verimliliği artırır

**Entegrasyonlar:**
- **Muhasebe:** Logo, Mikro, Luca — fatura ve ödeme verilerini otomatik aktarım
- **Google Ads:** Üye dönüşümlerini Google Ads conversion olarak raporlama
- **Instagram / Meta Leads:** Lead form doldurmalarını otomatik MyClup lead pipeline'ına aktarma
- **Zapier / Make (ileride):** Özel otomasyon bağlantıları için webhook desteği

**Özellikler:**
- Entegrasyon bağlantı yöneticisi (connect / disconnect / test)
- Senkronizasyon durumu ve hata logları
- Alan eşleştirme (field mapping) editörü
- Webhook endpoint yönetimi

**Platform gereksinimleri:**
- Dış entegrasyon servisi / connector katmanı
- Webhook altyapısı
- Admin panel: entegrasyon sağlık durumu izleme, salon bazlı log görüntüleme

---

### 2.10 Öncelikli Destek

**Hedef salon:** Hızlı teknik çözüm bekleyen, kesintiye toleransı düşük profesyonel salonlar.

**Ne yapar:**
- Standart destek kanallarının ötesinde garantili yanıt süreleri ve ayrılmış destek kanalı sağlar
- Yeni özellik kullanımında proaktif onboarding desteği verilir

**Özellikler:**
- Dedicated destek hattı (chat veya telefon)
- SLA garantisi: kritik sorunlar için maksimum 2 saat, normal sorunlar için 8 saat yanıt süresi
- Teknik onboarding: kurulum, veri migrasyonu, ekip eğitimi
- Aylık check-in görüşmesi (hesap sağlığı, yeni özellik kullanımı)
- Erken erişim: yeni özellikler önce öncelikli destek müşterilerine açılır

**Platform gereksinimleri:**
- Destek önceliklendirme flag'i (ticket sistemine paket durumu yansıtılır)
- SLA timer ve uyarı sistemi
- Admin panel: öncelikli destek müşteri listesi, SLA ihlal raporu

---

## 3. Paket Bağımlılıkları ve Kombinasyonlar

| Kombinasyon | Sinerji |
|-------------|---------|
| Reklam + Üye Koruma | Başkalarına reklam verirken kendi üyelerini koruma |
| AI Chatbot + CRM & Otomasyon | Gelen soruyu botla karşıla, sonrasını workflow ile yönet |
| Gelişmiş Analitik + CRM & Otomasyon | Churn riskli üyeyi tespit et, otomatik retention kampanyası başlat |
| Toplu SMS + CRM & Otomasyon | Workflow tetikleyicilerini SMS kanalına da yay |
| White-label + AI Chatbot | Markalı uygulamada salon botunu çalıştır |

## 4. Fiyatlandırma Yaklaşımı

Fiyatlandırma ayrı bir strateji dokümanıyla belirlenecektir. Genel prensipler:

- Her paket aylık abonelik modeliyle sunulur
- White-label uygulama kurulum ücreti + aylık bakım ücreti şeklinde fiyatlandırılır
- Toplu SMS paketinde mesaj kredisi modeli uygulanır (aylık kota + aşım ücreti)
- Reklam paketinde CPM veya günlük bütçe modeli değerlendirilecektir
- Yıllık ön ödemeye indirim uygulanabilir

## 5. Admin Panel Gereksinimleri

Platform operatörlerinin yönetebileceği alanlar:

- Gym başına aktif paket listesi görüntüleme
- Paket aktifleştirme / deaktifleştirme
- Paket fatura ve ödeme durumu
- White-label build pipeline yönetimi
- Chatbot içerik moderasyonu
- Reklam kampanyası onay kuyruğu
- SMS gönderim log ve kota takibi
- Entegrasyon sağlık durumu izleme
- Öncelikli destek SLA ihlal uyarıları

## 6. Geliştirme Önceliklendirmesi

Platforma katkı ve uygulama kolaylığı açısından önerilen sıra:

1. **Dijital Sözleşme & E-imza** — Yüksek talep, teknik riski düşük
2. **AI Chatbot** — Chat altyapısı zaten var, bot katmanı eklenir
3. **CRM & Otomasyon** — Retention ve satış dönüşümünde direkt etki
4. **Gelişmiş Analitik** — Veri altyapısı olgunlaştıktan sonra
5. **Reklam + Üye Koruma** — Discovery marketplace olgunlaştıktan sonra
6. **Toplu SMS / WhatsApp** — Dış API bağımlılığı, paralelde başlanabilir
7. **Entegrasyon Paketi** — Salon segmentine göre öncelik değişir
8. **Öncelikli Destek** — Operasyonel kapasite oluşunca
9. **White-label Uygulama** — En yüksek operasyonel maliyet, büyük salon segmentine odaklanıldığında

## 7. Dokümantasyon Yapısı

Bu döküman diğer planlarla şu noktalarda kesişir:

- `04-admin-panel-plan.md` → 3.6 Campaign and Ad System, 3.2 Gym Management (paket yönetimi)
- `03-user-admin-panel-plan.md` → Paket ayarları ve aktifleştirme arayüzü
- `00-master-plan.md` → 5.6 AI Opportunities (chatbot, analitik), 3.6 Revenue and Growth (reklam, CRM)
