import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Mask an email for the visible stamp: j***n@gmail.com. The order reference identifies the buyer to us. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "your account";
  const head = user.slice(0, 1);
  const tail = user.length > 2 ? user.slice(-1) : "";
  return `${head}***${tail}@${domain}`;
}

/** Helvetica in pdf-lib only covers WinAnsi; anything else becomes "?". */
function winAnsiSafe(s: string): string {
  return s.replace(/[^\x20-\x7E]/g, "?");
}

/**
 * Personalise a copy: a quiet line at the foot of every page ("Personal copy for … ·
 * Order SG-…") plus document metadata. Social DRM: it never blocks reading, it just
 * makes casual sharing traceable.
 */
export async function stampCopy(master: Uint8Array, line: string, meta: { subject: string }): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(master, { updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const text = winAnsiSafe(line);
  const size = 6.2;
  const width = font.widthOfTextAtSize(text, size);
  for (const page of pdf.getPages()) {
    const { width: pw } = page.getSize();
    page.drawText(text, {
      x: Math.max(12, (pw - width) / 2),
      y: 7,
      size,
      font,
      color: rgb(0.52, 0.56, 0.63),
      opacity: 0.9,
    });
  }
  pdf.setSubject(winAnsiSafe(meta.subject));
  pdf.setProducer("Still Gravity");
  pdf.setModificationDate(new Date());
  return pdf.save({ useObjectStreams: true });
}
