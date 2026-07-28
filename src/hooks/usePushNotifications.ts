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
        console.log('User denied permissions!');
        return;
      }

      await PushNotifications.register();
    };

    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      updateProfile({ pushToken: token.value });
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      toast.info(notification.title, {
        description: notification.body,
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
    });

    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);
}
