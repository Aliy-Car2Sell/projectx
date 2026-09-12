# ProjectX — Sog'liqni saqlash ekotizimi (v0.4)

> Tasdiqlangan spetsifikatsiya. v0.3 dan asosiy farq: bitta sayt emas — bitta backend + har bir toifa uchun alohida ilova. Claude Code shu hujjat asosida ishlaydi.
> Ishchi nom: **ProjectX** (yakuniy nom keyinroq).

---

## 1. Maqsad

O'zbekiston bo'ylab sog'liqni saqlash ekotizimi. Birinchi bosqich — bemor va doktorni oson uchrashtirish va bemorning tibbiy ma'lumotlarini (tahlillar, rentgen va h.k.) bir joyda saqlash. Keyingi bosqichlar — dorixonalar (qaysi dori qayerda real vaqtda bor), laboratoriyalar (tahlil natijasi to'g'ridan-to'g'ri bemor hisobiga tushadi), klinikalar.

Bu ochiq tizim: ko'p klinika, ko'p doktor, keyin ko'p dorixona va laboratoriya — hammasi bitta ma'lumotlar bazasida, lekin har biri o'z ilovasida.

---

## 2. Asosiy arxitektura qarori — "Yandex modeli"

Foydalanuvchi kirishda "siz kimsiz?" degan savolni ko'rmaydi. Har bir toifa o'z manzilida, o'z ilovasida ishlaydi; hammasi bitta backend va bitta bazaga ulangan.

| Ilova | Kim uchun | Manzil (reja) | Dizayn yo'nalishi |
|---|---|---|---|
| **patient** | Bemorlar | `app.<domen>` | Mobile-first, PWA (telefonga app kabi o'rnatiladi); keyin native app |
| **doctor** | Doktorlar | `doctor.<domen>` | Desktop-first, lekin telefonda to'liq ishlaydi (qabullar orasida chat, bugungi ro'yxat) |
| **admin** | Platforma adminlari | `admin.<domen>` | Faqat desktop |
| **api** | Hamma ilovalar | `api.<domen>` | Mustaqil backend xizmati |
| *pharmacy* | Dorixonalar | `pharmacy.<domen>` | Keyingi bosqich |
| *lab* | Laboratoriyalar | `lab.<domen>` | Keyingi bosqich |
| *clinic* | Klinika ma'muriyati | `clinic.<domen>` | Keyingi bosqich |

**Kod bazasi — bitta monorepo** (alohida repolar emas): umumiy UI komponentlar, tarjimalar, tiplar bir joyda; har bir ilova alohida build va alohida domen.

```
projectx/
  apps/
    patient/     Next.js, mobile-first, PWA
    doctor/      Next.js, desktop-first responsive
    admin/       Next.js, desktop
    api/         NestJS + Prisma (mustaqil backend)
  packages/
    ui/          Button, Card, Toast, Modal, StarRating... (Tailwind preset bilan)
    i18n/        uz/ru/en tarjimalar (umumiy + har ilova uchun namespace)
    types/       API kontrakt tiplari (DTO), frontend va backend birga ishlatadi
    mock/        Mock data (backend ulanguncha; keyin o'chiriladi)
    config/      eslint, tsconfig, tailwind preset
  docs/
```

Vositalar: **pnpm workspaces + Turborepo**. Bitta buyruq (`pnpm dev`) hamma ilovani ko'taradi, har biri o'z portida.

---

## 3. Tasdiqlangan qarorlar

| # | Mavzu | Qaror |
|---|---|---|
| 1 | Hudud | Faqat O'zbekiston |
| 2 | Monetizatsiya | Keyinroq (yo'nalish: klinikalar/dorixonalar tomonidan) |
| 3 | Tillar | uz / ru / en, istalgan vaqtda almashtiriladi, tanlov saqlanadi |
| 4 | Chat | MVP da: matn + fayl + rasm |
| 5 | Bildirishnomalar | Keyinroq (PWA push — 2-bosqich) |
| 6 | Ro'yxatdan o'tish | Email + parol (keyin SMS) |
| 7 | Hisob va rollar | **Bitta hisob, bir nechta rol**: doktor o'zi bemor sifatida ham kira oladi. Har ilova faqat o'z roliga ruxsat beradi |
| 8 | Doktor verifikatsiyasi | Hujjat yuklaydi, admin qo'lda tasdiqlaydi |
| 9 | Qabulni tasdiqlash | Avtomatik (keyin doktor tasdiqlash rejimi) |
| 10 | Bekor qilish/ko'chirish | Kamida 2 soat qolganda |
| 11 | Reyting | 5 yulduz, faqat qabulda bo'lgan bemor |
| 12 | Narx | Ixtiyoriy; doktor telefoni ko'rsatiladi |
| 13 | Kartochka ruxsati | Aktiv qabul bor doktor avtomatik ko'radi |
| 14 | Kartochkaga yozish | Bemor ham, doktor ham (doktor — xulosa) |
| 15 | Xarita | Leaflet + OpenStreetMap, keyin Yandex Maps |
| 16 | Hosting | MVP: shaxsiy PC + Cloudflare Tunnel (har ilova o'z hostname bilan) |
| 17 | Tashkilotlar | Bazada boshidan `Organization` (turi: clinic / pharmacy / lab). MVP faqat clinic ishlatadi |
| 18 | Backend | Frontendlardan mustaqil API; hamma ilova (kelajakdagi native app ham) faqat shu API orqali ishlaydi |

---

## 4. Foydalanuvchi rollari

| Rol | Ilova | Tavsif |
|---|---|---|
| **patient** | patient | Doktor qidiradi, yoziladi, kartochka yuritadi, chatlashadi, sharh qoldiradi |
| **doctor** | doctor | Profil, jadval, qabullar, bemor kartochkasi, chat, reyting |
| **admin** | admin | Doktorlarni tasdiqlaydi, moderatsiya, statistika |
| *clinic_admin, pharmacist, lab_staff* | keyingi ilovalar | Keyingi bosqich |

Bitta `User` bir nechta rolga ega bo'lishi mumkin. Rol tashkilotga bog'lanishi mumkin (doktor → klinika).

---

## 5. MVP funksiyalari

Ekranlar v0.3 dagi bilan bir xil (29 ekran allaqachon mock-up sifatida tayyor) — faqat uchta ilovaga bo'linadi:

**patient (mobile-first, PWA):** landing/login/register, dashboard, doktor qidiruv (ro'yxat + xarita, filtrlar), doktor profili, qabulga yozilish (slotlar), qabullarim, tibbiy kartochka (tahlillar, rasmlar, tarix, allergiya, dorilar, xulosalar), chat, sharh, profil.

**doctor (desktop-first, telefonda ishlaydi):** login, onboarding (profil + hujjatlar → tasdiq kutish), dashboard, qabullar (ro'yxat/kalendar), jadval sozlash (slotlar avtomatik), bemorlar va kartochka (+ xulosa), chat, reyting/sharhlar, profil.

**admin (desktop):** login, dashboard/statistika, doktor arizalari (tasdiqlash/rad), doktorlar, sharh/shikoyat moderatsiyasi, foydalanuvchilar, profil.

PWA talablari (patient): manifest, ikonkalar, "Bosh ekranga qo'shish", offline holatda oddiy "Internet yo'q" sahifasi.

---

## 6. Ma'lumotlar modeli (asosiy)

- `User` — email, parol hash, ism, telefon, til; `roles[]`
- `Organization` — nom, turi (clinic | pharmacy | lab), manzil, koordinata, telefon; tasdiq holati
- `DoctorProfile` — user, organization (ixtiyoriy), mutaxassislik, staj, toifa, narx, hujjatlar, verifikatsiya holati
- `Schedule` / `Slot` — doktor ish jadvali → avtomatik slotlar
- `Appointment` — bemor, doktor, slot, holat (booked | completed | no_show | cancelled), xulosa
- `MedicalRecord` / `RecordFile` — bemor kartochkasi bo'limlari va fayllar; kim yuklagan (bemor / doktor / keyin lab)
- `Conversation` / `Message` — chat (matn, fayl, rasm), o'qilgan belgisi
- `Review` — qabulga bog'langan 5 yulduz + matn
- `Notification` — keyingi bosqich uchun tayyor jadval

Kelajak uchun sxemada joy: `PharmacyInventory` (organization + dori + miqdor + yangilangan vaqt), `LabResult` (organization + bemor + fayl/qiymatlar) — MVP da yaratilmaydi, lekin modelga zid bo'lmasin.

---

## 7. Roadmap

1. **MVP** — uchta ilova + API, mock data o'rniga haqiqiy baza
2. SMS ro'yxatdan o'tish, doktor tasdiqlash rejimi, PWA push bildirishnomalar
3. **clinic** ilovasi — klinika o'z doktorlari va jadvalini boshqaradi
4. **lab** ilovasi — natijalar to'g'ridan-to'g'ri bemor kartochkasiga
5. **pharmacy** ilovasi — dorixona xaritada, real vaqt dori mavjudligi
6. Native mobil app (Expo/React Native) — shu API ga ulanadi
7. Yandex Maps, onlayn to'lov, video-konsultatsiya
8. O'zbekistondagi server (shaxsiy ma'lumotlar qonunchiligi)

---

## 8. Texnik stack

| Qatlam | Texnologiya |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend (3 ilova) | Next.js (TS, App Router) + Tailwind v4, next-intl, lucide-react, Leaflet |
| PWA (patient) | next-pwa yoki Next.js manifest + service worker |
| Backend | NestJS (TypeScript) + Prisma + PostgreSQL, JWT (access + refresh), rolga asoslangan guard |
| Umumiy tiplar | `packages/types` — API kontrakt (DTO), zod sxemalar |
| Fayllar | MVP: lokal disk (`uploads/`), API orqali beriladi; keyin S3-mos storage |
| Chat | MVP: polling (5–10 s); keyin WebSocket |
| Internetga chiqish | Cloudflare Tunnel — bitta tunnel, bir nechta hostname (app / doctor / admin / api) |

---

## 9. Ish tartibi (Claude Code uchun)

1. **Monorepo ga ko'chirish** — hozirgi bitta Next.js ilovani `apps/patient`, `apps/doctor`, `apps/admin` ga bo'lish; umumiy narsalarni `packages/` ga chiqarish. UI o'zgarmaydi, audit uchala ilovada o'tishi kerak.
2. Frontendni sayqallash (davom etadi — har ilova o'z yo'nalishida: patient PWA, doctor desktop-first, admin desktop).
3. `apps/api` — NestJS + Prisma sxema (6-bo'lim), auth, keyin modullar: doctors → schedule/slots → appointments → records → chat → reviews → admin.
4. Ilovalarni mock dan API ga o'tkazish (modul-modul), `packages/mock` ni o'chirish.
5. Cloudflare Tunnel — named tunnel, 4 hostname.
