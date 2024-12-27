import { Box, Button, Flex, HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';



const DetailsBox = ({ color, icon, title, dataKey, number, percentage, chartData, link, total }) => {

    const bgColor = useColorModeValue("white", "gray.600");

    return (
        <Box
            bg={bgColor}
            borderRadius="lg"
            shadow="md"
            p={4}
            minH="150px"
            w="100%"
        >
            <Flex
                w="100%"
                h="100%"
            >
                <Flex
                    direction="column"
                    justify="space-between"
                    align="start"
                    flex={2}

                >
                    <HStack align="center" gap={0.5}>
                        <Icon fontSize="xl" color={color} as={icon} />
                        <Text
                            fontWeight="semibold"
                        // fontSize="lg"
                        >
                            {title}
                        </Text>
                    </HStack>
                    <Text
                        fontWeight="black"
                        fontSize="lg"
                    >
                        {total}
                    </Text>
                    <Button
                        as={Link}
                        to={link}
                        variant="link"
                    >
                        View All
                    </Button>
                </Flex>
                <Flex
                    direction="column"
                    justify="space-between"
                    align="end"
                    flex={2}
                >
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={chartData}>
                            <Tooltip
                                contentStyle={{ background: "transparent", border: "none" }}
                                labelStyle={{ display: "none" }}
                                position={{ x: 0, y: -20 }}
                            />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Flex>
            </Flex>

        </Box>
    )
}

export default DetailsBox