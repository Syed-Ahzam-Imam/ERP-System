import { EditIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, FormControl, FormLabel, Input, SimpleGrid, Switch } from '@chakra-ui/react';
import React, { useState } from 'react';
import Edit from './Edit';

function View({ data }) {
    const [isEditOpen, setIsEditOpen] = useState(false); // State to manage the edit drawer's open/close

    const handleEditClick = () => {
        setIsEditOpen(true); // Open the edit drawer when the button is clicked
    };


    return (
        <Flex direction="column">
            {isEditOpen ? ( // If isEditOpen is true, render EditPaymentMode
                <Edit data={data} onClose={() => setIsEditOpen(false)} />
            ) : (
                <FormControl >
                    <FormLabel mt={5}>Payment Mode Name:</FormLabel>
                    <Input type="text" value={data.name} isReadOnly />
                    <FormLabel mt={5}>Description:</FormLabel>
                    <Input type="text" value={data.description} isReadOnly />
                    
                    <Button variant="outline" colorScheme='yellow' mt={5} onClick={handleEditClick}>
                        <EditIcon mr={2} />
                        Edit
                    </Button>
                </FormControl>
            )}
        </Flex>
    );

}

export default View;
