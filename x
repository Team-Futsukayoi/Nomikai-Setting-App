[1mdiff --git a/src/pages/chats/GroupList.jsx b/src/pages/chats/GroupList.jsx[m
[1mindex 669d4ac..14666a2 100644[m
[1m--- a/src/pages/chats/GroupList.jsx[m
[1m+++ b/src/pages/chats/GroupList.jsx[m
[36m@@ -56,7 +56,7 @@[m [mconst GroupList = ({ groupList }) => {[m
                 <AvatarGroup max={3} sx={{ mr: 2 }}>[m
                   {group.members.map((member, index) => ([m
                     <Avatar[m
[31m-                      key={member.uid}[m
[32m+[m[32m                      key={`${group.id}_${member.uid}_${index}`}[m
                       alt={member.username}[m
                       sx={{[m
                         width: 36,[m
[36m@@ -128,7 +128,7 @@[m [mconst GroupList = ({ groupList }) => {[m
       ) : ([m
         <Typography>グループがありません</Typography>[m
       )}[m
[31m-    </List>[m
[32m+[m[32m`    </List>[m
   );[m
     </StyledPaper>[m
   );[m
