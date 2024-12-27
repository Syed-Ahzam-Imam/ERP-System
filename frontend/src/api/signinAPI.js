import axios from "axios";
import { BASE_URL } from "./constants";


// Function to make a POST request to the login endpoint
export const signIn = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};