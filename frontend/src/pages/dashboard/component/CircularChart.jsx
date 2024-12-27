import { Box, Button, Flex, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { FcRules } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const CircularChart = ({ icon, title, number, percentage, link, chartData, dataKey }) => {
    const bgColor = useColorModeValue("white", "gray.600");
    const bgColorChild = useColorModeValue("black", "gray.600");

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <Box
            bg={bgColor}
            borderRadius="lg"
            shadow="md"
            p={4}
            minH="150px"
            w="100%"
        >
            <HStack>
                <Icon as={icon} />
                <Text
                    fontWeight="bold"
                    fontSize={{ base: "lg", md: "xl", lg: "3xl" }}
                >
                    {title}
                </Text>
            </HStack>
            <Flex justify="space-between">

                <Flex
                    direction="column"
                    flex={{ base: 2, md: 1 }}
                    justify="space-between"
                    align="start"
                >
                    <Box>
                        <Text
                            fontWeight="semibold"
                            mt={4}
                        >
                            {`Total items: ${number}`}
                        </Text>
                        
                    </Box>
                    <Button
                        as={Link}
                        to={link}
                        variant="link"
                    >
                        View All
                    </Button>
                </Flex>
                <Flex flex={4}>
                    <ResponsiveContainer width="99%" height={300}>
                        <PieChart>
                            <Tooltip
                                contentStyle={{ background: "transparent", border: "none", fontWeight: "bold" }}
                                labelStyle={{ display: "none" }}
                                itemStyle={{ color: bgColorChild }}
                            />
                            <Pie
                                data={chartData}
                                innerRadius="70%"
                                outerRadius="90%"
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey={dataKey}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>

                        </PieChart>
                    </ResponsiveContainer>
                </Flex>
            </Flex>
        </Box>
    )
}

export default CircularChart