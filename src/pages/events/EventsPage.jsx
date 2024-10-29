import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

// イベントデータ
const events = [
  {
    title: '友達との飲み会',
    date: '2024年11月5日',
    time: '19:00',
    location: '居酒屋 魚介亭',
    description: '友達と楽しく飲みましょう！',
  },
  {
    title: '同僚との飲み会',
    date: '2024年11月12日',
    time: '18:30',
    location: '焼肉店 炭火焼',
    description: '仕事の後にリフレッシュ！',
  },
  {
    title: '家族の集まり',
    date: '2024年11月20日',
    time: '17:00',
    location: '自宅',
    description: '家族みんなで楽しい時を過ごします。',
  },
];

// カスタムスタイルの定義
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
  },
  backgroundColor: '#fff',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(45deg, #ffeb3b 30%, #ffc107 90%)',
  color: '#000',
  padding: '12px 24px',
  minWidth: '140px',
  boxShadow: '0 3px 5px 2px rgba(255, 193, 7, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #ffc107 30%, #ffeb3b 90%)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  borderColor: '#ffc107',
  color: '#856404',
  borderRadius: '20px',
  padding: '10px 20px',
  minWidth: '120px',
  '&:hover': {
    borderColor: '#ffeb3b',
    backgroundColor: '#ffeb3b',
    color: '#000',
  },
}));

const EventsPage = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4, position: 'relative', overflow: 'hidden' }}
    >
      <Box
        sx={{
          textAlign: 'center',
          mb: 6,
          mt: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 700,
            color: '#333',
            mb: 2,
            '& span': {
              background: 'linear-gradient(transparent 60%, #FFE4B5 60%)',
            },
          }}
        >
          <span>みんなの飲み会</span>
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            🍻 開催予定のイベント
          </Typography>
          <Box
            sx={{
              backgroundColor: '#FFF0F5',
              px: 2,
              py: 0.5,
              borderRadius: '12px',
              border: '1px solid #FFB6C1',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#FF69B4',
                fontWeight: 600,
              }}
            >
              {events.length}件
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#888',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          気になる飲み会を見つけてみましょう ✨
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {events.map((event, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#856404',
                    mb: 1,
                  }}
                >
                  {event.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#856404',
                    mb: 2,
                  }}
                >
                  {event.date} {event.time} at {event.location}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#856404',
                    mb: 2,
                  }}
                >
                  {event.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    py: 2,
                  }}
                >
                  <GradientButton
                    variant="contained"
                    startIcon={<EventIcon />}
                    sx={{ mr: 2 }}
                  >
                    詳細を見る
                  </GradientButton>
                  <OutlinedButton
                    variant="outlined"
                    startIcon={<LocationOnIcon />}
                    sx={{ mr: 2 }}
                  >
                    地図を見る
                  </OutlinedButton>
                  <OutlinedButton
                    variant="outlined"
                    startIcon={<AccessTimeIcon />}
                    sx={{ mr: 2 }}
                  >
                    時刻を見る
                  </OutlinedButton>
                  <OutlinedButton
                    variant="outlined"
                    startIcon={<GroupAddIcon />}
                    sx={{ mr: 2 }}
                  >
                    参加する
                  </OutlinedButton>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default EventsPage;
