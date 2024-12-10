import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ja';

dayjs.extend(relativeTime);
dayjs.locale('ja');

export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  const now = dayjs();
  const lastSeen = dayjs(timestamp);
  const diffMinutes = now.diff(lastSeen, 'minute');
  
  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  
  const diffHours = now.diff(lastSeen, 'hour');
  if (diffHours < 24) return `${diffHours}時間前`;
  
  const diffDays = now.diff(lastSeen, 'day');
  if (diffDays < 7) return `${diffDays}日前`;
  
  return lastSeen.format('YYYY/MM/DD');
};