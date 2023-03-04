import React from 'react';
import { useRecoilState } from 'recoil';
import { commmunityState, Community } from '../atoms/communitiesAtom';

const useCommunityData = () => {
    const [communityStateValue, setCommunityStateValue] = useRecoilState(commmunityState)

    const onJoiOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        // is user signed in?
        // if not => open auth modal

        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        joinCommunity(communityData)
    }

    const joinCommunity = (communityData: Community) => { }

    const leaveCommunity = (communityId: string) => { }


    return {
        // data and functions

        communityStateValue,
        onJoiOrLeaveCommunity
    }
}
export default useCommunityData;