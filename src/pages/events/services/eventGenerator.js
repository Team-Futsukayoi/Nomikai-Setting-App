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

    // テスト用のモックデータ
    const mockStore = {
      name: '居酒屋 テスト',
      address: '新潟県新潟市中央区東大通1-1-1',
      placeId: 'test_place_id',
      rating: 4.5,
      userRatingsTotal: 100,
      priceLevel: 2,
      businessStatus: 'OPERATIONAL',
      vicinity: '新潟市中央区東大通1-1-1',
    };

    /*
    // 選択された店舗を取得(本番用)
    const store = await selectStore(randomTimeSlot, groupId);
    console.log('選択された店舗:', store);

    // 店舗情報の必須フィールドチェック
    if (!store.name) {
      throw new Error('店舗名が取得できませんでした');
    }

    // 住所情報の取得（formatted_addressを優先）
    const address = store.formatted_address || store.vicinity || '住所不明';

    */

    return {
      /*
      // 選択された店舗を返す(本番用)
      store: {
        name: store.name,
        address: address,
        placeId: store.place_id || null,
        rating: store.rating || 0,
        userRatingsTotal: store.user_ratings_total || 0,
        priceLevel: store.price_level || 0,
        businessStatus: store.business_status || 'UNKNOWN',
      },
      */
      store: mockStore,
      timeSlot: TIME_RANGES[randomTimeSlot],
    };
  } catch (error) {
    console.error('イベント生成エラー:', error);
    throw error;
  }
}
