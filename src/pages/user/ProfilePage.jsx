import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  Container,
  Typography,
  Avatar,
  Box,
  TextField,
  Button,
  Paper,
  Skeleton,
  IconButton,
  Fade,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';
import { profileStyles } from '../../styles/profileStyles';
import { timeSlots } from '../../consts/constants';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { Loader } from '@googlemaps/js-api-loader';
import { motion } from 'framer-motion';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LiquorIcon from '@mui/icons-material/Liquor';
import { Slider } from '@mui/material';
import { loader } from '../../utils/googleMapsLoader';

const alcoholStrengthOptions = [
  { value: 'strong', label: '強い', icon: '🍺' },
  { value: 'medium', label: '普通', icon: '🍷' },
  { value: 'weak', label: '弱い', icon: '🥂' },
  { value: 'none', label: '飲まない', icon: '🚫' },
];

const genderOptions = [
  { value: 'male', label: '男性', icon: '👨' },
  { value: 'female', label: '女性', icon: '👩' },
  { value: 'other', label: 'その他', icon: '🧑' },
];

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
  borderRadius: '20px',
  backgroundColor: alpha('#FFD700', 0.1),
  border: `1px solid ${alpha('#FFA500', 0.2)}`,
  color: theme.palette.text.primary,
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease',
  maxWidth: '100%',
  '& .MuiChip-label': {
    whiteSpace: 'normal',
    display: 'block',
    wordBreak: 'break-word',
    lineHeight: '1.4',
    padding: '6px 12px',
    fontSize: '0.9rem',
  },
  '& .MuiChip-deleteIcon': {
    color: '#FFA500',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#FF8C00',
    },
  },
  '&:hover': {
    backgroundColor: alpha('#FFD700', 0.2),
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(255, 215, 0, 0.2)',
  },
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(255, 165, 0, 0.15)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(255, 165, 0, 0.25)',
  },
}));

const InfoCard = ({ icon: Icon, label, value }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      my: 1.5,
      borderRadius: '16px',
      background:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 215, 0, 0.2)',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transform: 'translateX(4px)',
        boxShadow: '0 4px 12px rgba(255, 165, 0, 0.15)',
      },
    }}
  >
    <Icon
      sx={{
        fontSize: '2rem',
        color: '#FFA500',
        filter: 'drop-shadow(0 2px 4px rgba(255, 165, 0, 0.2))',
      }}
    />
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: '#FFA500',
          fontSize: '0.85rem',
          mb: 0.5,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 500,
          color: 'text.primary',
          fontSize: '1rem',
        }}
      >
        {value || '未設定'}
      </Typography>
    </Box>
  </Box>
);

const LocationList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '100%',
  padding: '8px 0',
}));

const LocationItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 16px',
  borderRadius: '12px',
  backgroundColor: alpha('#FFD700', 0.05),
  border: `1px solid ${alpha('#FFA500', 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#FFD700', 0.1),
    transform: 'translateX(4px)',
  },
}));

const drinkingLevelMarks = [
  {
    value: 0,
    label: '初心者',
    icon: <SportsBarIcon />,
    description: 'お酒はあまり飲めません',
    strength: 'weak',
  },
  {
    value: 50,
    label: '中級者',
    icon: <LocalBarIcon />,
    description: '適度に楽しめます',
    strength: 'medium',
  },
  {
    value: 100,
    label: '上級者',
    icon: <LiquorIcon />,
    description: 'お酒には自信があります',
    strength: 'strong',
  },
];

const getSliderValueFromStrength = (strength) => {
  switch (strength) {
    case 'weak':
      return 0;
    case 'medium':
      return 50;
    case 'strong':
      return 100;
    default:
      return 0;
  }
};

const getActiveLevel = (drinkingLevel) => {
  if (drinkingLevel <= 25) return 0;
  if (drinkingLevel <= 75) return 1;
  return 2;
};

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [alcoholStrength, setAlcoholStrength] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [areaDetails, setAreaDetails] = useState(new Map());
  const [userId, setUserId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyAreas, setNearbyAreas] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [showAllAreas, setShowAllAreas] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          setError('ユーザー認証が必要です');
          return;
        }

        const userIdDoc = await getDoc(doc(db, 'userIds', currentUser.uid));
        if (userIdDoc.exists()) {
          setUserId(userIdDoc.data().userId);
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setUsername(userData.username || '');
          setGender(userData.gender || '');
          setBirthDate(userData.birthDate ? dayjs(userData.birthDate) : null);
          setAlcoholStrength(userData.alcoholStrength || '');
          setAvailableTimes(userData.availableTimes || []);
          setPreferredLocations(userData.preferredLocations || []);
        } else {
          setError('ユーザーデータが見つかりません');
        }
      } catch (err) {
        setError('データの取得中にエラーが発生しました');
        console.error('Firestoreラー:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (editMode && user) {
      setUsername(user.username || '');
      setGender(user.gender || '');
      setBirthDate(user.birthDate ? dayjs(user.birthDate) : null);
      setAlcoholStrength(user.alcoholStrength || '');
      setAvailableTimes(user.availableTimes || []);
      setPreferredLocations(user.preferredLocations || []);
    }
  }, [editMode, user]);

  useEffect(() => {
    const fetchAllAreaDetails = async () => {
      try {
        const google = await loader.load();
        const service = new google.maps.places.PlacesService(
          document.createElement('div')
        );
        const newAreaDetails = new Map();

        if (user?.preferredLocations) {
          for (const placeId of user.preferredLocations) {
            if (!areaDetails.has(placeId)) {
              try {
                const result = await new Promise((resolve, reject) => {
                  service.getDetails(
                    {
                      placeId: placeId,
                      fields: [
                        'name',
                        'address_components',
                        'formatted_address',
                      ],
                    },
                    (result, status) => {
                      if (
                        status === google.maps.places.PlacesServiceStatus.OK
                      ) {
                        resolve(result);
                      } else {
                        reject(
                          new Error(`Failed to fetch details for ${placeId}`)
                        );
                      }
                    }
                  );
                });

                const components = result.address_components;
                const prefecture = components.find((c) =>
                  c.types.includes('administrative_area_level_1')
                );
                const city = components.find((c) =>
                  c.types.includes('locality')
                );
                const ward = components.find((c) =>
                  c.types.includes('sublocality_level_1')
                );
                const district = components.find((c) =>
                  c.types.includes('sublocality_level_2')
                );

                let areaName = '';
                if (prefecture) areaName += prefecture.long_name;
                if (city && city.long_name !== prefecture?.long_name)
                  areaName += ` ${city.long_name}`;
                if (ward) areaName += ` ${ward.long_name}`;
                if (district) areaName += ` ${district.long_name}`;

                const finalAreaName =
                  areaName.trim() || result.formatted_address;
                newAreaDetails.set(placeId, finalAreaName);

                console.log(`Fetched area name for ${placeId}:`, finalAreaName);
              } catch (error) {
                console.error('Error fetching area detail:', error);
                newAreaDetails.set(placeId, placeId);
              }
            } else {
              newAreaDetails.set(placeId, areaDetails.get(placeId));
            }
          }
          setAreaDetails(newAreaDetails);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (user?.preferredLocations?.length > 0) {
      fetchAllAreaDetails();
    }
  }, [user?.preferredLocations]);

  const handleUpdate = async () => {
    try {
      if (!currentUser?.uid) {
        setError('ユーザー認証に失敗しました');
        return;
      }

      const updateData = {
        username,
        gender,
        birthDate: birthDate ? birthDate.toISOString() : null,
        alcoholStrength,
        availableTimes,
        preferredLocations,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'users', currentUser.uid), updateData);

      setUser((prev) => ({ ...prev, ...updateData }));
      setEditMode(false);
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError('更新中にエラーが発生しました');
      console.error('更新エラー:', err);
    }
  };

  const handleDeleteLocation = (placeIdToDelete) => {
    const newLocations = preferredLocations.filter(
      (id) => id !== placeIdToDelete
    );
    setPreferredLocations(newLocations);

    // areaDetailsからも削除（オプション）
    const newAreaDetails = new Map(areaDetails);
    newAreaDetails.delete(placeIdToDelete);
    setAreaDetails(newAreaDetails);
  };

  const formatAreaName = (areaName) => {
    if (!areaName) return '';
    const parts = areaName
      .split(' ')
      .filter((part, index, array) => array.indexOf(part) === index);
    return parts.join(' ');
  };

  const handlePlaceSearch = async (input) => {
    try {
      const google = await loader.load();
      const service = new google.maps.places.AutocompleteService();

      if (!input) {
        setSearchResults([]);
        return;
      }

      const request = {
        input,
        componentRestrictions: { country: 'jp' },
        types: ['(regions)'],
      };

      service.getPlacePredictions(request, (predictions, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSearchResults(predictions);
        }
      });
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  const handleLocationChange = (event) => {
    const selectedPlaceIds = event.target.value;
    setPreferredLocations(selectedPlaceIds);

    selectedPlaceIds.forEach(async (placeId) => {
      if (!areaDetails.has(placeId)) {
        try {
          const google = await loader.load();
          const service = new google.maps.places.PlacesService(
            document.createElement('div')
          );

          const result = await new Promise((resolve, reject) => {
            service.getDetails(
              {
                placeId: placeId,
                fields: ['name', 'address_components', 'formatted_address'],
              },
              (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  resolve(result);
                } else {
                  reject(new Error('Failed to fetch place details'));
                }
              }
            );
          });

          const components = result.address_components;
          const prefecture = components.find((c) =>
            c.types.includes('administrative_area_level_1')
          );
          const city = components.find((c) => c.types.includes('locality'));
          const ward = components.find((c) =>
            c.types.includes('sublocality_level_1')
          );
          const district = components.find((c) =>
            c.types.includes('sublocality_level_2')
          );

          let areaName = '';
          if (prefecture) areaName += prefecture.long_name;
          if (city && city.long_name !== prefecture?.long_name)
            areaName += ` ${city.long_name}`;
          if (ward) areaName += ` ${ward.long_name}`;
          if (district) areaName += ` ${district.long_name}`;

          const finalAreaName = areaName.trim() || result.formatted_address;
          setAreaDetails((prev) => new Map(prev).set(placeId, finalAreaName));
        } catch (error) {
          console.error('Error fetching area detail:', error);
        }
      }
    });
  };

  const locationSelect = (
    <FormControl fullWidth>
      <StyledSelect
        multiple
        value={preferredLocations}
        onChange={handleLocationChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, m: -0.5 }}>
            {selected.map((value) => (
              <StyledChip
                key={value}
                label={areaDetails.get(value) || '読み込み中...'}
                onDelete={() => handleDeleteLocation(value)}
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    color: '#FFA500',
                    '&:hover': {
                      color: '#FF8C00',
                    },
                  },
                }}
              />
            ))}
          </Box>
        )}
      >
        {isLoadingLocation ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ color: '#FFA500' }} />
          </Box>
        ) : locationError ? (
          <MenuItem disabled>
            <Typography color="error">{locationError}</Typography>
          </MenuItem>
        ) : (
          nearbyAreas.map((area) => (
            <StyledMenuItem key={area.value} value={area.value}>
              {area.label}
            </StyledMenuItem>
          ))
        )}
      </StyledSelect>
    </FormControl>
  );

  const getNearbyAreas = async () => {
    try {
      setIsLoadingLocation(true);
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

      const userLatLng = new google.maps.LatLng(userCoords.lat, userCoords.lng);
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
      }
    } catch (error) {
      console.error('位置情報の取得に失敗:', error);
      setLocationError(error.message || '位置情報の取得に失敗しました。');
      setNearbyAreas([]);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (editMode) {
      getNearbyAreas();
    }
  }, [editMode]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={profileStyles.container}>
        <Paper sx={profileStyles.profileCard}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton
              variant="circular"
              width={120}
              height={120}
              sx={{ mx: 'auto' }}
            />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={profileStyles.container}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 4,
        pb: 10, // ナビゲーションバーの高さ分の余白を追加
        minHeight: '100vh', // 最小高さを画面の高さに設定
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Fade in={true} timeout={800}>
        <ProfileCard>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Avatar
                src={user.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 4px 16px rgba(255, 165, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    border: '4px solid rgba(255, 215, 0, 0.5)',
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={() => setEditMode(!editMode)}
                sx={{
                  position: 'absolute',
                  right: -16,
                  top: -16,
                  backgroundColor: '#FFD700',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)',
                  '&:hover': {
                    backgroundColor: '#FFA500',
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {editMode ? <CloseIcon /> : <EditIcon />}
              </IconButton>
              {!editMode && (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      mt: 2,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 4px rgba(255, 165, 0, 0.2)',
                    }}
                  >
                    {user.username || user.userId}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: 'text.secondary',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    ID: {user.userId}
                  </Typography>
                </>
              )}
            </Box>

            {editMode ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  sx={profileStyles.textField}
                />

                <FormControl sx={profileStyles.formControl}>
                  <InputLabel>性別</InputLabel>
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="性別"
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <DatePicker
                  label="生年月日"
                  value={birthDate}
                  onChange={(newValue) => setBirthDate(newValue)}
                  sx={profileStyles.datePickerStyle}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />

                <Box sx={profileStyles.formSection}>
                  <Box
                    sx={{
                      ...profileStyles.sectionHeader,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <LocalBarIcon
                      sx={{
                        ...profileStyles.sectionIcon,
                        color: '#FFA500',
                        fontSize: '2rem',
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={profileStyles.sectionTitle}>
                        お酒の強さ
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        あなたのお酒の強さを選んでください
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                      mt: 3,
                      gap: 3,
                    }}
                  >
                    {drinkingLevelMarks.map((mark, index) => (
                      <motion.div
                        key={mark.value}
                        animate={{
                          scale:
                            getActiveLevel(
                              getSliderValueFromStrength(alcoholStrength)
                            ) === index
                              ? 1.1
                              : 1,
                          opacity:
                            getActiveLevel(
                              getSliderValueFromStrength(alcoholStrength)
                            ) === index
                              ? 1
                              : 0.7,
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          padding: '0 8px',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            mb: 1,
                          }}
                        >
                          {React.cloneElement(mark.icon, {
                            sx: {
                              fontSize: '2.2rem',
                              color:
                                getActiveLevel(
                                  getSliderValueFromStrength(alcoholStrength)
                                ) === index
                                  ? '#FFD700'
                                  : '#DAA520',
                            },
                          })}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: 'text.primary',
                            textAlign: 'center',
                            mb: 1,
                            lineHeight: 1.4,
                          }}
                        >
                          {mark.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.85rem',
                            color: 'text.secondary',
                            textAlign: 'center',
                            lineHeight: 1.4,
                            maxWidth: '120px',
                          }}
                        >
                          {mark.description}
                        </Typography>
                      </motion.div>
                    ))}
                  </Box>

                  <Slider
                    value={getSliderValueFromStrength(alcoholStrength)}
                    onChange={(e, value) => {
                      const strengthMap = {
                        0: 'weak',
                        50: 'medium',
                        100: 'strong',
                      };
                      setAlcoholStrength(strengthMap[value]);
                    }}
                    step={null}
                    marks={drinkingLevelMarks}
                    sx={{
                      mt: 2,
                      '& .MuiSlider-track': {
                        background:
                          'linear-gradient(to right, #FFD700, #FFA500)',
                        border: 'none',
                      },
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#FFD700',
                        width: 20,
                        height: 20,
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(255, 215, 0, 0.16)',
                        },
                        '&::before': {
                          display: 'none',
                        },
                        '&:hover, &.Mui-focusVisible, &.Mui-active': {
                          boxShadow: '0 0 0 8px rgba(255, 215, 0, 0.16)',
                          outline: 'none',
                        },
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        height: 6,
                        opacity: 1,
                      },
                      '& .MuiSlider-mark': {
                        display: 'none',
                      },
                      '& .MuiSlider-valueLabel': {
                        display: 'none',
                      },
                      '&.Mui-focused, &:hover': {
                        '& .MuiSlider-track': {
                          border: 'none',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={profileStyles.formSection}>
                  <Box
                    sx={{
                      ...profileStyles.sectionHeader,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <AccessTimeIcon
                      sx={{
                        ...profileStyles.sectionIcon,
                        color: '#FFA500',
                        fontSize: '2rem',
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={profileStyles.sectionTitle}>
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
                                  availableTimes.filter(
                                    (time) => time !== value
                                  )
                                );
                              }}
                              onMouseDown={(event) => {
                                event.stopPropagation();
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

                <Box sx={profileStyles.formSection}>
                  <Box
                    sx={{
                      ...profileStyles.sectionHeader,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        ...profileStyles.sectionIcon,
                        color: '#FFA500',
                        fontSize: '2rem',
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={profileStyles.sectionTitle}>
                        好きな場所
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        複数選択可能です
                      </Typography>
                    </Box>
                  </Box>
                  {locationSelect}
                </Box>

                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    boxShadow: '0 4px 16px rgba(255, 165, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFA500, #FFD700)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 165, 0, 0.4)',
                    },
                  }}
                  startIcon={<CheckIcon />}
                >
                  保存する
                </Button>
              </Box>
            ) : (
              <Box sx={{ width: '100%' }}>
                <InfoCard
                  icon={WcIcon}
                  label="性別"
                  value={
                    genderOptions.find((opt) => opt.value === user.gender)
                      ?.label || '未設定'
                  }
                />

                <InfoCard
                  icon={CakeIcon}
                  label="生年月日"
                  value={
                    birthDate ? birthDate.format('YYYY年MM月DD日') : '未設定'
                  }
                />

                <InfoCard
                  icon={LocalBarIcon}
                  label="お酒の強さ"
                  value={
                    alcoholStrengthOptions.find(
                      (opt) => opt.value === user.alcoholStrength
                    )?.label || '未設定'
                  }
                />

                <InfoCard
                  icon={AccessTimeIcon}
                  label="参加可能な時間帯"
                  value={
                    availableTimes.length > 0
                      ? availableTimes
                          .map(
                            (value) =>
                              timeSlots.find((slot) => slot.value === value)
                                ?.label
                          )
                          .join(', ')
                      : '未設定'
                  }
                />

                <Box sx={profileStyles.formSection}>
                  <Box
                    sx={{
                      ...profileStyles.sectionHeader,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        ...profileStyles.sectionIcon,
                        color: '#FFA500',
                        fontSize: '2rem',
                      }}
                    />
                    <Typography variant="h6" sx={profileStyles.sectionTitle}>
                      希望する場所
                    </Typography>
                  </Box>
                  <LocationList>
                    {preferredLocations.length > 0 ? (
                      preferredLocations.map((placeId) => (
                        <LocationItem key={placeId}>
                          <Typography
                            sx={{
                              color: 'text.primary',
                              fontSize: '0.95rem',
                              fontWeight: 500,
                            }}
                          >
                            {formatAreaName(areaDetails.get(placeId)) ||
                              placeId}
                          </Typography>
                        </LocationItem>
                      ))
                    ) : (
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          padding: '8px 16px',
                        }}
                      >
                        希望する場所が設定されていません
                      </Typography>
                    )}
                  </LocationList>
                </Box>
              </Box>
            )}

            {updateSuccess && (
              <Alert
                severity="success"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#000',
                }}
              >
                プロフィールを更新しました
              </Alert>
            )}
          </Box>
        </ProfileCard>
      </Fade>
      {/* スクロール時にナビゲーションバーと重ならな���ようにするためのスペーサー */}
      <Box sx={{ height: '60px' }} />
    </Container>
  );
};

export default ProfilePage;
