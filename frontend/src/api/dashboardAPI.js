import axios from "axios";
import { BASE_URL } from "./constants";

export const fetchChartData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dashboard`); // Assuming /dashboard is your API endpoint
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  };