import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'au.poni.poker',
  appName: 'Pocket Poker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
