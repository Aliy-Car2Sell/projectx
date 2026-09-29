import { Frame, brand, mid, tint, white, type IllustrationProps } from "./Frame";

/**
 * The second style, drawn for three of the eight so the two can be compared on /design:
 * no backdrop, the object stands on a flat shadow and is filled with colour instead of white.
 * Not used by the apps.
 */
function Stage({ children, ...props }: IllustrationProps & { children: React.ReactNode }) {
  return (
    <Frame backdrop={false} {...props}>
      <ellipse cx="80" cy="106" rx="46" ry="7" fill={tint} />
      {children}
    </Frame>
  );
}

export function EmptyAppointmentsB(props: IllustrationProps) {
  return (
    <Stage {...props}>
      <rect x="42" y="20" width="76" height="76" rx="16" fill={tint} />
      <path d="M42 36c0-8.8 7.2-16 16-16h44c8.8 0 16 7.2 16 16v10H42z" fill={brand} />
      <rect x="60" y="12" width="8" height="18" rx="4" fill={mid} />
      <rect x="92" y="12" width="8" height="18" rx="4" fill={mid} />
      <circle cx="59" cy="61" r="5" fill={white} />
      <circle cx="73" cy="61" r="5" fill={white} />
      <circle cx="87" cy="61" r="5" fill={white} />
      <circle cx="101" cy="61" r="5" fill={white} />
      <circle cx="59" cy="78" r="5" fill={white} />
      <circle cx="73" cy="78" r="5" fill={white} />
      <circle cx="87" cy="78" r="8" fill={brand} />
      <circle cx="101" cy="78" r="5" fill={white} />
    </Stage>
  );
}

export function EmptyChatB(props: IllustrationProps) {
  return (
    <Stage {...props}>
      <path d="M44 14h52c8.8 0 16 7.2 16 16v20c0 8.8-7.2 16-16 16H60L44.6 78c-1.3 1-3.2.1-3.2-1.6V65.5C33.7 63.2 28 56.3 28 48V30c0-8.8 7.2-16 16-16z" fill={brand} />
      <circle cx="52" cy="40" r="4.5" fill={white} />
      <circle cx="70" cy="40" r="4.5" fill={white} />
      <circle cx="88" cy="40" r="4.5" fill={white} />
      <path d="M86 54h34c7.7 0 14 6.3 14 14v12c0 6.7-4.7 12.3-11 13.7v7.7c0 1.6-1.9 2.5-3.1 1.5L108.5 94H86c-7.7 0-14-6.3-14-14V68c0-7.7 6.3-14 14-14z" fill={mid} />
      <rect x="84" y="66" width="38" height="6" rx="3" fill={white} />
      <rect x="84" y="77" width="24" height="6" rx="3" fill={white} />
    </Stage>
  );
}

export function SuccessB(props: IllustrationProps) {
  return (
    <Stage {...props}>
      <circle cx="80" cy="54" r="40" fill={tint} />
      <circle cx="80" cy="54" r="30" fill={brand} />
      <path d="M67 54.5l9 9 17.5-18.5" stroke={white} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="40" r="4" fill={mid} />
      <circle cx="134" cy="66" r="5" fill={mid} />
      <circle cx="122" cy="18" r="3" fill={mid} />
    </Stage>
  );
}
