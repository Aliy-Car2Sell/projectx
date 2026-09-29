# Images

Every photo in the apps, where it came from and under what licence. Only freely licensed
images are used; add a row here in the same commit that adds an image.

| File | What it shows | Author | Source | Licence |
| --- | --- | --- | --- | --- |
| `apps/patient/public/images/hero.webp` | Landing page hero: a doctor talking to a patient in her office | [Vitaly Gariev](https://unsplash.com/@silverkblack) | [unsplash.com/photos/iyeUwItlIPk](https://unsplash.com/photos/doctor-consults-with-patient-in-medical-office-iyeUwItlIPk) | [Unsplash License](https://unsplash.com/license) |

## How the hero was prepared

The original is 3840×2160 (16:9). It was cut to 4:3 around the doctor and the patient, scaled to
1600×1200 and saved as WebP (61 KB). `next/image` serves smaller sizes from it.

```bash
curl -o hero.jpg "https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?fm=jpg&q=90"
cwebp -crop 800 0 2880 2160 -resize 1600 1200 -q 78 -m 6 hero.jpg -o apps/patient/public/images/hero.webp
```

The Unsplash License allows commercial use without asking and does not require a credit; the
credit above is kept anyway, as a courtesy and so the source can be found again.

## Not photos

- Logo, favicon and PWA icons: drawn for ProjectX (`packages/ui/src/layout/Logo.tsx`,
  `node scripts/make-icons.mjs`).
- Empty-state illustrations: drawn for ProjectX (`packages/ui/src/illustrations/`).
- Icons: [lucide](https://lucide.dev) (ISC licence).
- Typefaces: Inter and Manrope (SIL Open Font License), self-hosted by `next/font`.
- Avatars in the demo data come from `i.pravatar.cc`; they are mock content, not part of the design.
