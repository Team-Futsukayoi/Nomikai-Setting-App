/// <reference types="vite/client" />
import { calculateCentralLocation } from '../utils/locationUtils';
import { searchNearbyVenues } from '../utils/venueUtils';
import { calculateOptimalDateTime } from '../utils/dateTimeUtils'; 
import OneSignal from 'react-onesignal';

export const initializeNotifications = async () => {
  try {
    await OneSignal.init({ 
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true
    });
    await OneSignal.showSlidedownPrompt();
  } catch (error) {
    console.error('OneSignal初期化エラー:', error);
  }
};

export const sendEventNotification = async (
  userIds: string[], 
  eventId: string,
  eventTitle: string
) => {
  try {
    const notification = {
      contents: {
        en: `新しいイベント「${eventTitle}」に招待されました！`,
        ja: `新しいイベント「${eventTitle}」に招待されました！`
      },
      include_external_user_ids: userIds,
      data: {
        eventId: eventId
      }
    };

    await OneSignal.postNotification(notification);
  } catch (error) {
    console.error('通知送信エラー:', error);
  }
}; 