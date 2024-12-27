import React from 'react'
import './Loading.css'
import { Center } from '@chakra-ui/react'
const Loading = () => {
    return (
        <Center minH="80vh">
            <div class="loader">
                <div class="cell d-0"></div>
                <div class="cell d-1"></div>
                <div class="cell d-2"></div>

                <div class="cell d-1"></div>
                <div class="cell d-2"></div>


                <div class="cell d-2"></div>
                <div class="cell d-3"></div>


                <div class="cell d-3"></div>
                <div class="cell d-4"></div>
            </div>
        </Center>
    )
}

export default Loading