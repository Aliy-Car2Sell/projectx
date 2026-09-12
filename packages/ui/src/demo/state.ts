export type DemoState = "normal" | "empty" | "loading" | "error";

/** Read the `?state=` query param used to preview list states in the mockup. */
export function readDemoState(sp: { [key: string]: string | string[] | undefined }): DemoState {
  const v = sp.state;
  if (v === "empty" || v === "loading" || v === "error") return v;
  return "normal";
}
