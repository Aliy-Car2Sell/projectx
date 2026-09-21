# Daftar-kartochka, print/PDF va yordam qatlamidan keyingi UI auditi — 2026-09-21

**Branch:** `feat/records-notebook` (4 commit). To'liq audit (`pnpm audit:ui`, 3 ilova) yakuniy holatda: **0 buzilgan havola, 0 o'lik tugma, 0 ko'ringan kalit, 0 overflow, 0 console xatosi, mehmon oqimi 47/47.** `pnpm build`, `pnpm lint`, `pnpm check-messages` (875 kalit, 25 namespace) — xatosiz.

## 1. Nima o'zgardi (bosqichlar bo'yicha)

| # | Commit | Mazmuni |
|---|---|---|
| 1 | `feat(records): notebook-style medical record` | Tablar va karta-grid o'rniga bitta uzluksiz "varaq": muqova (bemor, allergiyalar, doimiy dorilar) → oylar bo'yicha guruhlangan, yangi tepada yozuvlar; yozuv joyida ochiladi. Tahlil qiymatlari jadval qatorlari, rasmda thumbnail, doktor xulosasi ko'k chegara + och ko'k fon. Yopishqoq filtr chiplari, "Qo'shish" (bottom-sheet / modal, sessiyada saqlanadi), "Faqat men ko'raman" (`private`). Doktor ilovasi o'sha `RecordsView`ni `role="doctor"` bilan ishlatadi: private yozuvlar yo'q, "Qo'shish" o'rniga "Xulosa yozish" (yozilgan xulosa daftarga darhol tushadi). |
| 2 | `feat(records): print and PDF export` | "Chop etish / PDF" dialogi (davr, bo'limlar, To'liq / Doktor uchun) → shell'siz print route → `window.print()`; PDF — brauzerning "PDF sifatida saqlash"i, kutubxona yo'q. A4, 15mm, har sahifada ism + sana, sahifa raqami, yozuvlar bo'linmaydi. Bitta yozuvni chop etish. Doktor ilovasida ham. Sahifalar `(shell)` route group'iga ko'chdi, print — `(print)` guruhida; URL'lar o'zgarmadi. |
| 3 | `feat: help chat, tooltips and first-run guide` | Uchala ilovada "?" tugmasi va yordam chati (rolga mos tez savollar, qadamli javob + sahifaga havola; javob manbasi — almashtiriladigan `HelpSource` funksiyasi). `Tooltip` komponenti 4 joyda. Bemor dashboard'ida 3 qadamli birinchi-kirish yo'l-yo'rig'i (localStorage), profilda "qayta ko'rish". Bo'sh holatlar "nima qilish kerak" + tugma. |
| 4 | `chore: hide dev toggles, text and contrast fixes` | "Holatlar" toggle qatori va "Demo rejim" badge UI'dan olindi (`?state=` ishlaydi; badge faqat `NEXT_PUBLIC_DEMO=true` + login sahifasi). Mobilda asosiy matn 16px. `--color-muted` AA'ga yetkazildi. "Tajriba: 12 yil", "Malaka: oliy toifa" (uz/ru/en). |

## 2. Maxfiylik tekshiruvi (`private` yozuvlar)

HTML javobida private yozuv ("Qon bosimi kundaligi") necha marta uchrashi:

| So'rov | Natija |
|---|---|
| Bemor: `/patient/records/print` (To'liq) | chiqadi |
| Bemor: `/patient/records/print?mode=doctor` | **chiqmaydi** |
| Doktor: `/doctor/patients/u-patient-1` | **chiqmaydi** |
| Doktor: `/doctor/patients/u-patient-1/print` | **chiqmaydi** |
| Doktor: `…/print?mode=full` (URL qo'lda o'zgartirilgan) | **chiqmaydi** — doktor ilovasi mock'dan faqat `getSharedPatientRecords` oladi va rejimni majburan `doctor` qiladi |
| Mehmon: `/patient/records/print` | 307 → `/login?returnTo=…` |

## 3. Print/PDF tekshiruvi

Chrome'ning print dvigateli orqali haqiqiy PDF generatsiya qilindi (`page.pdf`, `preferCSSPageSize`): to'liq kartochka — 3 sahifa A4; har sahifa tepasida "Karimova Dilnoza · 21-sentabr, 2026" (kontentni yopmaydi — takrorlanuvchi `<thead>` joy ajratadi), pastda "1 / 3"; birorta yozuv sahifalar orasida bo'linmagan; oy sarlavhasi o'z yozuvidan ajralmagan; rasm thumbnail'i fayl nomi bilan. uz / ru / en — sana va oy nomlari tarjimadan. Brauzer taklif qiladigan fayl nomi: "Tibbiy kartochka — Karimova Dilnoza".

Cheklov: sahifa raqami CSS `@page` margin box orqali — Chrome / Edge 131+; Safari va Firefox'da raqam chiqmaydi, qolgani ishlaydi (kelishilgan).

## 4. Kontrast va matn o'lchami

| Rang | Oq karta | Surface `#f4f6f8` | Primary-soft `#e8f4fd` |
|---|---|---|---|
| Avval `#6b7280` | 4.83 | **4.46 ✗** | **4.33 ✗** |
| Hozir `#5b6472` | 5.98 | 5.52 | 5.35 |

Mobilda `body` 15px → 16px; chat xabarlari, sharh matni, "doktor haqida", input/select/textarea ham 16px (iOS'da input zoom'i ham yo'qoladi). Desktop o'lchamlari o'zgarmadi.

**Havola / sarlavha rangi (`fix/link-contrast` branch'ida tuzatildi):** `--color-primary` `#1a9be6` matn sifatida oq fonda 3.05:1 edi. Matn uchun alohida token `--color-primary-text` qo'shildi; fon, chegara, tugma, badge va logotip brend rangida qoldi.

| Rang | Oq karta | Surface `#f4f6f8` | Primary-soft `#e8f4fd` |
|---|---|---|---|
| `#1a9be6` (brend, avval matn ham) | **3.05 ✗** | **2.82 ✗** | **2.73 ✗** |
| `#0f7ac0` (birinchi nomzod) | 4.60 | **4.25 ✗** | **4.12 ✗** |
| `#0d72b3` (`--color-primary-text`) | 5.15 | 4.76 | 4.61 |

O'tgan joylar: havolalar, sahifa sarlavhalari, mobil bottom nav'ning aktiv yorlig'i, hover holatlari (106 ta almashtirish, 51 fayl). Sidebar'ning aktiv bandi oq matn + brend ko'k fon (3.05:1) edi — endi `primary-soft` fon + `primary-text` matn. Shu o'zgarishdan keyin to'liq audit qayta yurgizildi: **AUDIT CLEAN** (87 URL, 522 yuklash, 863 klik, 0 NO-OP, 0 overflow, mehmon 47/47).

**Qolgan (ataylab):** `Button` secondary varianti matni (`#1a9be6` oq fonda, 3.05:1) va `Badge` primary toni (`#1a9be6` / `#e8f4fd`, 2.73:1) brend rangida qoldirildi — "tugma va badge'lar eski rangda" degan qarorga ko'ra.

## 5. Audit jarayonida topilgan va tuzatilganlar

Birinchi yurgizish: 14 sahifada muammo, 2 NO-OP.

| Topilma | Turi | Yechim |
|---|---|---|
| Doktor profili, 375px, ru/en: gorizontal scroll +45px / +16px | **haqiqiy regressiya** (4-bosqich: "Квалификация: высшая категория" badge'i sig'madi) | badge qatorga bo'linadi; uch tilda 0px |
| 375px: "Batafsil" tugmasi yangi qatorga tushdi | haqiqiy (3-bosqich: tooltip tugmalar qatorida) | tooltip qabul vaqti yoniga ko'chirildi |
| Xulosa yozuvining pastki ajratgichi ko'k | haqiqiy (`border-primary` hamma tomonga) | `border-l-primary` |
| Daftarda tur yorlig'i "kesilib qoldi" | evristika: mobilda `sr-only` edi | `hidden` + `aria-label`/`title` |
| `chat?state=loading` "bo'sh sahifa" | evristika: skeleton'da matn yo'q; ilgari toggle qatori matni yashirib turgan | audit `?state=loading`ni bo'sh deb sanamaydi |
| Print sahifasida "Chop etish" NO-OP | auditda `window.print` stub | stub chaqiruvni qayd etadi → "opens print dialog" |

Skript: print route'lar va (toggle olingani uchun) barcha `?state=` URL'lar seed'ga qo'shildi.

## 6. Yakuniy natija

| Ko'rsatkich | 2026-09-21 (mehmon kirishi) | Hozir |
|---|---|---|
| Tekshirilgan URL variantlari | 83 | **87** |
| Sahifa yuklashlar (URL × til × viewport) | 498 | **522** |
| Bosilgan tugmalar | 662 | **863** (451 content o'zgardi, 352 dialog, 20 fayl tanlash, 16 validatsiya, 16 navigatsiya, 8 print) |
| NO-OP tugma / probe xatosi / tab almashtirish | 0 / 0 / 0 | **0 / 0 / 0** |
| Noyob havolalar | 134 + 11 ilovalar aro | **112** + 11 ilovalar aro (toggle havolalari ketdi), buzilgani **0** |
| Tablar | 35 | **5** (kartochka tablari chiplarga aylandi) — hammasi ishlaydi |
| Tarjima kaliti / console / 375px overflow | 0 / 0 / 0 | **0 / 0 / 0** |
| Demo kirish, til almashtirgich (17), mehmon oqimi (47) | OK | **OK** |
| messages | 742 kalit, 22 namespace | **875 kalit, 25 namespace** (`help`, `hints`, `qualification`), sinxron |

## 7. Ataylab qoldirilganlar va cheklovlar

- Sessiyada qo'shilgan yozuv/xulosa faqat brauzerda yashaydi: sahifa yangilansa yo'qoladi va print route'da ko'rinmaydi (shuning uchun ularda "Chop etish" ikonkasi yo'q) — backend bilan hal bo'ladi.
- Print sahifasida ekranda ingichka panel qoldi ("Kartochkaga qaytish", "Chop etish") — chop etilmaydi; PWA/standalone rejimda ortga yo'l bo'lishi uchun.
- "Boshqa" turidagi yozuvlarning o'z chipi yo'q: "Hammasi"da ko'rinadi, print'da "Kasalliklar" bo'limi bilan chiqadi.
- Birinchi-kirish yo'l-yo'rig'ining tugmalari audit prober'ida bosilmaydi (dialog ichidagi tugmalar o'tkazib yuboriladi) — qo'lda va skrinshotda tekshirildi.
- Yordam chatidagi operator telefoni va ish vaqti — mock matn (`help.*.topics.operator`), haqiqiysi bilan almashtirilishi kerak.
- Mock ma'lumotlar (yozuv sarlavhalari, tahlil nomlari) faqat o'zbekcha — avvalgi auditlardagi kabi backend bilan.
- Skrinshotlar: `scripts/audit-output/review/{1-notebook,2-print,3-help,4-cleanup}/` (gitignore'da), 375px va 1280px; PDF namunalari `2-print/*.pdf`.
