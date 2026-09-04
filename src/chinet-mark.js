/**
 * The official ChiNet mark. Source file: src/assets/chinet-icon.svg
 *
 * The viewBox is trimmed to the path's real bounds - the source file leaves
 * room for the wordmark and a "TM" that is unreadable at brand-mark sizes.
 * Shared so the Vue component and the canvas-drawn pass image use one copy.
 */
export const MARK_VIEWBOX = "0 7.5 1585.79 1126.41";

export const MARK_ASPECT = 1585.79 / 1126.41;

export const MARK_PATH =
  "M0,260.29,1.67,914.48a218.15,218.15,0,0,0,218.18,218.1c120.22,0,218.08-97.86,218.08-218.1l.34-247.55a141,141,0,0,0-41.49-100.28A141.75,141.75,0,0,0,296.2,525.08c-77.92.12-141.63,67.41-141.63,145.33V851.79h75.26V666.93a66.64,66.64,0,0,1,133.27,0l-.74,247.55c0,78.66-63.94,142.68-142.51,142.68s-142.61-64-142.61-142.68l1.9-583.64,194.14-.11c145-.07,262.55,117.45,262.55,262.43v538.92l747.44,1.83a302.64,302.64,0,0,0,302.52-302.69c0-.73,0-1.46,0-2.19s0-1.41,0-2.12c0-166.83-135.72-302.56-302.56-302.56l-420.07-.49a190,190,0,0,0-135.26,56,187.63,187.63,0,0,0-41.47,61.95l0,.13a189.52,189.52,0,0,0-14.57,73.62c0,.68,0,1.35,0,2s0,1.52,0,2.27c.16,103.58,90.12,191.09,196.45,191.09h350.36V827.86H863.18a112.76,112.76,0,0,1-112.6-110.47c1.15-61.18,51.22-110.6,112.6-110.6l420.09,1.09c122.53,0,222.37,99,223.53,221.18-1.16,122.24-101,221.32-223.57,221.32l-676.8-2.73V604.26c0-152.17-98.77-281.27-235.7-326.68V85.51l692.89-2.43c78.65,0,142.67,63.94,142.67,142.6s-64,142.51-142.67,142.51l-288,.75a66.64,66.64,0,0,1,0-133.28H976.81V160.4H779.07c-77.92,0-145.21,63.72-145.33,141.64a140.52,140.52,0,0,0,10.82,54.59,139.1,139.1,0,0,0,30.76,46,141,141,0,0,0,100.27,41.5l288-.34c120.22,0,218.09-97.86,218.09-218.09A218.17,218.17,0,0,0,1063.62,7.5L294.11,8.89V261.6Z";

/**
 * The mark as a standalone SVG data URL, for drawing onto a canvas.
 * Width and height are explicit because browsers need intrinsic dimensions
 * before they will rasterise an SVG image.
 */
export const markDataUrl = (height, color = "#ffffff") => {
  const width = Math.round(height * MARK_ASPECT);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="${MARK_VIEWBOX}"><path fill="${color}" d="${MARK_PATH}"/></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
