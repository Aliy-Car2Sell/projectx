# ProjectX — Bemor–Doktor Platformasi (v0.3)

> Bu hujjat loyihaning tasdiqlangan spetsifikatsiyasi. Claude Code shu hujjat asosida MVP ni yozadi.
> Ishchi nom: **ProjectX** (yakuniy nom keyinroq tanlanadi).

---

## 1. Loyihaning maqsadi

O'zbekiston bo'ylab bemorlar va doktorlarni bitta onlayn tizimda bog'lash:

- Bemor o'ziga yaqin va mos doktorni topadi, u haqida to'liq ma'lumot ko'radi va qabulga yoziladi.
- Doktor o'z bemorlari bilan bog'lanadi, qabul jadvalini boshqaradi va bemorning tibbiy ma'lumotlarini ko'radi.
- Bemor o'z sog'lig'i haqidagi ma'lumotlarni (tahlillar, rentgen va h.k.) platformada saqlab boradi.

Bu bitta klinika portali emas — ko'p shifoxona va ko'p doktorni qamrab oladigan ochiq tizim.

---

## 2. Tasdiqlangan qarorlar (qisqacha)

| # | Mavzu | Qaror |
|---|---|---|
| 1 | Hudud | Faqat O'zbekiston. Kengayish — keyin |
| 2 | Monetizatsiya | Hozircha muhokama qilinmaydi (yo'nalish: shifoxonalar tomonidan) |
| 3 | Tillar | O'zbek, Rus, Ingliz — sayt tilini istalgan vaqtda almashtirish mumkin |
| 4 | Chat | **MVP da bo'ladi**: matn + fayl + rasm yuborish |
| 5 | Bildirishnomalar (SMS/Telegram/push) | Keyinga qoldirildi — mobil app chiqqanda hal bo'ladi |
| 6 | Ro'yxatdan o'tish | Email + parol (keyinroq SMS ga o'tkaziladi) |
| 7 | Doktor verifikatsiyasi | Doktor asosiy ma'lumot/hujjatlarni yuklaydi, admin qo'lda tasdiqlaydi |
| 8 | Qabulni tasdiqlash | Avtomatik (keyinroq: doktor tasdiqlash rejimi qo'shiladi) |
| 9 | Bekor qilish/ko'chirish | Qabulga kamida **2 soat** qolganda ruxsat etiladi |
| 10 | Reyting | 5 yulduzlik; faqat haqiqatan qabulda bo'lgan bemor sharh qoldira oladi |
| 11 | Qabul narxi | Ixtiyoriy maydon; doktor telefon raqami ko'rsatiladi, bemor qo'ng'iroq qilib kelishishi ham mumkin |
| 12 | Kartochka ruxsati | Aktiv qabul mavjud bo'lganda doktor bemor kartochkasini avtomatik ko'radi |
| 13 | Kartochkaga yozish | Bemor ham, doktor ham yoza oladi (doktor qabuldan keyin xulosa qoldiradi) |
| 14 | Xarita | Hozircha bepul yechim (OpenStreetMap + Leaflet), keyinroq Yandex Maps |
| 15 | Hosting | MVP: shaxsiy kompyuter server sifatida + Cloudflare Tunnel orqali internetga ulash |
| 16 | Platforma | Mobile-first responsive web-sayt; native mobil app — keyingi bosqich |

---

## 3. Foydalanuvchi rollari

| Rol | Tavsif |
|---|---|
| **Bemor** | Doktor qidiradi, qabulga yoziladi, kartochka yuritadi, chatlashadi, sharh qoldiradi |
| **Doktor** | Profil yuritadi, jadval tuzadi, qabullarni ko'radi, bemor kartochkasi bilan ishlaydi, chatlashadi |
| **Admin** | Doktorlarni tasdiqlaydi, sharh/shikoyatlarni moderatsiya qiladi, statistika ko'radi |
| **Shifoxona/Klinika** | Keyingi bosqichda alohida rol sifatida qo'shiladi |

---

## 4. MVP funksiyalari (batafsil)

### 4.1. Umumiy
- Uch tilda interfeys: uz / ru / en, headerda til almashtirgich, tanlov saqlanadi
- Ro'yxatdan o'tish va kirish: email + parol; rol tanlash (bemor / doktor)
- Mobile-first dizayn, desktopda ham to'liq qulay

### 4.2. Bemor tomoni
**Doktor qidirish**
- Ro'yxat + xarita ko'rinishi (OpenStreetMap): yaqin-atrofdagi doktorlar/klinikalar
- Filtrlar: mutaxassislik, staj, toifa, reyting, masofa/shahar
- Doktor profili: foto, mutaxassislik, staj, malaka toifasi, ish joyi (manzil, xaritada), telefon raqami, qabul narxi (agar ko'rsatilgan bo'lsa), reyting va sharhlar

**Qabulga yozilish**
- Doktorning bo'sh slotlarini kalendar ko'rinishida ko'rish, vaqt tanlash
- Qabul avtomatik tasdiqlanadi
- Bekor qilish/ko'chirish: qabulga kamida 2 soat qolganda
- "Mening qabullarim" sahifasi: kelgusi va o'tgan qabullar

**Tibbiy kartochka**
- Tahlil natijalari, rentgen/MRT va boshqa fayllar (rasm, PDF) yuklash
- Kasallik tarixi, allergiyalar, doimiy dorilar bo'limlari
- Doktor qabuldan keyin qoldirgan xulosalarini ko'rish
- Ruxsat: aktiv qabuli bor doktor kartochkani avtomatik ko'radi

**Chat**
- Doktor bilan yozishmalar: matn, fayl va rasm yuborish
- Chatlar ro'yxati, o'qilmagan xabarlar belgisi

**Reyting va sharh**
- Qabul o'tgandan keyin 5 yulduzlik baho + matnli sharh qoldirish
- Faqat haqiqatan qabulda bo'lgan bemor sharh qoldira oladi

### 4.3. Doktor tomoni
- Profil to'ldirish: mutaxassislik, staj, toifa, ish joyi (xaritada belgilash), telefon, qabul narxi (ixtiyoriy), hujjatlar (diplom/sertifikat) yuklash
- Yangi doktor holati: "Tasdiqlanishi kutilmoqda" → admin tasdig'idan keyin qidiruvda ko'rinadi
- Jadval sozlash: qabul kunlari, ish soatlari, bitta qabul davomiyligi → tizim slotlarni avtomatik yaratadi
- Qabullar: bugungi/kelgusi bemorlar ro'yxati va kalendar ko'rinishi
- Bemor kartochkasi: aktiv qabul bo'lganda ko'rish + qabuldan keyin xulosa/yozuv qo'shish
- Chat: bemorlar bilan yozishmalar (matn, fayl, rasm)
- O'z reytingi va sharhlarini ko'rish

### 4.4. Admin tomoni
- Doktor arizalarini ko'rish, hujjatlarini tekshirish, tasdiqlash/rad etish
- Sharh va shikoyatlar moderatsiyasi
- Oddiy statistika: userlar, doktorlar, qabullar soni

---

## 5. MVP dan keyingi bosqichlar (roadmap)

1. **2-bosqich:** SMS orqali ro'yxatdan o'tish, doktor qabulni qo'lda tasdiqlash rejimi, bildirishnomalar
2. Native mobil ilova (iOS/Android) + push bildirishnomalar
3. Shifoxona/klinika roli: klinika o'z doktorlarini boshqaradi
4. Yandex Maps ga o'tish
5. Onlayn to'lov
6. Video-konsultatsiya (telemeditsina)
7. Laboratoriyalar bilan integratsiya (tahlil natijalari avtomatik kelishi)
8. Professional hosting (O'zbekistondagi server — shaxsiy ma'lumotlar qonunchiligi talabi)

---

## 6. Texnik stack

| Qatlam | Texnologiya | Izoh |
|---|---|---|
| Framework | **Next.js** (React, TypeScript) | Frontend + backend (API routes) bitta loyihada, mobile-first |
| UI | **Tailwind CSS** | Tez va moslashuvchan dizayn |
| Ma'lumotlar bazasi | **PostgreSQL** | Asosiy baza |
| ORM | **Prisma** | Baza bilan qulay ishlash, migratsiyalar |
| Autentifikatsiya | Auth.js (NextAuth) | Email + parol; keyinroq SMS qo'shish oson |
| Ko'p tillilik | next-intl | uz / ru / en |
| Xarita | Leaflet + OpenStreetMap | Bepul; keyinroq Yandex Maps ga almashtiriladi |
| Fayllar | Lokal disk (uploads papka) | MVP uchun yetarli; keyinroq cloud storage |
| Chat | WebSocket yoki polling | MVP da soddaroq yechimdan boshlaymiz |
| Internetga ulash | **Cloudflare Tunnel** | Shaxsiy kompyuterni domen bilan bog'lash |

---

## 7. Kerakli dasturlar ro'yxati (kompyuterga o'rnatish)

Boshqa kompyuterga ko'chirganda ham xuddi shu ro'yxat kerak bo'ladi:

1. **Node.js (LTS versiya, 20+)** — nodejs.org — Next.js ishlashi uchun asos (npm bilan birga keladi)
2. **Git** — git-scm.com — versiya nazorati
3. **VS Code** — allaqachon bor
4. **Claude Code** — allaqachon o'rnatilgan
5. **PostgreSQL (16+)** — postgresql.org — ma'lumotlar bazasi (o'rnatishda parolni yozib qo'ying!)
6. **cloudflared** — Cloudflare Tunnel dasturi — saytni internetga chiqarish uchun (deploy bosqichida kerak bo'ladi)

*Ixtiyoriy, lekin foydali:*
- **pgAdmin** yoki **DBeaver** — bazani vizual ko'rish uchun
- **Docker Desktop** — hozircha shart emas, keyinroq deploy'ni osonlashtirishi mumkin

Tekshirish (terminalda): `node -v`, `npm -v`, `git --version`, `psql --version`

---

## 8. Claude Code uchun boshlang'ich yo'nalish

1. Loyihani `C:/Projects/ProjectX` ichida Next.js (TypeScript, Tailwind, App Router) bilan boshlash
2. Prisma + PostgreSQL ulash; asosiy modellar: User (rol: patient/doctor/admin), DoctorProfile, Schedule/Slot, Appointment, MedicalRecord (fayllar bilan), ChatMessage, Review
3. Uch tillilik (next-intl) boshidan qo'shilsin — keyin qo'shish qiyinroq
4. Ish tartibi: avval autentifikatsiya va rollar → doktor profili va jadval → qidiruv (ro'yxat + xarita) → qabulga yozilish → kartochka → chat → reyting → admin panel
5. Har bir bosqichdan keyin lokalda tekshirib boramiz, deploy (Cloudflare Tunnel) eng oxirida
