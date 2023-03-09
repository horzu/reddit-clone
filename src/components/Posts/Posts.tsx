import { Community } from '@/src/atoms/communitiesAtom';
import { Post } from '@/src/atoms/postsAtom';
import { firestore } from '@/src/firebase/clientApp';
import usePosts from '@/src/hooks/usePosts';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type PostsProps = {
    communityData: Community;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
    // useAuthState
    const [loading, setLoading] = useState(false)
    const { postStateValue, setPostStateValue, } = usePosts();

    const getPost = async () => {
        try {
            // get posts for this community
            const postQuery = query(collection(firestore, "posts"), where("communityId", "==", communityData.id), orderBy("createdAt", "desc"))
            const postDocs = await getDocs(postQuery)

            // store in post state
            const posts = postDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }))


            console.log("posts: ", posts)
        } catch (error: any) {
            console.log("getPosts error ", error.message)
        }
    }

    useEffect(() => {
        getPost();
    }, [])

    return <div>Posts</div>
}
export default Posts;