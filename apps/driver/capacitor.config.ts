import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schoolbus.driver',
  appName: 'School Bus Driver',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      saveToGallery: true,
      quality: 80
    },
    Geolocation: {
      requestPermissions: true
    }
  }
};

export default config;
