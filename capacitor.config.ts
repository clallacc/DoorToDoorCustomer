import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gillettegroup.doortodoor',
  appName: 'Door To Door Shopping',
  webDir: 'www',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      splashImmersive: true,
      backgroundColor: '#FFFFFF',
    },
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
