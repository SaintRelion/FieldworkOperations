// ============================================================
// MARK: Helpers
export const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
