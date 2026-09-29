import { Frame, brand, mid, tint, white, type IllustrationProps } from "./Frame";

/** Waiting for approval: a document with a clock on it. */
export function PendingApproval(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="46" y="26" width="58" height="72" rx="12" fill={white} />
      <circle cx="62" cy="44" r="7" fill={mid} />
      <rect x="74" y="38" width="20" height="5" rx="2.5" fill={tint} />
      <rect x="74" y="47" width="13" height="5" rx="2.5" fill={tint} />
      <rect x="57" y="62" width="36" height="5" rx="2.5" fill={tint} />
      <rect x="57" y="73" width="24" height="5" rx="2.5" fill={tint} />
      <circle cx="104" cy="84" r="23" fill={tint} />
      <circle cx="104" cy="84" r="19" fill={brand} />
      <circle cx="104" cy="84" r="13" fill={white} />
      <rect x="102" y="74.5" width="4" height="12" rx="2" fill={brand} />
      <rect x="102" y="82" width="11" height="4" rx="2" fill={brand} />
    </Frame>
  );
}
