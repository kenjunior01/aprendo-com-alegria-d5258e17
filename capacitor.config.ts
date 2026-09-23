import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Kidoz — Aprender com alegria · Configuração nativa (Android/APK)
 *
 * Estratégia "remote-first": o APK é uma shell nativa premium
 * (splash, ícones adaptativos, status bar, haptics, push, botão back)
 * que carrega o site de produção — todas as funcionalidades (SSR,
 * server functions, tutor IA, loja) funcionam sem duplicação.
 */
const config: CapacitorConfig = {
  appId: 'online.kidoz.app',
  appName: 'Kidoz',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https',
    // Shell nativa carrega o site de produção (SSR + APIs completos).
    url: 'https://kidoz.online',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0EA5E9',
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0EA5E9',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // Sobreposição é gerida em runtime (src/lib/native.ts) conforme o tema.
      style: 'DARK',
      backgroundColor: '#FFFFFF',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
