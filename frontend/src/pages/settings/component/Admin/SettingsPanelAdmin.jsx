import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Textarea,
  useColorModeValue,
  useToast,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { branchId } from "../../../../api/constants";
import {
  getSettings,
  uploadLogo,
  uploadStamp,
} from "../../../../api/settingsApi";

const SettingsPanelAdmin = () => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.300", "gray.600");
  const bgColorCard = useColorModeValue("white", "gray.600");

  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };
  const [btnLoading,setBtnLoading]=useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [stampPreview, setStampPreview] = useState(null);
  const [name, setName] = useState();
  const [address, setAddress] = useState();
  const [vatNumber, setVatNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const logoInputRef = useRef(null);
  const stampInputRef = useRef(null);
  const toast = useToast();

  const handleLogoUpload = async (event) => {
    setBtnLoading(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const logoFormData = new FormData();
      logoFormData.append("logo", file);
      logoFormData.append("branchId", branchId);
      try {
        await uploadLogo(logoFormData);
        fetchSettings();
        toast({
          title: "Logo",
          description: "logo updated successfully",
          status: "success",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        // Handle success or error
        setBtnLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ?? "Error uploading logo";

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });

        if (!error.response?.data?.error) {
          console.error("Error uploading logo:", error);
        }
        setBtnLoading(false);
      }
    }
  };

  const handleStampUpload = async (event) => {
    setBtnLoading(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setStampPreview(reader.result);
      };
      reader.readAsDataURL(file);
      const stampFormData = new FormData();
      stampFormData.append("stamp", file);
      stampFormData.append("branchId", branchId);

      try {
        await uploadStamp(stampFormData);
        fetchSettings();
        toast({
          title: "Stamp",
          description: "Stamp added successfully",
          status: "success",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        setBtnLoading(false);
        // Handle success or error
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ?? "Error adding stamp";

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });

        if (!error.response?.data?.error) {
          console.error("Error adding stamp:", error);
        }
        setBtnLoading(false);
      }
    }
  };

  const handleLogoButtonClick = () => {
    logoInputRef.current.click();
  };

  const handleStampButtonClick = () => {
    stampInputRef.current.click();
  };

  //   const handleNameUpdate = async () => {
  //     const nameData = { name };
  //     try {
  //       // await addOrUpdateName(nameData);
  //       toast({
  //         title: "Name",
  //         description: "Name updated successfully",
  //         status: "success",
  //         duration: 3000,
  //         position: "top-right",
  //         isClosable: true,
  //       });
  //     } catch (error) {
  //       if (error.response && error.response.data && error.response.data.error) {
  //         toast({
  //           title: "Error",
  //           description: error.response.data.error,
  //           status: "error",
  //           duration: 3000,
  //           position: "top-right",
  //           isClosable: true,
  //         });
  //       } else {
  //         console.error("Error uploading Name:", error);
  //         toast({
  //           title: "Error",
  //           description: "Updation ERROR",
  //           status: "error",
  //           duration: 3000,
  //           position: "top-right",
  //           isClosable: true,
  //         });
  //       }
  //     }
  //   };

  //   const handleAddressUpdate = async () => {
  //     const addressData = { address };
  //     try {
  //       // await addOrUpdateAddress(addressData);
  //       toast({
  //         title: "Address",
  //         description: "Address updated successfully",
  //         status: "success",
  //         duration: 3000,
  //         position: "top-right",
  //         isClosable: true,
  //       });
  //     } catch (error) {
  //       if (error.response && error.response.data && error.response.data.error) {
  //         toast({
  //           title: "Error",
  //           description: error.response.data.error,
  //           status: "error",
  //           duration: 3000,
  //           position: "top-right",
  //           isClosable: true,
  //         });
  //       } else {
  //         console.error("Error uploading address:", error);
  //         toast({
  //           title: "Error",
  //           description: "Updation ERROR",
  //           status: "error",
  //           duration: 3000,
  //           position: "top-right",
  //           isClosable: true,
  //         });
  //       }
  //     }
  //   };
  const fetchSettings = async () => {
    try {
      const settingsResponse = await getSettings();
      setLogoPreview(settingsResponse.settings.logoImage);
      setStampPreview(settingsResponse.settings.stampImage);
      setName(settingsResponse.settings.branchName);
      setAddress(settingsResponse.settings.branchLocation);
      
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Handle error fetching settings
    }
  };

  useEffect(() => {
    // Fetch settings when the component mounts
    fetchSettings();
  }, []);
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Flex
          direction="column"
          align="center"
          rowGap={6}
          bg={bgColorCard}
          borderRadius={10}
          p={5}
        >
          <FormLabel>Your Logo</FormLabel>
          {logoPreview && (
            <Image
              //   src={logoPreview}
              src={`data:image/png;base64,${logoPreview}`}
              alt="Logo Preview"
              maxHeight="5rem"
              height="auto"
            />
          )}
          <Input
            ref={logoInputRef}
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="solid"
            colorScheme="blue"
            onClick={handleLogoButtonClick}
            isLoading={btnLoading}
          >
            Upload Logo
          </Button>
        </Flex>
        <Flex
          direction="column"
          align="center"
          rowGap={6}
          bg={bgColorCard}
          borderRadius={10}
          p={5}
        >
          <FormLabel>Your Stamp</FormLabel>
          {stampPreview && (
            <Image
              //   src={stampPreview}
              src={`data:image/png;base64,${stampPreview}`}
              alt="Stamp Preview"
              maxHeight="5rem"
              height="auto"
            />
          )}
          <Input
            ref={stampInputRef}
            id="stamp-upload"
            type="file"
            accept="image/*"
            onChange={handleStampUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="solid"
            colorScheme="blue"
            onClick={handleStampButtonClick}
            isLoading={btnLoading}
          >
            Upload Stamp
          </Button>
        </Flex>
      </SimpleGrid>
      <Divider orientation="horizontal" my={4} />
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {/* <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    bg={bgColorCard}
                    borderRadius={10}
                    p={5}
                    gap={4}
                >
                    <Box
                        width="100%"
                    >
                        <FormLabel>Company Name</FormLabel>
                        <Input
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Box>
                    <Button variant="solid" colorScheme="blue" onClick={handleNameUpdate}>
                        Update
                    </Button>
                </Flex>
                <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    bg={bgColorCard}
                    borderRadius={10}
                    p={5}
                    gap={4}
                >
                    <Box
                        // maxW="80%"
                        width="100%"

                    >

                        <FormLabel>Address</FormLabel>
                        <Textarea
                            maxW="100%"
                            name="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </Box>
                    <Button variant="solid" colorScheme="blue" onClick={handleAddressUpdate}>
                        Update
                    </Button>
                </Flex>
                <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    bg={bgColorCard}
                    borderRadius={10}
                    p={5}
                    gap={4}
                >
                    <Box
                        width="100%"
                    >
                        <FormLabel>Company Phone Number</FormLabel>
                        <Input
                            name="name"
                            type="number"
                            value={name}
                        // onChange={(e) => setName(e.target.value)}
                        />
                    </Box>
                    <Button variant="solid" colorScheme="blue" >
                        Update
                    </Button>
                </Flex> */}
                <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    bg={bgColorCard}
                    borderRadius={10}
                    p={5}
                    gap={4}
                >
                    <Box
                        width="100%"
                    >
                        <FormLabel>Configure Payment & Ledger Options</FormLabel>
                    </Box>
                    <Button variant="solid" colorScheme="blue" as={Link} to="/settings/paymentoptions">
                        Configure
                    </Button>
                </Flex>

            </SimpleGrid>
    </Box>
  );
};

export default SettingsPanelAdmin;
