import { Box, Button, Flex, HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const StackedChart = ({ icon, title, percentage, link, dataKey1, dataKey, dataKey2, chartData }) => {
    const bgColor = useColorModeValue("white", "gray.600");
    const bgColorChild = useColorModeValue("white", "#929292");
    const textColor = useColorModeValue("black", "white");


    return (
        <Box
            bg={bgColor}
            borderRadius="lg"
            shadow="md"
            p={4}
            minH="150px"
            w="100%"
        >
            <Flex justify="space-between">
                <HStack >
                    <Icon as={icon}/>
                    <Text
                        fontWeight="bold"
                        fontSize={{ base: "lg", md: "xl", lg: "3xl" }}
                        textAlign="start"
                    >
                        {title}
                    </Text>
                </HStack>
                <Flex
                    direction="column"
                    flex={{ base: 2, md: 1 }}
                    justify="space-between"
                    align="end"
                >
                    <Box>
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color={percentage > 0 ? "limegreen" : "red"}
                            textAlign="end"
                        >
                            {percentage}%
                        </Text>
                        <HStack>
                            {percentage > 0 ?
                                <FaArrowUp color='limegreen' /> : <FaArrowDown color='red' />
                            }
                            <Text
                                fontWeight="hairline"
                                fontSize="sm"
                            >
                                this month
                            </Text>
                        </HStack>
                    </Box>
                    <Button
                        as={Link}
                        to={link}
                        variant="link"
                    >
                        View All
                    </Button>
                </Flex>
            </Flex>
            <ResponsiveContainer width="99%" height={300}>
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <XAxis
                        dataKey={dataKey}
                        tick={{ fontSize: 12, fill: textColor }}
                    />
                    <YAxis
                        style={{ fontSize: 12 }}
                        axisLine={{ stroke: textColor }}
                        tick={{ fill: textColor }}
                    />
                    <Tooltip
                        contentStyle={{ background: bgColorChild, fontWeight: "bold", color: textColor, borderRadius: "5px" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey={dataKey1} stackId="1" stroke="#7AFF71" fill="#7AFF71" />
                    <Area type="monotone" dataKey={dataKey2} stackId="1" stroke="#FF7171" fill="#FF7171" />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    )
}

export default StackedChart