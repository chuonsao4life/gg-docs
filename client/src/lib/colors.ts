export const CURSOR_COLORS = [
  "#958DF1",
  "#F98181",
  "#FBCE41",
  "#FFC0CB",
  "#85C1E9",
  "#7DCEA0",
  "#b19cd9",
  "#f39c12",
];

export const getStableColor = (identifier: string) => {
  if (!identifier) return CURSOR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
};

/**
 * Returns a lighter, more transparent version of the user color for highlighting text.
 * Assumes the color is a hex string like "#958DF1".
 */
export const getHighlightColor = (identifier: string) => {
  const baseColor = getStableColor(identifier);
  // Thêm 50 (khoảng 30% opacity) vào mã hex để làm màu nền highlight
  return `${baseColor}50`;
};
