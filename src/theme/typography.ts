export const typography = {
  display:  { fontFamily: 'Syne_800ExtraBold', fontSize: 32, lineHeight: 36 },
  h1:       { fontFamily: 'Syne_700Bold',      fontSize: 28, lineHeight: 33 },
  h2:       { fontFamily: 'Syne_700Bold',      fontSize: 22, lineHeight: 28 },
  h3:       { fontFamily: 'Syne_600SemiBold',  fontSize: 18, lineHeight: 24 },
  bodyLg:   { fontFamily: 'Inter_400Regular',  fontSize: 17, lineHeight: 26 },
  body:     { fontFamily: 'Inter_400Regular',  fontSize: 15, lineHeight: 24 },
  bodySm:   { fontFamily: 'Inter_400Regular',  fontSize: 13, lineHeight: 20 },
  label:    { fontFamily: 'Inter_500Medium',   fontSize: 12, lineHeight: 18 },
  micro:    { fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  tracking: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13, lineHeight: 20, letterSpacing: 0.5 },
  code:     { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, lineHeight: 18 },
} as const;
