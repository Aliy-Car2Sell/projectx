import { Frame, brand, mid, tint, white, type IllustrationProps } from "./Frame";

/** No messages yet: two speech bubbles. */
export function EmptyChat(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M50 26h42c7.7 0 14 6.3 14 14v16c0 7.7-6.3 14-14 14H64L50.5 80.5c-1.3 1-3.2.1-3.2-1.6V69.3C40.8 67.3 36 61.2 36 54V40c0-7.7 6.3-14 14-14z" fill={brand} />
      <circle cx="56" cy="48" r="4" fill={white} />
      <circle cx="71" cy="48" r="4" fill={white} />
      <circle cx="86" cy="48" r="4" fill={white} />
      <path d="M84 62h30c6.6 0 12 5.4 12 12v10c0 5.7-4 10.5-9.3 11.7v7.1c0 1.6-1.9 2.5-3.1 1.5L103 96H84c-6.6 0-12-5.4-12-12V74c0-6.6 5.4-12 12-12z" fill={white} />
      <rect x="83" y="72" width="32" height="5" rx="2.5" fill={mid} />
      <rect x="83" y="82" width="20" height="5" rx="2.5" fill={tint} />
    </Frame>
  );
}
