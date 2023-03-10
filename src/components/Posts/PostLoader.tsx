import { SkeletonCircle, SkeletonText, Box } from '@chakra-ui/react';
import React from 'react';

type PostLoaderProps = {

};

const PostLoader: React.FC<PostLoaderProps> = () => {

    return (
        <>
            <Box padding='6' boxShadow='lg' bg='white'>
                <SkeletonCircle size='10' />
                <SkeletonText mt='4' noOfLines={6} spacing='4' skeletonHeight='2' />
            </Box>
            <Box padding='6' boxShadow='lg' bg='white'>
                <SkeletonCircle size='10' />
                <SkeletonText mt='4' noOfLines={6} spacing='4' skeletonHeight='2' />
            </Box>

        </>

    )
}
export default PostLoader;