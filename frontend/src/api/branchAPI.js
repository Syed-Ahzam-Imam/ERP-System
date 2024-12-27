import axios from "axios";
import { BASE_URL } from "./constants";

export const createNewBranch = async (branchData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, branchData);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBranches = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/branch`);
    return response.data.branchesWithUsers;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export const updateBranch = async (branchId, updatedFields) => {
  try {
    const response = await axios.put(`${BASE_URL}/branch/${branchId}`, updatedFields);
    return response.data;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};

// Function to delete a branch by ID
export const deleteBranchById = async (branchId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/branch/${branchId}`);
    return response.data;
  } catch (error) {
    throw error; // Throw the error to be handled by the caller
  }
};