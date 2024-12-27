import React, { useEffect, useState } from 'react'
import { Box, Container, Heading, useColorModeValue, Spinner, Center, SimpleGrid } from '@chakra-ui/react';
import DetailsBox from './component/DetailsBox';
import { inventoryData, productsData, purchaseData, revenueData, salesData } from './component/dummyData';
import { customerData } from './component/dummyData';
import CircularChart from './component/CircularChart';
import StackedChart from './component/StackedChart';
import { fetchChartData } from '../../api/dashboardAPI';
import Loading from '../../components/Loading/Loading';


const Dashboard = ({ sideBarWidth }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchChartData();
        setChartData(data.chartData);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        setLoading(false); // Handle error and set loading to false
      }
    };

    fetchData();
  }, []);

  if (loading) {
    // Display a loading spinner while data is being fetched
    return (
      <Box bg={bgColor} py={8} w="auto" minH="100vh">
        <Loading />
      </Box>
    );
  }
  return (
    <Box bg={bgColor} py={8} w="auto" minH="100vh">
      <Container maxW="container.xxl" justifySelf="center">
        <Box
          ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
          transition="margin 0.3s ease-in-out"
        >
          <Heading pb={2}>Dashboard</Heading>
          {/* Render the Purchasing component with fetched data */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={2}
          >
            <DetailsBox
              icon={purchaseData.icon}
              color={purchaseData.color}
              title={purchaseData.title}
              number={purchaseData.number}
              percentage={purchaseData.percentage}
              link={purchaseData.link}
              dataKey={purchaseData.dataKey}
              chartData={chartData.purchaseChartData.chartData}
              total={chartData.purchaseChartData.totalRows}
            />
            <DetailsBox
              icon={salesData.icon}
              color={salesData.color}
              title={salesData.title}
              number={salesData.number}
              percentage={salesData.percentage}
              link={salesData.link}
              dataKey={salesData.dataKey}
              chartData={chartData.saleChartData.chartData
              }
              total={chartData.saleChartData.totalRows}
            />
            <DetailsBox
              icon={customerData.icon}
              color={customerData.color}
              title={customerData.title}
              number={customerData.number}
              percentage={customerData.percentage}
              link={customerData.link}
              dataKey={customerData.dataKey}
              chartData={chartData.customerChartData.chartData}
              total={chartData.customerChartData.totalRows}
            />
            <DetailsBox
              icon={productsData.icon}
              color={productsData.color}
              title='Total Products'
              number={productsData.number}
              percentage={productsData.percentage}
              link={productsData.link}
              dataKey={productsData.dataKey}
              chartData={productsData.chartData.chartData}
              total={chartData.purchaseChartData.totalRows}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} mt={4}>
            <CircularChart
              icon={inventoryData.icon}
              title={inventoryData.title}
              number={chartData.inventoryChartData.totalRows}
              percentage={inventoryData.percentage}
              link={inventoryData.link}
              dataKey={inventoryData.dataKey}
              chartData={chartData.inventoryChartData.chartData}
            />

            <StackedChart
              icon={revenueData.icon}
              title={revenueData.title}
              percentage={revenueData.percentage}
              link={revenueData.link}
              dataKey={revenueData.dataKey}
              dataKey1={revenueData.dataKey1}
              dataKey2={revenueData.dataKey2}
              chartData={revenueData.chartData}

            />
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  )
}

export default Dashboard