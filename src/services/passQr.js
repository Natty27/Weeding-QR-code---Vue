import QRCode from "qrcode";
import { FRONTEND_BASE_URL } from "../config";

/**
 * The URL a pass QR carries. Identical to the one the backend bakes into the
 * printed passes, so a printed card, a saved pass and a digital invitation all
 * scan to the same place.
 */
export const passUrl = (token) => `${FRONTEND_BASE_URL}/guests/verify/${token}`;

export const passQrDataUrl = (token) =>
  QRCode.toDataURL(passUrl(token), {
    width: 640,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });
