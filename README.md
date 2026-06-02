# Gym Tracker

Kişisel antrenman geçmişini kaydetmek, takip etmek ve analiz etmek için geliştirilmiş bir web uygulaması. Push/Pull/Leg ayrımıyla antrenman tipi tespiti, egzersiz bazında ilerleme grafikleri ve yıllık özet gibi özellikler sunar.

---

## Ne yapar?

Her gün yaptığın antrenmanı kaydedersin: hangi egzersizleri yaptığını, kaç set, kaç tekrar, ne kadar ağırlık kullandığını. Uygulama bu verileri Firebase'de saklar ve sana şunları gösterir:

- Her egzersizde en son kırdığın PR (Personal Record)
- Toplam kaldırılan tonaj (volume)
- Zaman içindeki ilerleme grafiği
- Hangi günlerde hangi tip antrenman yaptığın (Push / Pull / Leg / Full Body vb.)
- Yıllık antrenman özeti (Wrapped)

---

## Özellikler

**Antrenman Kaydı**
- Günlük antrenman oluştur, egzersiz ekle, set/tekrar/ağırlık gir
- Antrenman tipini otomatik tespit eder (Push, Pull, Leg, Upper Body, Full Body)
- Vücut ağırlığı takibi (Pull-up, Dip gibi vücut ağırlığıyla yapılan hareketlerde otomatik hesaplar)
- Geçmiş antrenmanı başka bir güne kopyalayarak import et

**Takvim & Navigasyon**
- Haftalık şerit görünümü — sağa/sola kaydırarak haftalar arası geçiş
- Aylık takvim modalı — antrenman yapılan günleri renkli noktalarla gösterir
- Son seçilen gün oturum boyunca hatırlanır

**Egzersiz Kütüphanesi**
- Varsayılan egzersiz listesi + kendi egzersizlerini ekle
- Egzersizlere kas grubu, kategori (Compound/Isolation) ve ağırlık tipi ata
- Egzersiz adını tüm geçmiş kayıtlarda aynı anda yeniden adlandır

**İlerleme & Analiz**
- Egzersiz detay sayfasında zaman serisi grafik (Recharts ile)
- PR ve toplam tonaj metrikleri
- Wrapped: yıl sonu özeti — toplam antrenman sayısı, en çok yapılan egzersizler, en yoğun aylar

**Hesap & Veri**
- Google hesabıyla giriş (Firebase Auth)
- Veriler Firebase Realtime Database'de saklanır — cihazlar arası senkronizasyon
- Admin paneli: kullanıcı verilerini yönetme
- Geri bildirim sayfası: uygulama içinden geri bildirim gönder

---

## Teknoloji Stack'i

| Katman | Teknoloji |
|---|---|
| UI | React 18, Tailwind CSS |
| Animasyon | Framer Motion |
| Grafikler | Recharts |
| Routing | React Router v6 |
| Auth & DB | Firebase (Auth + Realtime Database) |
| İkonlar | Lucide React |
| Build | Vite |

---

## Kurulum

**Gereksinimler:** Node.js 18+, bir Firebase projesi

### 1. Repoyu klonla

```bash
git clone <repo-url>
cd workout-trackerr
npm install
```

### 2. Firebase yapılandırması

[Firebase Console](https://console.firebase.google.com)'dan yeni bir proje oluştur. Realtime Database ve Authentication (Google provider) servislerini etkinleştir.

Proje kök dizininde `.env` dosyası oluştur:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Bu değerleri Firebase Console → Proje Ayarları → Genel → Web uygulaması bölümünden alabilirsin.

### 3. Çalıştır

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Build önizlemesi
npm run preview
```

---

## Proje Yapısı

```
src/
├── pages/
│   ├── MainPage.jsx          # Ana sayfa — haftalık görünüm, antrenman girişi
│   ├── ExercisesPage.jsx     # Egzersiz kütüphanesi
│   ├── ExerciseDetailPage.jsx # Egzersiz ilerleme grafiği ve PR'lar
│   ├── WorkoutDetailPage.jsx  # Belirli bir günün antrenman detayı
│   ├── GelistirmelerPage.jsx  # Geri bildirim sayfası
│   ├── ProfilePage.jsx        # Kullanıcı profili
│   ├── LoginPage.jsx          # Google ile giriş
│   └── AdminPanelPage.jsx     # Admin yönetim paneli
├── components/
│   ├── WeekStrip.jsx          # Haftalık tarih seçici
│   ├── CalendarModal.jsx      # Aylık takvim
│   ├── BodyWeightModal.jsx    # Vücut ağırlığı girişi
│   ├── ImportWorkoutModal.jsx # Geçmiş antrenman kopyalama
│   └── Wrapped2025Modal.jsx   # Yıllık özet
├── utils/
│   ├── storage-client.js      # Tüm veri okuma/yazma işlemleri
│   ├── storage-firebase.js    # Firebase Realtime DB adaptörü
│   ├── workoutTypes.js        # Push/Pull/Leg tipi tespiti
│   └── exerciseMetadata.js    # Egzersiz kas grubu bilgileri
└── contexts/
    └── AuthContext.jsx        # Firebase Auth context
```

---

## Nasıl Kullanılır?

1. **Giriş** — Google hesabınla oturum aç
2. **Antrenman Ekle** — Ana sayfada bugünün tarihini seçip egzersiz ekle
3. **Set Kaydet** — Her egzersiz için set, tekrar ve ağırlık gir
4. **İlerleme Gör** — Egzersizler sayfasından herhangi bir harekete tıkla; PR geçmişini ve grafiğini gör
5. **Geçmiş Tara** — Haftalık şeridi kaydırarak geçmiş günlere bak veya takvim ikonuna tıkla

---

Developed with ❤️
