/**
 * Clerk components sit inside an always-dark floating slab (.slab-ink), so they use one
 * fixed dark palette that matches the brand in both site themes.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#e9a93b",
    colorPrimaryForeground: "#1b1306",
    colorBackground: "#0d1424",
    colorForeground: "#edf0f6",
    colorMuted: "#172238",
    colorMutedForeground: "#9aa5b8",
    colorInput: "#121b2d",
    colorInputForeground: "#edf0f6",
    colorBorder: "rgba(160, 174, 200, 0.22)",
    colorRing: "#e9a93b",
    colorDanger: "#f28b82",
    colorSuccess: "#63d3a6",
    colorNeutral: "#edf0f6",
    colorShimmer: "rgba(255,255,255,0.08)",
    borderRadius: "14px",
    fontFamily: "var(--font-barlow), ui-sans-serif, system-ui, sans-serif",
    fontSize: "16px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full !shadow-none !border-0 !bg-transparent",
    card: "!bg-transparent !shadow-none !border-0 !p-0",
    header: "hidden",
    footer: "!bg-transparent !bg-none [&_*]:!bg-transparent",
    footerAction: "hidden",
    formFieldInput: "!min-h-[50px] !text-[16px]",
    formButtonPrimary: "!min-h-[50px] !rounded-full !text-[1rem] !font-semibold active:!scale-[0.97] !transition-transform",
    otpCodeFieldInput: "!min-h-[52px] !text-[1.2rem]",
    formResendCodeLink: "!text-[#f0b752]",
    identityPreviewEditButton: "!text-[#f0b752]",
  },
} as const;
