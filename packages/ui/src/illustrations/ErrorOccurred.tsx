import { Frame, brand, mid, tint, white, type IllustrationProps } from "./Frame";

/** Something went wrong: a page with a warning badge on it. */
export function ErrorOccurred(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="42" y="30" width="70" height="58" rx="12" fill={white} />
      <path d="M42 42c0-6.6 5.4-12 12-12h46c6.6 0 12 5.4 12 12v4H42z" fill={mid} />
      <circle cx="53" cy="38" r="2.5" fill={white} />
      <circle cx="61" cy="38" r="2.5" fill={white} />
      <rect x="53" y="56" width="34" height="5" rx="2.5" fill={tint} />
      <rect x="53" y="67" width="22" height="5" rx="2.5" fill={tint} />
      <circle cx="108" cy="82" r="21" fill={tint} />
      <circle cx="108" cy="82" r="17" fill={brand} />
      <rect x="105" y="71" width="6" height="14" rx="3" fill={white} />
      <circle cx="108" cy="90.5" r="3.2" fill={white} />
    </Frame>
  );
}
