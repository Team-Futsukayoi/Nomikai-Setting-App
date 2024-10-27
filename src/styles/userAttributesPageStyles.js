const userAttributesPageStyles = {
  container: {
    mt: 2, // 上下のマージンを小さく
    mb: 2,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
  },
  paper: {
    p: 3, // パディングを小さく
    borderRadius: 3,
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
  },
  headerSection: {
    textAlign: 'center',
    mb: 4, // マージンを小さく
  },
  title: {
    fontWeight: 700,
    fontSize: '1.5rem', // フォントサイズを小さく
    color: '#333',
    mb: 0.5,
  },
  subtitle: {
    color: '#555',
    fontWeight: 500,
    fontSize: '0.9rem', // フォントサイズを小さく
  },
  formSection: {
    mb: 4, // マージンを小さく
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    mb: 2, // マージンを小さく
  },
  sectionIcon: {
    color: '#333',
    mr: 0.5, // マージンを小さく
    fontSize: '1.5rem', // フォントサイズを小さく
  },
  sectionTitle: {
    color: '#333',
    fontWeight: 600,
    fontSize: '1rem', // フォントサイズを小さく
  },
  toggleGroup: {
    width: '100%',
    gap: 1, // ギャップを小さく
    '& .MuiToggleButton-root': {
      flex: 1,
    },
  },
  toggleButton: {
    borderRadius: '12px !important',
    border: '2px solid rgba(255, 215, 0, 0.2) !important',
    p: 1, // パディングを小さく
    '&.Mui-selected': {
      backgroundColor: '#FFD700 !important',
      color: '#333',
    },
  },
  toggleIcon: {
    fontSize: '1.5rem', // フォントサイズを小さく
    mb: 0.5,
  },
  toggleText: {
    display: 'block',
    width: '100%',
    fontWeight: 500,
    fontSize: '0.8rem',
    color: '#333',
  },
  dateField: {
    backgroundColor: '#FFF',
    borderRadius: 3,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 215, 0, 0.2)',
      borderWidth: 2,
    },
  },
  drinkingLevelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 3, // マージンを小さく
    mt: 1, // マージンを小さく
  },
  levelIcon: {
    flex: 1,
    textAlign: 'center',
    px: 0.5, // パディングを小さく
  },
  iconWrapper: {
    backgroundColor: '#FFF',
    borderRadius: '50%',
    width: 50, // サイズを小さく
    height: 50, // サイズを小さく
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    mb: 0.5, // マージンを小さく
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.1)',
  },
  drinkIcon: {
    fontSize: '1.5rem', // フォントサイズを小さく
  },
  levelLabel: {
    fontWeight: 600,
    color: '#333',
    mb: 0.3, // マージンを小さく
    fontSize: '0.8rem', // フォントサイズを小さく
  },
  levelDescription: {
    fontSize: '0.7rem', // フォントサイズを小さく
    color: '#555',
  },
  slider: {
    color: '#FFD700',
    '& .MuiSlider-mark': {
      display: 'none',
    },
    '& .MuiSlider-rail': {
      opacity: 0.3,
    },
  },
  submitButton: {
    mt: 3,
    py: 1.5,
    background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)', // グラデーションを修正
    color: '#000',
    fontWeight: 600,
    borderRadius: 3,
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': {
      background: 'linear-gradient(45deg, #FFA500 0%, #FFD700 100%)', // ホバー時の色を修正
    },
  },
};

export default userAttributesPageStyles;
