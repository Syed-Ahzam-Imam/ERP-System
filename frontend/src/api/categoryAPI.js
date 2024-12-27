import axios from "axios";
import { BASE_URL } from "./constants";

export const getAllCategories = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/category/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryName) => {
    try {
        const response = await axios.post(`${BASE_URL}/category/`, {
            categoryName: categoryName
        });
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Function to delete a category by ID
export const deleteCategoryById = async (categoryId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };