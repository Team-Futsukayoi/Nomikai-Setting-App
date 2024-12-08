import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export const EventGenerator = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateEvent = async (participants: string[]) => {
    try {
      setLoading(true);
      
      // 参加者の位置情報と予定を取得
      const participantsData = await Promise.all(
        participants.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return userDoc.data();
        })
      );

      // 中間地点を計算
      const centralLocation = calculateCentralLocation(participantsData);
      
      // 近くの飲食店を検索（Google Places APIを使用）
      const venues = await searchNearbyVenues(centralLocation);
      
      // 最適な日時を計算
      const suggestedDateTime = calculateOptimalDateTime(participantsData);

      // イベントを作成
      const eventData = {
        title: `${suggestedDateTime.getMonth() + 1}月の飲み会`,
        createdBy: currentUser.uid,
        date: suggestedDateTime,
        location: venues[0], // 最も適した場所を選択
        participants: participants.map(userId => ({
          userId,
          status: 'pending'
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const eventRef = await addDoc(collection(db, 'events'), eventData);
      
      // 参加者全員に通知を送信
      await sendEventNotifications(participants, eventRef.id);

    } catch (error) {
      console.error('イベント生成エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UIの実装 */}
    </div>
  );
}; 