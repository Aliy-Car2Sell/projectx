import { Frame, brand, mid, white, type IllustrationProps } from "./Frame";

/** Looking for a doctor: a magnifier with the medical cross in the lens. */
export function FindDoctor(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="93" y="66" width="13" height="38" rx="6.5" fill={mid} transform="rotate(-45 99.5 85)" />
      <circle cx="72" cy="56" r="29" fill={brand} />
      <circle cx="72" cy="56" r="20" fill={white} />
      <rect x="68" y="44" width="8" height="24" rx="3" fill={brand} />
      <rect x="60" y="52" width="24" height="8" rx="3" fill={brand} />
    </Frame>
  );
}
