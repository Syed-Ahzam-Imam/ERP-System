import axios from "axios";
import { BASE_URL, branchId } from "./constants";

export const uploadLogo = async (logoFormData) => {
    try {
      const response = await axios.post(`${BASE_URL}/setting/logo/add`, logoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  };

  export const uploadStamp = async (stampFormData) => {
    try {
      const response = await axios.post(`${BASE_URL}/setting/stamp/add`, stampFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading stamp:", error);
      throw error;
    }
  };


  export const getSettings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/setting/${branchId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


