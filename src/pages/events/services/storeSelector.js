import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { searchNearbyStores, getPlaceDetails } from '../api/googlePlacesApi';
import { isOpenDuringTimeSlot } from '../utils/timeUtils';

// PlacesServiceのシングルトンインスタンスを管理
let placesServiceInstance = null;

const getPlacesService = () => {
  if (!window.google?.maps?.places) {
    throw new Error('Google Maps APIが利用できません');
  }

  if (!placesServiceInstance) {
    const mapDiv = document.createElement('div');
    placesServiceInstance = new window.google.maps.places.PlacesService(mapDiv);
  }
  return placesServiceInstance;
};

const getPlaceDetailsFromApi = (placeId) => {
  const service = getPlacesService();
  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ['geometry', 'name', 'formatted_address'],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place詳細の取得に失敗: ${status}`));
        }
      }
    );
  });
};

// グループメンバー取得関数を追加
async function getGroupMembers(groupId) {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  if (!groupDoc.exists()) {
    throw new Error('グループが見つかりません');
  }
  const groupData = groupDoc.data();
  return groupData.members.map((member) => member.uid);
}

export async function selectStore(timeSlot, groupId) {
  try {
    console.log('店舗選択開始:', { timeSlot, groupId });
    // Google Maps APIが読み込まれているかチェック
    if (!window.google?.maps?.places) {
      throw new Error('Google Maps APIが読み込まれていません');
    }

    // 1. グループ情報の取得
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('グループが見つかりません');
    }

    // グループメンバーのIDを取得
    const memberIds = await getGroupMembers(groupId);
    console.log('メンバーID:', memberIds);

    // メンバーの希望エリアと時間帯を取得
    const memberPreferences = await Promise.all(
      memberIds.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          throw new Error(`ユーザー ${uid} が見つかりません`);
        }
        const userData = userDoc.data();
        return {
          username: userData.username,
          preferredLocations: userData.preferredLocations || [],
          availableTimes: userData.availableTimes || [],
        };
      })
    );

    // メンバーの希望エリアを抽出
    const preferredLocations = memberPreferences.map(
      (pref) => pref.preferredLocations
    );
    console.log('メンバーの希望エリア:', preferredLocations);

    // メンバーの希望時間帯を抽出
    const availableTimes = memberPreferences.map((pref) => pref.availableTimes);
    console.log('メンバーの希望時間帯:', availableTimes);

    // 共通の時間帯を見つける
    const commonTimes = availableTimes.reduce((common, times) =>
      common.filter((time) => times.includes(time))
    );

    // 共通の時間帯がない場合はエラー
    if (commonTimes.length === 0) {
      throw new Error('メンバー間で共通の時間帯が見つかりません');
    }

    // 指定された時間帯が共通の時間帯に含まれているかチェック
    if (!commonTimes.includes(timeSlot)) {
      throw new Error('指定された時間帯はメンバーの共通時間帯ではありません');
    }

    // 共通のPlace IDを抽出
    const firstMemberLocations = preferredLocations[0] || [];
    const commonPlaceIds = firstMemberLocations.filter((placeId) =>
      preferredLocations.every((locations) => locations.includes(placeId))
    );

    if (commonPlaceIds.length === 0) {
      throw new Error('メンバー間で共通の希望エリアが見つかりません');
    }

    // Place IDから位置情報を取得
    const commonLocations = await Promise.all(
      commonPlaceIds.map(async (placeId) => {
        try {
          const place = await getPlaceDetailsFromApi(placeId);
          return {
            placeId,
            name: place.name,
            geometry: place.geometry,
            address: place.formatted_address,
          };
        } catch (error) {
          console.warn(`Place ID ${placeId} の詳細取得をスキップ:`, error);
          return null;
        }
      })
    ).then((results) => results.filter(Boolean));

    console.log('取得した共通エリアの詳細:', commonLocations);

    // 各共通エリアで店舗を検索
    const allPlaces = [];
    for (const location of commonLocations) {
      try {
        const searchLocation = {
          lat: location.geometry.location.lat(),
          lng: location.geometry.location.lng(),
        };

        console.log(`${location.name}での検索位置:`, searchLocation);

        // 値のチェック
        if (
          !searchLocation.lat ||
          !searchLocation.lng ||
          isNaN(searchLocation.lat) ||
          isNaN(searchLocation.lng)
        ) {
          console.warn(`${location.name}の位置情報が無効です:`, searchLocation);
          continue;
        }

        const places = await searchNearbyStores(searchLocation, {
          radius: 800,
        });

        console.log(`${location.name}での検索結果:`, places.length);

        // 検索元の情報を追加
        const placesWithSource = places.map((place) => ({
          ...place,
          searchedFrom: location.name,
        }));

        allPlaces.push(...placesWithSource);
      } catch (error) {
        console.warn(`${location.name}での検索をスキップ:`, error);
      }
    }

    // 営業時間でフィルタリング
    const filteredPlaces = [];
    const seenPlaceIds = new Set();

    for (const place of allPlaces) {
      try {
        // 重複チェック
        if (seenPlaceIds.has(place.place_id)) {
          continue;
        }
        seenPlaceIds.add(place.place_id);

        const details = await getPlaceDetails(place.place_id, {
          fields: [
            'name',
            'formatted_address',
            'rating',
            'opening_hours',
            'business_status',
            'place_id', // place_idも取得
          ],
        });

        console.log('店舗詳細:', {
          name: details.name,
          opening_hours: details.opening_hours,
          business_status: details.business_status,
        });

        // 営業時間チェックを一時的に緩和
        if (!details.opening_hours) {
          console.log(`${details.name}: 営業時間情報なし`);
          // 営業時間情報がない場合も含める
          filteredPlaces.push({
            ...details,
            rating: details.rating || 0,
            userRatingsTotal: details.user_ratings_total || 0,
            searchedFrom: place.searchedFrom, // 検索元の情報を保持
          });
          continue;
        }

        const isOpen = isOpenDuringTimeSlot(details, timeSlot);
        console.log(`${details.name}: 営業時間チェック結果 = ${isOpen}`);

        if (isOpen) {
          filteredPlaces.push({
            ...details,
            rating: details.rating || 0,
            userRatingsTotal: details.user_ratings_total || 0,
            searchedFrom: place.searchedFrom, // 検索元の情報を保持
          });
        }
      } catch (error) {
        console.warn('店舗詳細の取得をスキップ:', error);
        continue;
      }
    }

    console.log('営業時間フィルター後の店舗数:', filteredPlaces.length);
    console.log(
      'フィルター後の店舗:',
      filteredPlaces.map((p) => ({
        name: p.name,
        place_id: p.place_id, // 確認用
        opening_hours: p.opening_hours,
        business_status: p.business_status,
      }))
    );

    if (filteredPlaces.length === 0) {
      console.error('利用可能な店舗が見つかりません');
      throw new Error('利用可能な店舗が見つかりません');
    }

    console.log('利用可能な店舗:', filteredPlaces);

    // 8. スコアリングと選択
    const scoredPlaces = filteredPlaces.map((place) => ({
      ...place,
      score: calculateScore(place),
    }));

    scoredPlaces.sort((a, b) => b.score - a.score);

    // 上位10店舗からランダムに選択
    const topPlaces = scoredPlaces.slice(0, Math.min(10, scoredPlaces.length));
    const selectedPlace =
      topPlaces[Math.floor(Math.random() * topPlaces.length)];

    return selectedPlace;
  } catch (error) {
    console.error('店舗選択エラー:', error);
    throw error;
  }
}

// スコアリング関数
// 重み付けの内容
// 評価数が多いほど重みを高くする
// 評価数が少ない場合はランダムに選択する

function calculateScore(place) {
  const weights = {
    rating: 0.3,
    reviews: 0.2,
    priceLevel: 0.2,
    random: 0.3,
  };

  const ratingScore = (place.rating || 0) / 5;
  const reviewsScore = Math.min((place.userRatingsTotal || 0) / 1000, 1);
  const priceScore =
    place.price_level === 2
      ? 1
      : place.price_level === 3
        ? 0.7
        : place.price_level === 1
          ? 0.5
          : 0.3;
  const randomScore = Math.random();

  return (
    weights.rating * ratingScore +
    weights.reviews * reviewsScore +
    weights.priceLevel * priceScore +
    weights.random * randomScore
  );
}
