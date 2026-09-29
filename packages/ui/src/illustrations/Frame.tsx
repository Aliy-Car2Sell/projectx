/** The three colours of every illustration (plus white). Flat shapes only: no outlines, no gradients, no emoji. */
export const tint = "var(--color-primary-100)";
export const mid = "var(--color-primary-300)";
export const brand = "var(--color-primary-500)";
export const white = "#fff";

export type IllustrationProps = {
  /** Rendered width in px; the height follows the 160×120 canvas. */
  width?: number;
  className?: string;
  /** Illustrations are decoration next to a title; give a title only when one stands alone. */
  title?: string;
};

/** 160×120 canvas with the soft backdrop all illustrations share. */
export function Frame({
  width = 160,
  className,
  title,
  backdrop = true,
  children,
}: IllustrationProps & { backdrop?: boolean; children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 120"
      width={width}
      height={(width * 3) / 4}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {backdrop && (
        <>
          <path d="M30 64c0-27 21-48 51-48 31 0 51 17 51 44s-20 46-52 46c-30 0-50-14-50-42z" fill={tint} />
          <circle cx="22" cy="36" r="4" fill={mid} />
          <circle cx="144" cy="84" r="5" fill={mid} />
          <circle cx="136" cy="24" r="3" fill={tint} />
        </>
      )}
      {children}
    </svg>
  );
}
