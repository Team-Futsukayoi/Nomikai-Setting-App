export const TIME_RANGES = {
  lunch: { start: '11:00', end: '14:00' },
  afternoon: { start: '14:00', end: '17:00' },
  evening: { start: '17:00', end: '19:00' },
  night: { start: '19:00', end: '22:00' },
  latenight: { start: '22:00', end: '24:00' },
};

export function isOpenDuringTimeSlot(place, timeSlot) {
  console.log('営業時間チェック:', {
    店舗名: place.name,
    営業時間: place.opening_hours,
    指定時間帯: timeSlot,
    営業状態: place.business_status,
  });

  // 営業時間情報がない場合は営業していると仮定
  if (!place.opening_hours) {
    console.log(`${place.name}: 営業時間情報なし - 営業と仮定`);
    return true; // 営業時間情報がない場合は営業していると仮定
  }

  // 営業中かどうかの確認
  if (place.business_status !== 'OPERATIONAL') {
    console.log(`${place.name}: 営業していない`);
    return false;
  }

  // timeSlotの時間範囲を取得
  const timeRange =
    typeof timeSlot === 'string' ? TIME_RANGES[timeSlot] : timeSlot;
  const desiredStart = parseInt(timeRange.start.split(':')[0]);
  const desiredEnd = parseInt(timeRange.end.split(':')[0]);

  // 営業時間の詳細情報がない場合は営業していると仮定
  if (!place.opening_hours.periods) {
    console.log(`${place.name}: 詳細な営業時間情報なし - 営業と仮定`);
    return true;
  }

  const today = new Date().getDay();
  const todayHours = place.opening_hours.periods.find(
    (period) => period.open?.day === today
  );

  if (!todayHours?.open || !todayHours?.close) {
    console.log(`${place.name}: 本日の営業時間情報なし - 営業と仮定`);
    return true; // 本日の営業時間情報がない場合は営業していると仮定
  }

  const openHour = parseInt(todayHours.open.time.slice(0, 2));
  const closeHour = parseInt(todayHours.close.time.slice(0, 2));

  console.log(
    `${place.name}: 営業時間 ${openHour}時-${closeHour}時, 希望時間帯 ${desiredStart}時-${desiredEnd}時`
  );

  // 24時を超える場合の処理
  if (closeHour < openHour) {
    // 深夜営業の場合
    return openHour <= desiredStart || desiredEnd <= closeHour;
  } else {
    // 通常営業の場合
    return openHour <= desiredStart && desiredEnd <= closeHour;
  }
}
