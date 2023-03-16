import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { commmunityState } from '../atoms/communitiesAtom';
import { Post, postState, PostVote } from '../atoms/postsAtom';
import { auth, firestore, storage } from '../firebase/clientApp';

const usePosts = () => {
    const [user] = useAuthState(auth)
    const [postStateValue, setPostStateValue] = useRecoilState(postState)
    const currentCommunity = useRecoilValue(commmunityState).currentCommunity
    const setAuthModalState = useSetRecoilState(authModalState)

    const onVote = async (post: Post, vote: number, communityId: string) => {

        // check if user => if not, open auth modal
        if (!user?.uid) {
            setAuthModalState({ open: true, view: "login" })
            return
        }

        try {

            const { voteStatus } = post;
            const existingVote = postStateValue.postVotes.find(vote => vote.postId === post.id)

            const batch = writeBatch(firestore)
            const updatedPost = { ...post }
            const updatedPosts = [...postStateValue.posts]
            let updatedPostVotes = [...postStateValue.postVotes]
            let voteChange = vote


            // New vote
            if (!existingVote) {
                // create a new postVote document
                const postVoteRef = doc(collection(firestore, "users", `${user?.uid}/postVotes`))

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote // 1 or -1
                }

                batch.set(postVoteRef, newVote)

                // add or subtract 1 to/from post.voteStatus
                updatedPost.voteStatus = voteStatus + vote
                updatedPostVotes = [...updatedPostVotes, newVote]


                // existing vote - user has voted on the post before 
            } else {
                const postVoteRef = doc(firestore, "users", `${user?.uid}/postVotes/${existingVote.id}`)

                // User removing their vote (up => neutral or down=> neutral)
                if (existingVote.voteValue === vote) {
                    // add or subtract 1 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus - vote
                    updatedPostVotes = updatedPostVotes.filter(vote => vote.id !== existingVote.id)

                    // delete the postVote document
                    batch.delete(postVoteRef)

                    voteChange *= -1
                } else {// Flipping their vote (up => down or down => up)
                    // add or subtract 2 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus + 2 * vote;

                    const voteIndex = postStateValue.postVotes.findIndex(vote => vote.id === existingVote.id)

                    updatedPostVotes[voteIndex] = {
                        ...existingVote,
                        voteValue: vote
                    }

                    // updating the existing postVote document
                    batch.update(postVoteRef, {
                        voteValue: vote
                    })

                    voteChange = 2 * vote
                }
            }

            // update our post document
            const postRef = doc(firestore, "posts", post.id!)
            batch.update(postRef, { voteStatus: voteStatus + voteChange })

            await batch.commit()

            // update state with updated values
            const postIdx = postStateValue.posts.findIndex(item => item.id === post.id)
            updatedPosts[postIdx] = updatedPost

            setPostStateValue(prev => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes
            }))

        } catch (error: any) {
            console.log("onVote error: ", error.message)
        }
    }

    const onSelectPost = () => {

    }

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            // Check if there is a image, delete if exist
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`)
                await deleteObject(imageRef)
            }
            // Delete post document from firestore
            const postDocRef = doc(firestore, "posts", post.id)
            await deleteDoc(postDocRef)

            // Update recoil state
            setPostStateValue(prev => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id)
            }))
            return true;
        } catch (error) {

            return false;
        }

    }

    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, "users", `${user?.uid}/postVotes`),
            where("communityId", "==", communityId)
        )
        const postVoteDocs = await getDocs(postVotesQuery)

        const postVotes = postVoteDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        setPostStateValue(prev => ({
            ...prev,
            postVotes: postVotes as PostVote[]
        }))
    }

    useEffect(() => {
        if (!user || !currentCommunity?.id) {
            return
        }
        getCommunityPostVotes(currentCommunity?.id)
    }, [user, currentCommunity])

    useEffect(() => {
        // clear user post votes for no user
        if (!user) {
            setPostStateValue(prev => ({
                ...prev,
                postVotes: []
            }))
        }
    }, [user])

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost
    }
}
export default usePosts;