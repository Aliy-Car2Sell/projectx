/**
 * Every mock record/document points at one of two sample files in /public/mock,
 * so "view" and "download" work without a backend.
 */
export type MockFileType = "pdf" | "image";

export function mockFileUrl(type: MockFileType): string {
  return type === "image" ? "/mock/sample.png" : "/mock/sample.pdf";
}
