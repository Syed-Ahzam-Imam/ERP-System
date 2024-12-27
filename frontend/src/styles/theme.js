import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    blue: {
      500: "#0bc6ff",
    },
  },
  fonts: {
    body: "Nunito, sans-serif",
    heading: "Nunito, sans-serif",
  },
  components: {},
});

export default theme;
