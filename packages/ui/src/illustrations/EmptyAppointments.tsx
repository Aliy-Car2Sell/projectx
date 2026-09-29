import { Frame, brand, mid, tint, white, type IllustrationProps } from "./Frame";

/** No appointments: a calendar with one day picked out. */
export function EmptyAppointments(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="47" y="32" width="66" height="62" rx="13" fill={white} />
      <path d="M47 45c0-7.2 5.8-13 13-13h40c7.2 0 13 5.8 13 13v9H47z" fill={brand} />
      <rect x="63" y="25" width="7" height="15" rx="3.5" fill={mid} />
      <rect x="90" y="25" width="7" height="15" rx="3.5" fill={mid} />
      <circle cx="61" cy="66" r="4.5" fill={tint} />
      <circle cx="74" cy="66" r="4.5" fill={tint} />
      <circle cx="87" cy="66" r="4.5" fill={tint} />
      <circle cx="100" cy="66" r="4.5" fill={tint} />
      <circle cx="61" cy="80" r="4.5" fill={tint} />
      <circle cx="74" cy="80" r="4.5" fill={tint} />
      <circle cx="87.5" cy="80" r="7" fill={brand} />
      <circle cx="100" cy="80" r="4.5" fill={tint} />
    </Frame>
  );
}
