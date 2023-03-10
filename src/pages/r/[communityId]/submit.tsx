import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import PageContent from '@/src/components/Layout/PageContent';
import NewPostForm from '@/src/components/Posts/NewPostForm';
import { auth } from '@/src/firebase/clientApp';
import { useRecoilValue } from 'recoil';
import { commmunityState } from '@/src/atoms/communitiesAtom';

const SubmitPostPage: React.FC = () => {
    const [user] = useAuthState(auth)
    const setCommunityStateValue = useRecoilValue(commmunityState)
    console.log(setCommunityStateValue)

    return (
        <PageContent>
            <>
                <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
                    <Text>Create a Post</Text>
                </Box>
                {user && <NewPostForm user={user} />}
            </>
            <>
                {/* About  */}
            </>
        </PageContent>
    )
}
export default SubmitPostPage;