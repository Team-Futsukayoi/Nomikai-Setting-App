import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loader = null;

// キャッシュの実装
const CACHE_DURATION = 5 * 60 * 1000;
const searchCache = new Map();
const detailsCache = new Map();

export function getLoader() {
  if (!loader) {
    loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      id: '__googleMapsScriptId',
    });
  }
  return loader;
}

// キャッシュのキーを生成
function getCacheKey(params) {
  return JSON.stringify(params);
}

// 近隣の飲み屋を検索
// 引数: location(緯度経度), options(オプション)
// 戻り値: 飲み屋の情報
export async function searchNearbyStores(location, options = {}) {
  try {
    console.log('検索位置情報:', {
      location,
      lat: location?.lat,
      lng: location?.lng,
    });

    if (
      !location?.lat ||
      !location?.lng ||
      isNaN(location.lat) ||
      isNaN(location.lng)
    ) {
      throw new Error('無効な位置情報です');
    }

    // キャッシュキーの生成
    const cacheKey = `nearby_${location.lat}_${location.lng}_${options.radius || 800}`;

    // キャッシュチェック
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('キャッシュから結果を返却');
      return cached.data;
    }

    const google = await getLoader().load();
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);

    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius: parseInt(options.radius || 800),
      type: 'restaurant',
      language: 'ja',
      keyword: '居酒屋|焼き鳥|酒場|バル|炉端',
    };

    console.log('検索リクエスト:', request);

    const results = await new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        console.log('API応答:', { status, resultsCount: results?.length });

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`店舗の検索に失敗しました (status: ${status})`));
        }
      });
    });

    // 結果をキャッシュに保存
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    });

    return results;
  } catch (error) {
    console.error('Places API エラー:', error);
    throw error;
  }
}

// 店舗詳細を取得
// 引数: placeId(Google Place ID)
// 戻り値: 店舗の詳細情報
export async function getPlaceDetails(placeId) {
  try {
    // キャッシュをチェック
    const cached = detailsCache.get(placeId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('キャッシュから店舗詳細を返します');
      return cached.data;
    }

    const google = await getLoader().load();
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);

    const place = await new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: [
            'name',
            'formatted_address',
            'opening_hours',
            'rating',
            'business_status',
            'types',
            'price_level',
          ],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(
              new Error(`店舗詳細の取得に失敗しました (status: ${status})`)
            );
          }
        }
      );
    });

    // 結果をキャッシュ保存
    detailsCache.set(placeId, {
      data: place,
      timestamp: Date.now(),
    });

    return place;
  } catch (error) {
    console.error('店舗詳細取得エラー:', error);
    throw error;
  }
}
