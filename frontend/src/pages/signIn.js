import React, { useState } from "react";
// import CryptoJS from "crypto-js";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  Image,
  InputRightElement,
  IconButton,
  InputGroup,
  useToast,
  useColorMode,
} from "@chakra-ui/react";

import signInImage from "../images/signInImage.png";
import logoWhite from "../images/InventoryLogoWhite.png";
import logoBlack from "../images/InventoryLogoBlack.png";
// import LogoBlack from "../../images/FourSeasonLogoBlack.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import GradientBorder from "./GradientBorder";
import { signIn } from "../api/signinAPI";
// import { loginUser } from "../../API/api";

function SignIn() {
  const titleColor = useColorModeValue("black", "white");
  const textColor = useColorModeValue("black", "white");
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setButtonLoading] = useState(false);
  //   const secretKey = "sT#9yX^pQ&$mK!2wF@8zL7vA";
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const { colorMode } = useColorMode();
  const logo = colorMode === "light" ? logoBlack : logoWhite;
  const toast = useToast();
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (email === "" || password === "") {
        toast({
          title: "Please Enter Email and Password",
          // description:""
          status: "info",
          position: "top-right",
          duration: 3000,
          isClosable: true
        })
      }
      else {
        setButtonLoading(true);
        const response = await signIn(email, password);

        // Check the response and handle authentication success or failure
        if (response.success === true) {
          const user = response.branch
          // Authentication was successful
          localStorage.setItem("branchId", user.branchId);
          localStorage.setItem("contactPerson", user.contactPerson);
          localStorage.setItem("branchName", user.branchName);
          localStorage.setItem("email", user.email);
          localStorage.setItem("phoneNumber", user.branchPhoneNumber);
          localStorage.setItem("role", user.role);
          localStorage.setItem("address", user.branchLocation);
          localStorage.setItem("authToken", response.authToken);
          localStorage.setItem("logo", response.logo);
          localStorage.setItem("isUserLoggedIn", "true");
          // Redirect or perform other actions
          window.location.href = "/";
        } else {
          // Handle authentication failure (show error messages, etc.)
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        toast({
          title: "Error",
          description: error.response.data.error,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      else {
        toast({
          title: "Error",
          description: "sign-in Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        // Handle network errors or other exceptions
        console.error("Sign-in error:", error);
      }

      // Show error messages or handle the error as needed
    } finally {
      setButtonLoading(false);
    }
  };
  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Trigger the sign-in button click
    if (!btnLoading) {
      // Only trigger the click if the button is not in a loading state
      document.getElementById("sign-in-button").click();
    }
  };


  return (
    <Flex position="relative" bg={bgColor}>
      <Flex
        minH="max-content"
        h={{ base: "120vh", lg: "fit-content" }}
        w="100%"
        maxW="1044px"
        mx="auto"
        pt={{ sm: "100px", md: "0px" }}
        flexDirection="column"
        me={{ base: "auto", lg: "50px", xl: "auto" }}
      >
        <Flex
          alignItems="center"
          justifyContent="start"
          style={{ userSelect: "none" }}
          mx={{ base: "auto", lg: "unset" }}
          ms={{ base: "auto", lg: "auto" }}
          w={{ base: "100%", md: "50%", lg: "450px" }}
          px="50px"
        >
          <Flex
            direction="column"
            w="100%"
            background="transparent"
            mt={{ base: "25px", md: "25px", lg: "25px", xl: "25px" }}
            mb={{ base: "100px", md: "100px", lg: "100px", xl: "100px" }}
          >
            <form onSubmit={handleFormSubmit}>
              <Image mt={20} mb={15} src={logo} />
              <Heading color={titleColor} fontSize="32px" mb="10px">
                Nice to see you!
              </Heading>
              <Text
                mb="36px"
                ms="4px"
                color={textColor}
                fontWeight="bold"
                fontSize="14px"
              >
                Enter your email and password to sign in
              </Text>
              <FormControl>
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="normal"
                  color={textColor}
                >
                  Email
                </FormLabel>
                <GradientBorder
                  mb="24px"
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius="20px"
                >
                  <Input
                    color={textColor}
                    bg={bgColor}
                    border="transparent"
                    borderRadius="20px"
                    fontSize="sm"
                    size="lg"
                    w={{ base: "100%", md: "346px" }}
                    maxW="100%"
                    h="46px"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </GradientBorder>
              </FormControl>
              <FormControl>
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="normal"
                  color={textColor}
                >
                  Password
                </FormLabel>
                <GradientBorder
                  mb="24px"
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius="20px"
                >
                  <InputGroup>
                    <Input
                      color={textColor}
                      bg={bgColor}
                      border="transparent"
                      borderRadius="20px"
                      fontSize="sm"
                      size="lg"
                      w={{ base: "100%", md: "346px" }}
                      maxW="100%"
                      h="46px"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width="4.5rem">
                      <IconButton
                        size="md"
                        bg={bgColor}
                        onClick={handleTogglePassword}
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      />
                    </InputRightElement>
                  </InputGroup>
                </GradientBorder>
              </FormControl>
              <Button
                id="sign-in-button"
                variant="solid"
                colorScheme="blue"
                fontSize="md"
                type="submit"
                w="100%"
                maxW="350px"
                h="45"
                mb="20px"
                mt="20px"
                onClick={handleSubmit}
                isLoading={btnLoading}
              >
                SIGN IN
              </Button>
            </form>
          </Flex>
        </Flex>
        <Box
          display={{ base: "none", lg: "block" }}
          overflowX="hidden"
          h="100%"
          maxW={{ md: "50vw", lg: "50vw" }}
          minH="100vh"
          w="960px"
          position="absolute"
          left="0px"
        >
          <Box
            bgImage={signInImage}
            w="100%"
            h="100%"
            bgSize="cover"
            bgPosition="50%"
            position="absolute"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Text
              textAlign="center"
              color="transparent"
              letterSpacing="8px"
              fontSize="36px"
              fontWeight="bold"
              bgClip="text !important"
              bg="linear-gradient(94.56deg, #FFFFFF 79.99%, #21242F 102.65%)"
            >
              ERP System
            </Text>
            <Text
              mt={10}
              textAlign="center"
              color="white"
              letterSpacing="8px"
              fontSize="14px"
              fontWeight="500"
              mb={20}
            >
              DESIGNED & DEVELOPED BY{" "}
              <a
                href="https://www.sysartx.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Syed Ahzam Imam
              </a>
            </Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SignIn;
