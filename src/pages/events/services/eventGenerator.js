import { selectStore } from './storeSelector';
import { TIME_RANGES } from '../utils/timeUtils';

export async function generateEvent(timeSlots, groupId) {
  try {
    console.log('利用可能な時間帯:', timeSlots);

    const randomTimeSlot =
      timeSlots[Math.floor(Math.random() * timeSlots.length)];
    console.log(
      '選択された時間帯:',
      randomTimeSlot,
      `(${TIME_RANGES[randomTimeSlot].start} - ${TIME_RANGES[randomTimeSlot].end})`
    );

    const store = await selectStore(randomTimeSlot, groupId);
    console.log('選択された店舗:', store);

    // 店舗情報の必須フィールドチェック
    if (!store.name) {
      throw new Error('店舗名が取得できませんでした');
    }

    // 住所情報の取得（formatted_addressを優先）
    const address = store.formatted_address || store.vicinity || '住所不明';

    return {
      store: {
        name: store.name,
        address: address,
        placeId: store.place_id || null,
        rating: store.rating || 0,
        userRatingsTotal: store.user_ratings_total || 0,
        priceLevel: store.price_level || 0,
        businessStatus: store.business_status || 'UNKNOWN',
      },
      timeSlot: TIME_RANGES[randomTimeSlot],
    };
  } catch (error) {
    console.error('イベント生成エラー:', error);
    throw error;
  }
}
