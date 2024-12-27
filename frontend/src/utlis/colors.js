import { border, useColorModeValue } from "@chakra-ui/react"

export const useBgColor = () => {
    const bgColor = useColorModeValue("gray.100", "gray.700")
    return bgColor;
}

export const useBgColorChild = () => {
    const bgColorChild = useColorModeValue("gray.400", "gray.600");
    return bgColorChild;
}

export const useTextColor = () => {
    const textColor = useColorModeValue("black", "white");
    return textColor;
}

export const useBorderColor = () => {
    const borderColor = useColorModeValue("gray.200", "gray.600");
    return borderColor;
}

export const useTextStyles = () => {
    const textStyles = {
        border: "1px solid grey",
        backgroundColor: "transparent",
        width: "100%",
        padding: "0.5rem",
        borderRadius: "0.5rem",
    };
    return textStyles;
}
