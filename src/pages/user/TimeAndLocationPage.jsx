import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { db, auth } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import styles from '../../styles/userAttributesPageStyles';
import { timeSlots } from '../../consts/constants';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { getDistance } from 'geolib';
import { loader } from '../../utils/googleMapsLoader';

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '12px 16px',
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    border: '2px solid',
    borderColor: alpha('#FFD700', 0.3),
    transition: 'all 0.2s ease-in-out',
    '&:focus': {
      borderColor: '#FFD700',
      boxShadow: `0 0 0 2px ${alpha('#FFD700', 0.2)}`,
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '12px 16px',
  margin: '4px 8px',
  borderRadius: 8,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha('#FFD700', 0.1),
  },
  '&.Mui-selected': {
    backgroundColor: alpha('#FFD700', 0.2),
    '&:hover': {
      backgroundColor: alpha('#FFD700', 0.3),
    },
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  borderRadius: '16px',
  backgroundColor: alpha('#FFD700', 0.1),
  border: `1px solid ${alpha('#FFD700', 0.3)}`,
  // オレンジ
  color: '#FFA500',
  '& .MuiChip-deleteIcon': {
    color: '#FFA500',
    '&:hover': {
      color: '#FFA500',
    },
  },
  '&:hover': {
    backgroundColor: alpha('#FFD700', 0.2),
  },
}));

const TimeAndLocationPage = () => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearbyAreas, setNearbyAreas] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const navigate = useNavigate();
  const [areaDetails, setAreaDetails] = useState(new Map());

  useEffect(() => {
    const getNearbyAreas = async () => {
      try {
        setIsLoadingLocation(true);

        // 既存の loader インスタンスを使用
        const google = await loader.load();

        const service = new google.maps.places.PlacesService(
          document.createElement('div')
        );

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  reject(new Error('位置情報の使用が許可されていません。'));
                  break;
                case error.POSITION_UNAVAILABLE:
                  reject(new Error('位置情報を取得できませんでした。'));
                  break;
                case error.TIMEOUT:
                  reject(new Error('位置情報の取得がタイムアウトしました。'));
                  break;
                default:
                  reject(error);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            }
          );
        });

        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userCoords);

        const request = {
          location: new google.maps.LatLng(userCoords.lat, userCoords.lng),
          radius: 50000,
          type: ['locality', 'sublocality', 'political'],
        };

        const results = await new Promise((resolve, reject) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else if (
              status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              resolve([]);
            } else {
              reject(new Error('Places API error: ' + status));
            }
          });
        });

        // 詳細情報を取得して地域名を構築
        const detailedResults = await Promise.all(
          results.map(
            (place) =>
              new Promise((resolve, reject) => {
                service.getDetails(
                  {
                    placeId: place.place_id,
                    fields: [
                      'name',
                      'geometry',
                      'address_components',
                      'formatted_address',
                    ],
                  },
                  (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                      // 住所コンポーネントから必要な情報を抽出
                      const components = result.address_components;
                      const city = components.find(
                        (c) =>
                          c.types.includes('locality') ||
                          c.types.includes('administrative_area_level_1')
                      );
                      const ward = components.find(
                        (c) =>
                          c.types.includes('sublocality_level_1') ||
                          c.types.includes('ward')
                      );
                      const district = components.find(
                        (c) =>
                          c.types.includes('sublocality_level_2') ||
                          c.types.includes('sublocality_level_3')
                      );
                      const neighborhood = components.find(
                        (c) =>
                          c.types.includes('sublocality_level_4') ||
                          c.types.includes('neighborhood')
                      );

                      // 地域名を構築
                      let areaName = '';
                      if (city) areaName += city.long_name;
                      if (ward) areaName += ` ${ward.long_name}`;
                      if (district) areaName += ` ${district.long_name}`;
                      if (neighborhood)
                        areaName += ` ${neighborhood.long_name}`;

                      resolve({
                        ...place,
                        detailedName: areaName.trim(),
                        geometry: result.geometry,
                      });
                    } else {
                      resolve(place);
                    }
                  }
                );
              })
          )
        );

        // 重複を除去し、距離でソート
        const userLatLng = new google.maps.LatLng(
          userCoords.lat,
          userCoords.lng
        );
        const uniqueAreas = new Map();

        detailedResults.forEach((place) => {
          if (place.detailedName && !uniqueAreas.has(place.detailedName)) {
            const distance =
              google.maps.geometry.spherical.computeDistanceBetween(
                userLatLng,
                place.geometry.location
              );
            uniqueAreas.set(place.detailedName, {
              value: place.place_id,
              label: place.detailedName,
              distance: distance,
            });
          }
        });

        const nearestAreas = Array.from(uniqueAreas.values())
          .sort((a, b) => a.distance - b.distance)
          .map((area) => ({
            value: area.value,
            label: `${area.label} (約${Math.round(area.distance / 1000)}km)`,
          }));

        if (nearestAreas.length === 0) {
          setLocationError('近くの地域が見つかりませんでした。');
        } else {
          setNearbyAreas(nearestAreas);
          setPreferredLocations([]);
        }
      } catch (error) {
        console.error('位置情報の取得に失敗:', error);
        setLocationError(error.message || '位置情報の取得に失敗しました。');
        setNearbyAreas([]);
        setPreferredLocations([]);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getNearbyAreas();
  }, []);

  useEffect(() => {
    console.log('Current nearby areas:', nearbyAreas);
    console.log('Current preferred locations:', preferredLocations);
  }, [nearbyAreas, preferredLocations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          availableTimes,
          preferredLocations,
          isProfileComplete: true,
        });
        navigate('/home');
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  };

  // 地域の詳細情報を取得する関数を追加
  const fetchAreaDetails = async (placeId) => {
    try {
      const google = await loader.load();
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      return new Promise((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: ['name', 'address_components', 'formatted_address'],
          },
          (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              const components = result.address_components;
              const city = components.find(
                (c) =>
                  c.types.includes('locality') ||
                  c.types.includes('administrative_area_level_1')
              );
              const ward = components.find(
                (c) =>
                  c.types.includes('sublocality_level_1') ||
                  c.types.includes('ward')
              );
              const district = components.find(
                (c) =>
                  c.types.includes('sublocality_level_2') ||
                  c.types.includes('sublocality_level_3')
              );

              let areaName = '';
              if (city) areaName += city.long_name;
              if (ward) areaName += ` ${ward.long_name}`;
              if (district) areaName += ` ${district.long_name}`;

              resolve(areaName.trim() || result.formatted_address);
            } else {
              reject(new Error('Failed to fetch area details'));
            }
          }
        );
      });
    } catch (error) {
      console.error('Error fetching area details:', error);
      return placeId;
    }
  };

  // preferredLocations が変更されたときに地域の詳細情報を取得
  useEffect(() => {
    const fetchAllAreaDetails = async () => {
      const newAreaDetails = new Map();

      for (const placeId of preferredLocations) {
        if (!areaDetails.has(placeId)) {
          try {
            const areaName = await fetchAreaDetails(placeId);
            newAreaDetails.set(placeId, areaName);
          } catch (error) {
            console.error('Error fetching area detail:', error);
            newAreaDetails.set(placeId, placeId);
          }
        } else {
          newAreaDetails.set(placeId, areaDetails.get(placeId));
        }
      }
      setAreaDetails(newAreaDetails);
    };

    fetchAllAreaDetails();
  }, [preferredLocations]);

  return (
    <Container maxWidth="sm" sx={{ ...styles.container, mt: 0 }}>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            ...styles.paper,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={styles.headerSection}>
            <Typography variant="h4" sx={styles.title}>
              時間とエリアの設定
            </Typography>
            <Typography variant="body1" sx={styles.subtitle}>
              参加可能な時間帯と希望エリアを教えてください
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={styles.formSection}>
              <Box
                sx={{
                  ...styles.sectionHeader,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AccessTimeIcon
                  sx={{
                    ...styles.sectionIcon,
                    color: '#FFA500',
                    fontSize: '2rem',
                  }}
                />
                <Box>
                  <Typography variant="h6" sx={styles.sectionTitle}>
                    参加可能な時間帯
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    複数選択可能です
                  </Typography>
                </Box>
              </Box>
              <FormControl fullWidth>
                <StyledSelect
                  multiple
                  value={availableTimes}
                  onChange={(e) => setAvailableTimes(e.target.value)}
                  renderValue={(selected) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        m: -0.5,
                      }}
                    >
                      {selected.map((value) => (
                        <StyledChip
                          key={value}
                          label={
                            timeSlots.find((slot) => slot.value === value)
                              ?.label
                          }
                          onDelete={() => {
                            setAvailableTimes(
                              availableTimes.filter((item) => item !== value)
                            );
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      },
                    },
                  }}
                >
                  {timeSlots.map((slot) => (
                    <StyledMenuItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </StyledMenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Box>

            <Box sx={styles.formSection}>
              <Box
                sx={{
                  ...styles.sectionHeader,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LocationOnIcon
                  sx={{
                    ...styles.sectionIcon,
                    color: '#FFA500',
                    fontSize: '2rem',
                  }}
                />
                <Box>
                  <Typography variant="h6" sx={styles.sectionTitle}>
                    希望のエリア
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    よく行くエリアを選択してください
                  </Typography>
                </Box>
              </Box>

              {isLoadingLocation ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#FFA500' }} />
                </Box>
              ) : locationError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {locationError}
                </Alert>
              ) : (
                <>
                  <FormControl fullWidth>
                    <StyledSelect
                      multiple
                      value={preferredLocations}
                      onChange={(e) => setPreferredLocations(e.target.value)}
                      renderValue={(selected) => (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            m: -0.5,
                          }}
                        >
                          {selected.map((value) => (
                            <StyledChip
                              key={value}
                              label={areaDetails.get(value) || value}
                              onDelete={() => {
                                setPreferredLocations(
                                  preferredLocations.filter(
                                    (item) => item !== value
                                  )
                                );
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {nearbyAreas.map((area) => (
                        <StyledMenuItem key={area.value} value={area.value}>
                          {area.label}
                        </StyledMenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>

                  {!showAllAreas && (
                    <Button
                      onClick={() => setShowAllAreas(true)}
                      sx={{
                        mt: 2,
                        color: '#FFA500',
                        '&:hover': {
                          backgroundColor: alpha('#FFA500', 0.1),
                        },
                      }}
                    >
                      他のエリアを表示
                    </Button>
                  )}

                  {nearbyAreas.length === 0 && !locationError && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      近くに利用可能なエリアがありません。
                      {!showAllAreas &&
                        '「他のエリアを表示」をクリックして全てのエリアから選択できます。'}
                    </Alert>
                  )}
                </>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                ...styles.submitButton,
                mt: 4,
                height: 56,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #FF8C00 30%, #FFA500 90%)',
                boxShadow: '0 3px 15px rgba(255, 140, 0, 0.3)',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #FFA500 30%, #FF8C00 90%)',
                  boxShadow: '0 4px 20px rgba(255, 140, 0, 0.4)',
                },
              }}
            >
              設定を完了する
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default TimeAndLocationPage;
