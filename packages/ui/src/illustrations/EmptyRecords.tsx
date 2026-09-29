import { Frame, brand, mid, tint, white, type IllustrationProps } from "./Frame";

/** Empty medical card: a clipboard with the medical cross and nothing written yet. */
export function EmptyRecords(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="58" y="26" width="58" height="72" rx="12" fill={mid} transform="rotate(8 87 62)" />
      <rect x="48" y="30" width="60" height="72" rx="12" fill={white} />
      <rect x="65" y="24" width="26" height="13" rx="6.5" fill={brand} />
      <rect x="73" y="47" width="10" height="26" rx="3.5" fill={brand} />
      <rect x="65" y="55" width="26" height="10" rx="3.5" fill={brand} />
      <rect x="60" y="81" width="36" height="5" rx="2.5" fill={tint} />
      <rect x="60" y="91" width="22" height="5" rx="2.5" fill={tint} />
    </Frame>
  );
}
