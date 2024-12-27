import axios from "axios";
import { BASE_URL } from "./constants";

// Function to fetch all investors
export const fetchInvestors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/investor/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Function to update an investor
export const updateInvestor = async (investorId, updatedData) => {
    try {
      const response = await axios.put(`${BASE_URL}/investor/${investorId}`, updatedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

   // Function to add a new investor
   export const addInvestor = async (newInvestorData) => {
    try {
      const response = await axios.post(`${BASE_URL}/investor/`, newInvestorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  // Function to delete an investor by ID
export const deleteInvestorById = async (investorId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/investor/${investorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };