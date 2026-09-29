import { Frame, brand, tint, white, type IllustrationProps } from "./Frame";

/** No connection: a cloud, struck through. */
export function Offline(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="64" cy="68" r="17" fill={white} />
      <circle cx="85" cy="56" r="23" fill={white} />
      <circle cx="105" cy="70" r="15" fill={white} />
      <rect x="58" y="66" width="54" height="19" rx="9.5" fill={white} />
      <rect x="74" y="20" width="16" height="88" rx="8" fill={tint} transform="rotate(-42 82 64)" />
      <rect x="78" y="24" width="8" height="80" rx="4" fill={brand} transform="rotate(-42 82 64)" />
    </Frame>
  );
}
