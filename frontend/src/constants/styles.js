import { useColorModeValue } from "@chakra-ui/react";

export function useCustomColorModeValues() {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return { bgColor, borderColor };
}
