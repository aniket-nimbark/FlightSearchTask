import api from "../config/axiosInstance";

const fetchAirports = async (input: string, setOptions: Function) => {
    if (!input) return;
    try {
      const response = await api.get("/v1/flights/searchAirport", {
        params: { query: input, locale: "en-US" },
      });
  
      const airports = response.data.data.map((airport: any) => ({
        label: airport.presentation.suggestionTitle,
        code: airport.skyId,
        entityId: airport.entityId,
      }));
      setOptions(airports);
    } catch (error) {
      console.error("Error fetching airports:", error);
    }
  };
  
export default fetchAirports