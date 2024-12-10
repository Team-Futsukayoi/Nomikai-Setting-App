// src/types/react-onesignal.d.ts
declare module 'react-onesignal' {
    interface OneSignal {
      init: (options: { appId: string; allowLocalhostAsSecureOrigin: boolean }) => Promise<void>;
      showSlidedownPrompt: () => Promise<void>;
      postNotification: (notification: {
        contents: { [key: string]: string };
        include_external_user_ids: string[];
        data: { eventId: string };
      }) => Promise<void>;
    }
    
    const OneSignal: OneSignal;
    export default OneSignal;
  }