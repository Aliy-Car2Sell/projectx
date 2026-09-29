import { Frame, brand, mid, white, type IllustrationProps } from "./Frame";

/** Nothing matches the search: a magnifier with a cross in the lens. */
export function SearchNotFound(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="93" y="66" width="13" height="38" rx="6.5" fill={mid} transform="rotate(-45 99.5 85)" />
      <circle cx="72" cy="56" r="29" fill={brand} />
      <circle cx="72" cy="56" r="20" fill={white} />
      <rect x="60" y="53" width="24" height="6" rx="3" fill={mid} transform="rotate(45 72 56)" />
      <rect x="60" y="53" width="24" height="6" rx="3" fill={mid} transform="rotate(-45 72 56)" />
    </Frame>
  );
}
