import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Grid,
  Button,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  LocalBar,
  Schedule,
  Groups,
  Restaurant,
  Celebration,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
  borderRadius: 24,
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(255, 193, 7, 0.2)',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(255, 193, 7, 0.2)',
  },
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
}));

const EventCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 12,
}));

const HomePage = () => {
  // サンプルの近日開催予定の飲み会データ
  const upcomingEvents = [
    {
      title: '🍻 週末懇親会',
      date: '4/20(土) 19:00',
      location: '渋谷 居酒屋わいわい',
      participants: 8,
    },
    {
      title: '🎉 歓迎会',
      date: '4/25(木) 18:30',
      location: '新宿 個室酒場',
      participants: 15,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box py={8}>
        {/* ヒーローセクション */}
        <StyledPaper elevation={0}>
          <Box display="flex" alignItems="center" mb={2}>
            <LocalBar sx={{ fontSize: 40, color: '#7B341E' }} />
            <Typography
              variant="h4"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: '#7B341E',
                ml: 2,
              }}
            >
              のみっと！
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#7B341E',
              mb: 2,
            }}
          >
            飲み会の調整、もっと簡単に。
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            日程調整から店舗予約まで、面倒な作業を全部おまかせ！
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Celebration />}
            sx={{
              backgroundColor: '#7B341E',
              '&:hover': {
                backgroundColor: '#93402B',
              },
              borderRadius: 8,
              px: 4,
              py: 1.5,
            }}
          >
            飲み会を企画する
          </Button>
        </StyledPaper>

        {/* 近日開催予定セクション */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            color: '#7B341E',
          }}
        >
          近日開催予定の飲み会 🎊
        </Typography>
        {upcomingEvents.map((event, index) => (
          <EventCard key={index}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {event.title}
                </Typography>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}
                >
                  <Chip
                    icon={<Schedule />}
                    label={event.date}
                    size="small"
                    sx={{ backgroundColor: '#FFF3CD' }}
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={event.location}
                    size="small"
                    sx={{ backgroundColor: '#FFF3CD' }}
                  />
                  <Chip
                    icon={<Groups />}
                    label={`${event.participants}人参加`}
                    size="small"
                    sx={{ backgroundColor: '#FFF3CD' }}
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#7B341E',
                  color: '#7B341E',
                  '&:hover': {
                    borderColor: '#93402B',
                    backgroundColor: 'rgba(123, 52, 30, 0.04)',
                  },
                }}
              >
                詳細を見る
              </Button>
            </Box>
          </EventCard>
        ))}

        {/* 特徴セクション */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            {
              icon: <Schedule sx={{ fontSize: 40, color: '#7B341E' }} />,
              title: 'かんたん日程調整',
              description: 'アプリが最適な日程を提案。面倒な調整をスムーズに。',
            },
            {
              icon: <Restaurant sx={{ fontSize: 40, color: '#7B341E' }} />,
              title: 'お店も自動提案',
              description: '予算や人数に合わせて、最適なお店を提案します。',
            },
            {
              icon: <Groups sx={{ fontSize: 40, color: '#7B341E' }} />,
              title: 'グループ管理',
              description: '部署やサークルごとに、メンバーを簡単管理。',
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureCard>
                <Box sx={{ textAlign: 'center', mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#7B341E',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
