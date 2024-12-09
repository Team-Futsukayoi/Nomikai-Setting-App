import { selectStore } from './storeSelector';
import { TIME_RANGES } from '../utils/timeUtils';

export async function generateEvent(timeSlots, groupId) {
  try {
    console.log('利用可能な時間帯:', timeSlots);

    // 共通の時間帯からランダムに1つ選択
    const randomTimeSlot =
      timeSlots[Math.floor(Math.random() * timeSlots.length)];
    console.log(
      '選択された時間帯:',
      randomTimeSlot,
      `(${TIME_RANGES[randomTimeSlot].start} - ${TIME_RANGES[randomTimeSlot].end})`
    );

    const store = await selectStore(randomTimeSlot, groupId);

    return {
      store: {
        name: store.name,
        address: store.vicinity || store.formatted_address,
        placeId: store.place_id,
        rating: store.rating,
        userRatingsTotal: store.user_ratings_total,
        priceLevel: store.price_level,
      },
      timeSlot: TIME_RANGES[randomTimeSlot],
    };
  } catch (error) {
    console.error('イベント生成エラー:', error);
    throw error;
  }
}
