import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Chip,
  Stack,
  Typography 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StyledPaper, StyledTextField, StyledButton } from '../../styles/chatlistpageStyles';

const GroupForm = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [members, setMembers] = useState([]);

  const handleAddMember = () => {
    if (memberId.trim() && !members.includes(memberId.trim())) {
      setMembers([...members, memberId.trim()]);
      setMemberId('');
    }
  };

  const handleRemoveMember = (memberToRemove) => {
    setMembers(members.filter(member => member !== memberToRemove));
  };

  const handleCreateGroup = async () => {
    try {
      // グループ作成処理
      // 成功したらグループ一覧にリダイレクト
      navigate('/chatlist');
    } catch (error) {
      console.error('グループ作成エラー:', error);
    }
  };

  return (
    <StyledPaper>
      <Stack spacing={3}>
        <TextField
          label="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
        />
        
        <Box>
          <TextField
            label="メンバーのユーザーID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMember();
              }
            }}
          />
          <Button 
            onClick={handleAddMember}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            メンバーを追加
          </Button>
        </Box>

        {members.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              追加されたメンバー:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {members.map((member) => (
                <Chip
                  key={member}
                  label={member}
                  onDelete={() => handleRemoveMember(member)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <StyledButton 
          variant="contained"
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || members.length === 0}
        >
          グループを作成
        </StyledButton>
      </Stack>
    </StyledPaper>
  );
};

export default GroupForm;