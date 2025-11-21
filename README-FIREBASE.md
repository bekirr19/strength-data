# 🏋️ Gym Tracker - Firebase Edition

Modern, kullanıcı dostu antrenman takip uygulaması. **Firebase Realtime Database** ve **Firebase Hosting** ile çalışır.

## ✨ Özellikler

- 📅 **Haftalık Takvim Görünümü**: Sağa-sola kaydırarak geçiş yapın
- 📆 **Aylık Takvim Modal**: Antrenman yapılan günler işaretli
- 💪 **Egzersiz Yönetimi**: Ekleme, arama, sıralama
- 📊 **İlerleme Takibi**: PR ve tonaj metrikleri
- 🌙 **Dark Mode**: Göz dostu koyu tema
- ☁️ **Cloud Sync**: Firebase Realtime Database ile gerçek zamanlı senkronizasyon
- 🔐 **Güvenli**: Firebase Authentication ile kullanıcı bazlı veri yönetimi

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Yeni proje oluşturun
3. **Realtime Database** ekleyin
4. **Authentication** ekleyin (Email/Password veya Google)
5. Proje ayarlarından **Web App** ekleyin
6. Konfig bilgilerini kopyalayın

### 3. Environment Variables

`.env` dosyası oluşturun (`.env.example` dosyasını kopyalayın):

```bash
cp .env.example .env
```

Firebase Console'dan aldığınız bilgileri `.env` dosyasına yapıştırın:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firebase Database Rules

Firebase Console > Realtime Database > Rules bölümünden aşağıdaki kuralları ekleyin:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "gym_exercises_v1": {
      ".indexOn": ["name", "canonicalName"]
    },
    "gym_workouts_v1": {
      ".indexOn": ["dateISO"]
    }
  }
}
```

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

### 6. Production Build

```bash
npm run build
```

## 🔥 Firebase Hosting'e Deploy

### İlk Kurulum

```bash
# Firebase CLI'yi global olarak yükleyin
npm install -g firebase-tools

# Firebase'e login olun
firebase login

# Projeyi başlatın
firebase init

# Hosting ve Database seçeneklerini seçin
# public directory: dist
# single-page app: yes

# Deploy edin
npm run build
firebase deploy
```

### Sonraki Deploy'lar

```bash
npm run build
firebase deploy
```

## 📱 Kullanım

1. **İlk Giriş**: Email/şifre ile kayıt olun
2. **Ana Sayfa**: Günlük antrenmanlarınızı görün
3. **Takvim**: Üst menüden takvim ikonuna tıklayın
4. **Hafta Şeridi**: Sağa-sola kaydırarak haftalar arası geçiş yapın
5. **Egzersiz Detay**: Herhangi bir egzersize tıklayarak ilerleme görebilirsiniz
6. **Cloud Sync**: Verileriniz otomatik olarak Firebase'e kaydedilir

## 🛠️ Teknolojiler

- React 18
- React Router v6
- Tailwind CSS
- Vite
- **Firebase Realtime Database**
- **Firebase Hosting**
- **Firebase Authentication**
- Recharts (Grafik kütüphanesi)

## 📂 Proje Yapısı

```
workout-trackerr/
├── src/
│   ├── components/
│   │   ├── CalendarModal.jsx
│   │   ├── ImportWorkoutModal.jsx
│   │   ├── WeekStrip.jsx
│   │   └── LoadingSpinner.jsx (YENİ)
│   ├── pages/
│   │   ├── MainPage.jsx (Firebase uyumlu)
│   │   ├── ExercisesPage.jsx
│   │   ├── ExerciseDetailPage.jsx
│   │   └── WorkoutDetailPage.jsx
│   ├── utils/
│   │   ├── exerciseMetadata.js
│   │   ├── storage.js (Firebase Realtime Database)
│   │   └── workoutTypes.js
│   ├── firebase.js (YENİ - Firebase konfigürasyonu)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── firebase.json (YENİ)
├── database.rules.json (YENİ)
├── .env.example (YENİ)
├── .gitignore (Güncellendi)
└── package.json (Firebase eklendi)
```

## 🔒 Güvenlik

- Tüm veriler Firebase Authentication ile korunur
- Database rules ile yalnızca kimliği doğrulanmış kullanıcılar erişebilir
- `.env` dosyası `.gitignore`'a eklenmiştir

## 🐛 Sorun Giderme

### Firebase bağlantı hatası
- `.env` dosyanızın doğru doldurulduğundan emin olun
- Firebase Console'dan Realtime Database'in aktif olduğunu kontrol edin

### Authentication hatası
- Firebase Console > Authentication bölümünden Email/Password veya Google provider'ı aktifleştirin

### Deploy hatası
- `npm run build` komutunun başarılı olduğundan emin olun
- Firebase CLI'nin güncel olduğundan emin olun: `npm install -g firebase-tools@latest`

## 📝 Not

Bu versiyon **Firebase Realtime Database** kullanır. Önceki LocalStorage versiyonu `src/utils/storage-localstorage-backup.js` dosyasında yedeklenmiştir.

---
Developed with ❤️ + 🔥 Firebase
