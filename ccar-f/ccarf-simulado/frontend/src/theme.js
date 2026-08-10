export const colors = {
  bg: "#0F1419",
  card: "#1B222C",
  border: "#2A3441",
  text: "#E6EDF3",
  textDim: "#7C8A9A",
  textDimmer: "#5A6572",
  accent: "#4FD1C5",
  accentDark: "#04342C",
  ok: "#0F2B27",
  bad: "#2B1315",
  red: "#F2555A",
  yellow: "#F2C14E",
};

export const wrapStyle = {
  fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  background: colors.bg,
  color: colors.text,
  padding: "1.5rem",
  borderRadius: "12px",
  maxWidth: "720px",
  margin: "0 auto",
};

export const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: "10px",
  padding: "1rem 1.25rem",
  marginBottom: "0.75rem",
};

export const primaryButton = {
  background: colors.accent,
  border: "none",
  color: colors.accentDark,
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const secondaryButton = {
  background: "transparent",
  border: `1px solid ${colors.accent}`,
  color: colors.accent,
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "13px",
  cursor: "pointer",
  fontFamily: "inherit",
};

export const optionButton = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: colors.card,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  borderRadius: "8px",
  padding: "10px 14px",
  marginBottom: "8px",
  fontSize: "13px",
  fontFamily: "inherit",
  cursor: "pointer",
};
