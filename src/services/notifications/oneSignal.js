import OneSignal from 'react-onesignal';

let isInitialized = false;

export const initializeOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: 'push',
              autoPrompt: true,
              text: {
                actionMessage: 'イベントの通知を受け取りますか？',
                acceptButton: '許可',
                cancelButton: '後で',
              },
              delay: {
                pageViews: 1,
                timeDelay: 0,
              },
            },
          ],
        },
      },
    });

    // 通知の許可を明示的に要求
    const permission = await OneSignal.Notifications.requestPermission();
    console.log('通知許可状態:', permission);

    // サブスクリプション状態を確認
    const subscriptionState = await OneSignal.User.PushSubscription.optedIn;
    console.log('サブスクリプション状態:', subscriptionState);

    if (!subscriptionState) {
      // 明示的にサブスクリプションを要求
      await OneSignal.User.PushSubscription.optIn();
    }

    // デバッグ情報を取得
    const debug = await getUserInfo();
    console.log('OneSignal Debug Info:', debug);

    return debug.subscriptionId;
  } catch (error) {
    console.error('OneSignal初期化エラー:', error);
    return null;
  }
};

// OneSignalのデバッグ情報を取得する関数
async function getUserInfo() {
  try {
    // Notificationsオブジェクトから直接permissionを取得
    const permission = await window.Notification.permission;
    const [subscriptionId, pushToken, optedIn, serviceWorkerActive] =
      await Promise.all([
        OneSignal.User.PushSubscription.id,
        OneSignal.User.PushSubscription.token,
        OneSignal.User.PushSubscription.optedIn,
        OneSignal.context?.serviceWorkerManager?.getActiveState(),
      ]);

    const status = {
      currentUrl: location.href,
      serviceWorkerActive,
      permission, // ブラウザのネイティブ通知許可状態
      optedIn,
      subscriptionId,
      pushToken,
    };

    console.log('OneSignal Debug Info:', status);
    return status;
  } catch (error) {
    console.error('デバッグ情報取得エラー:', error);
    return null;
  }
}

export const enableOneSignalDebug = async () => {
  try {
    await OneSignal.debug();
    console.log('OneSignal デバッグモード有効化');

    // 現在の状態を確認
    const state = await Promise.all([
      OneSignal.Notifications.permission,
      OneSignal.User.PushSubscription.id,
      OneSignal.User.PushSubscription.token,
      OneSignal.User.PushSubscription.optedIn,
    ]);

    console.log('OneSignal 状態:', {
      permission: state[0],
      subscriptionId: state[1],
      pushToken: state[2],
      optedIn: state[3],
    });
  } catch (error) {
    console.error('デバッグモード有効化エラー:', error);
  }
};

export const getOneSignalStatus = async () => {
  try {
    const status = {
      permission: await OneSignal.Notifications.permission,
      isPushSupported: await OneSignal.Notifications.isPushSupported(),
      subscriptionId: await OneSignal.User.PushSubscription.id,
      pushToken: await OneSignal.User.PushSubscription.token,
      optedIn: await OneSignal.User.PushSubscription.optedIn,
    };

    console.log('OneSignal ステータス:', status);
    return status;
  } catch (error) {
    console.error('OneSignalステータス取得エラー:', error);
    return null;
  }
};

export const getOneSignalId = async () => {
  try {
    // 現在のサブスクリプションIDを取得
    const subscriptionId = await OneSignal.User.PushSubscription.id;

    if (!subscriptionId) {
      // サブスクリプションが無い場合は再度オプトインを試みる
      const optedIn = await OneSignal.User.PushSubscription.optIn();
      if (optedIn) {
        // オプトイン後に再度IDを取得
        return await OneSignal.User.PushSubscription.id;
      }
    }

    return subscriptionId;
  } catch (error) {
    console.error('OneSignal ID取得エラー:', error);
    return null;
  }
};

// サブスクリプションの有効性を確認する関数を追加
const validateSubscription = async (subscriptionId) => {
  try {
    // 現在のユーザーのサブスクリプションと比較
    const currentId = await OneSignal.User.PushSubscription.id;

    // 現在のサブスクリプションIDと一致する場合は有効
    if (subscriptionId === currentId) {
      return true;
    }

    // サブスクリプションの状態を確認
    const status = await OneSignal.User.PushSubscription.optedIn;
    return status;
  } catch (error) {
    console.error('サブスクリプション確認エラー:', error);
    return false;
  }
};

// Service Workerの状態を確認する関数を追加
const checkServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration(
      '/OneSignalSDKWorker.js'
    );
    console.log('Service Worker登録状態:', registration);
    return registration !== undefined;
  } catch (error) {
    console.error('Service Worker確認エラー:', error);
    return false;
  }
};

// 通知送信関数を修正して、デバッグ情報を追加
export const sendNotification = async (userIds, message) => {
  try {
    // Service Workerの状態を確認
    const swRegistration = await navigator.serviceWorker.getRegistration();
    console.log('現在のService Worker状態:', swRegistration);

    // 無効なIDを除外
    const validUserIds = userIds.filter((id) => id);
    console.log('送信対象のユーザーID:', validUserIds);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: import.meta.env.VITE_ONESIGNAL_APP_ID,
        include_player_ids: validUserIds,
        contents: {
          en: message,
          ja: message,
        },
        headings: {
          en: 'New Event Notification',
          ja: '新しいイベントのお知らせ',
        },
        web_push_type: 'Notification',
        priority: 10,
        ttl: 86400,
        // デバッグ用のフラグを追加
        isAnyWeb: true,
        chrome_web_icon: 'https://your-icon-url.png', // アイコンURLを追加
        url: window.location.href, // クリック時のリンクを追加
      }),
    });

    const data = await response.json();
    console.log('送信結果詳細:', {
      response: data,
      timestamp: new Date().toISOString(),
      browserInfo: navigator.userAgent,
    });

    return data;
  } catch (error) {
    console.error('通知送信エラー:', error);
    throw error;
  }
};
