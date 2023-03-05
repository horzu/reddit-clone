import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import { commmunityState, Community, CommunitySnippet } from '../atoms/communitiesAtom';
import { auth, firestore } from '../firebase/clientApp';

const useCommunityData = () => {
    const [user] = useAuthState(auth)
    const [communityStateValue, setCommunityStateValue] = useRecoilState(commmunityState)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const onJoiOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        // is user signed in?
        // if not => open auth modal

        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        joinCommunity(communityData)
    }

    const getMySnippets = async () => {
        setLoading(true);
        try {
            //get user snippets
            const snippetDocs = await getDocs(collection(firestore, `users/${user?.uid}/communitySnippets`));

            const snippets = snippetDocs.docs.map(doc => ({ ...doc.data() }))
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[]
            }))
        } catch (error) {
            console.log("getMySnippets error", error)
        }
        setLoading(false)
    }

    const joinCommunity = (communityData: Community) => { }

    const leaveCommunity = (communityId: string) => { }

    useEffect(() => {
        if (!user) return;
        getMySnippets();
    }, [user])
    return {
        // data and functions

        communityStateValue,
        onJoiOrLeaveCommunity,
        loading
    }
}
export default useCommunityData;