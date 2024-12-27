import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, useColorModeValue, Spinner, Center } from '@chakra-ui/react';
import { fetchInventoryItems } from '../../api/inventoryAPI';
import PurchasingList from './component/PurchasingList';

const Purchasing = ({ sideBarWidth }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  // useEffect(() => {
  //   // Fetch data from the API endpoint using the fetchInventoryItems function
  //   const fetchData = async () => {
  //     try {
  //       const data = await fetchInventoryItems();
  //       setInventoryItems(data.inventoryItems); // Set the fetched data to state
  //       
  //       setIsLoading(false); // Set loading status to false after data is fetched
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setIsLoading(false); // Set loading status to false in case of an error
  //     }
  //   };

  //   fetchData(); // Call the fetchData function when the component mounts
  // }, []); // The empty dependency array ensures this effect runs once after the initial render

  // const handleAddUpdateDeleteItem = async () => {
  //   try {
  //     const data = await fetchInventoryItems();
  //     setInventoryItems(data.inventoryItems); // Set the fetched data to state
  //     setIsLoading(false); // Set loading status to false after data is fetched
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setIsLoading(false); // Set loading status to false in case of an error
  //   }
  // };
  return (
    <>
      {/* {isLoading && <Center>
        <Spinner
          m={200}
          thickness='4px'
          speed='0.65s'
          emptyColor='gray.200'
          color='blue.500'
          size='xl'
        />
      </Center>}  */}
      {/* {!isLoading && ( */}
      <Box bg={bgColor} py={8} w="auto" minH="100vh">
        <Container maxW="container.xxl" justifySelf="center">
          <Box
            ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
            transition="margin 0.3s ease-in-out"
          >
            <Heading pb={2}>Purchasing</Heading>
            {/* Render the Purchasing component with fetched data */}
            <PurchasingList /*inventoryItems={inventoryItems} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}*/ />
          </Box>
        </Container>
      </Box>
      {/* )} */}
    </>
  );
};

export default Purchasing;
