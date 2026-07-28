import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { updateProfile } from '@/lib/storage';
import { toast } from 'sonner';

export function usePushNotifications() {
  useEffect(() => {
    // Push notifications only work on native platforms
    if (Capacitor.getPlatform() === 'web') return;

    const registerPush = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        // User denied push notification permissions — silent fallback
        return;
      }

      await PushNotifications.register();
    };

    PushNotifications.addListener('registration', (token) => {
      updateProfile({ pushToken: token.value });
    });

    PushNotifications.addListener('registrationError', (error) => {
      // Registration error handled silently
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      toast.info(notification.title, {
        description: notification.body,
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', () => {
      // Action handled by the app's navigation
    });

    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);
}
