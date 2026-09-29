import { Frame, brand, mid, white, type IllustrationProps } from "./Frame";

/** Done: a check in a circle. */
export function Success(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="80" cy="61" r="31" fill={brand} />
      <path d="M66.5 61.5l9.5 9.5 18-19" stroke={white} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="78" r="3.5" fill={mid} />
      <circle cx="124" cy="40" r="4" fill={mid} />
      <rect x="116" y="92" width="10" height="4" rx="2" fill={mid} transform="rotate(-30 121 94)" />
      <rect x="36" y="30" width="10" height="4" rx="2" fill={mid} transform="rotate(35 41 32)" />
    </Frame>
  );
}
