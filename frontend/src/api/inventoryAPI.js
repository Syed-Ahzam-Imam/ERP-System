import Axios from 'axios';
import { BASE_URL } from "./constants";
import axios from 'axios';

// export const fetchInventoryItems = async () => {
//     try {
//         const response = await Axios.get(`${BASE_URL}/inventory/`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         throw error;
//     }
// };

export const getInventoryByBranch = async (branchId) => {
  try {
    const response = await axios.get(`${BASE_URL}/inventory/byBranch/${branchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const fetchInventoryItems = async () => {
  try {
    const response = await fetch(`${BASE_URL}/inventory/newCombined`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Error fetching inventory items");
  }
};
// Function to fetch all inventory items
// export async function fetchInventoryItems() {
//   try {
//     const response = await Axios.get(`${BASE_URL}/inventory/combined`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching inventory items:', error);
//     throw error;
//   }
// }
// Function to fetch a product by ID
export const getProductById = async (productId) => {
  try {
    const response = await Axios.get(`${BASE_URL}/inventory/byProduct/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

  export const addOpeningStock = async (formData) => {
    try {
      const response = await Axios.post(`${BASE_URL}/inventory/`, formData);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error; // Rethrow the error for the component to handle
    }
  };

  export const requestInventory = async (formData) => {
    try {
      const response = await Axios.post(`${BASE_URL}/transfers/`, formData);
      return response.data;
    } catch (error) {
      console.error('Error requesting inventory:', error);
      throw error; // Rethrow the error for the component to handle
    }
  };

  export const updateInventoryItem = async (itemId, updatedItemData) => {
    try {
      const response = await Axios.put(`${BASE_URL}/inventory/${itemId}`, updatedItemData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const deleteInventoryItem = async (itemId) => {
    try {
      const response = await Axios.delete(`${BASE_URL}/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };




