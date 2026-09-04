import { EVENT } from "../event";
import { markDataUrl } from "../chinet-mark";

/**
 * Draws the guest's pass as a shareable portrait image: brand, event title,
 * who it belongs to, when and where, and the QR code at the bottom.
 *
 * Canvas rather than an <img> of the bare QR, so the guest can show or print
 * one picture that carries the event details with it.
 */
const W = 1000;
const H = 1460;
const PAD = 70;

const INK = {
  bg0: "#141546",
  bg1: "#080b18",
  edge: "rgba(148, 163, 255, 0.28)",
  white: "#f8fafc",
  brand: "#a5b4fc",
  muted: "#94a3b8",
  faint: "#6b7a99",
  accent: "#6366f1",
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`could not load ${src.slice(0, 24)}…`));
    image.src = src;
  });

const roundRect = (ctx, x, y, w, h, r) => {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }

  // Safari < 16.4 has no roundRect
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const centreText = (ctx, text, y, { font, color, spacing = 0 }) => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // letterSpacing is unsupported on older Safari; the text just renders tight
  try {
    ctx.letterSpacing = `${spacing}px`;
  } catch {
    /* ignore */
  }

  ctx.fillText(text, W / 2, y);

  try {
    ctx.letterSpacing = "0px";
  } catch {
    /* ignore */
  }
};

/**
 * @param {object} pass
 * @param {string} pass.qrDataUrl  the QR image already generated for this pass
 * @param {string} pass.name       guest name
 * @param {string} pass.org        "Company · Role", may be empty
 * @param {string} pass.ticketType Standard, VIP, …
 * @returns {Promise<Blob>} PNG of the finished pass
 */
export const composePassImage = async ({ qrDataUrl, name, org, ticketType }) => {
  const canvas = document.createElement("canvas");

  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");

  // the page's webfonts must be loaded before canvas can use them
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* fall back to system fonts */
    }
  }

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);

  bg.addColorStop(0, INK.bg0);
  bg.addColorStop(1, INK.bg1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // a soft glow behind the title, echoing the invitation page
  const glow = ctx.createRadialGradient(W / 2, 40, 0, W / 2, 40, 620);

  glow.addColorStop(0, "rgba(99, 102, 241, 0.38)");
  glow.addColorStop(1, "rgba(99, 102, 241, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 700);

  // hairline frame
  ctx.strokeStyle = INK.edge;
  ctx.lineWidth = 2;
  roundRect(ctx, 22, 22, W - 44, H - 44, 34);
  ctx.stroke();

  let y = PAD + 40;

  // brand mark
  try {
    const markHeight = 104;
    const mark = await loadImage(markDataUrl(markHeight, INK.white));

    ctx.drawImage(mark, (W - mark.width) / 2, y, mark.width, markHeight);
    y += markHeight + 52;
  } catch {
    // no logo is better than no pass
    y += 20;
  }

  centreText(ctx, EVENT.brand.toUpperCase(), y, {
    font: '700 26px Outfit, Inter, system-ui, sans-serif',
    color: INK.white,
    spacing: 9,
  });
  y += 78;

  centreText(ctx, EVENT.title, y, {
    font: '700 82px "Playfair Display", Georgia, serif',
    color: INK.white,
  });
  y += 40;

  // ticket type chip
  const chip = `${(ticketType || "Standard").toUpperCase()} PASS`;

  ctx.font = '700 24px Inter, system-ui, sans-serif';
  const chipWidth = ctx.measureText(chip).width + 44;

  ctx.fillStyle = "rgba(99, 102, 241, 0.18)";
  roundRect(ctx, (W - chipWidth) / 2, y, chipWidth, 46, 23);
  ctx.fill();
  ctx.strokeStyle = "rgba(129, 140, 248, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  centreText(ctx, chip, y + 31, {
    font: '700 24px Inter, system-ui, sans-serif',
    color: INK.brand,
    spacing: 2,
  });
  y += 46 + 62;

  // who the pass belongs to
  centreText(ctx, name || "Event Attendee", y, {
    font: '700 44px Inter, system-ui, sans-serif',
    color: INK.white,
  });
  y += org ? 44 : 22;

  if (org) {
    centreText(ctx, org, y, {
      font: '400 26px Inter, system-ui, sans-serif',
      color: INK.muted,
    });
    y += 26;
  }

  // divider
  y += 34;
  ctx.strokeStyle = "rgba(148, 163, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD + 60, y);
  ctx.lineTo(W - PAD - 60, y);
  ctx.stroke();
  y += 58;

  // when and where
  centreText(ctx, `${EVENT.dateLong}  ·  ${EVENT.time}`, y, {
    font: '600 30px Inter, system-ui, sans-serif',
    color: INK.white,
  });
  y += 44;

  centreText(ctx, EVENT.venueLong, y, {
    font: '400 28px Inter, system-ui, sans-serif',
    color: INK.muted,
  });

  // QR at the bottom, on white so it always scans
  const panel = 560;
  const panelX = (W - panel) / 2;
  const panelY = H - PAD - 78 - panel;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, panelX, panelY, panel, panel, 28);
  ctx.fill();

  const qr = await loadImage(qrDataUrl);
  const inset = 26;

  // scanners prefer hard module edges to interpolated ones
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    qr,
    panelX + inset,
    panelY + inset,
    panel - inset * 2,
    panel - inset * 2,
  );

  centreText(ctx, "Present this pass at the gate for check-in", H - PAD - 18, {
    font: '400 24px Inter, system-ui, sans-serif',
    color: INK.faint,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("could not render pass"))),
      "image/png",
    );
  });
};
