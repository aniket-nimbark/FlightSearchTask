import api from "../config/axiosInstance";

interface Option {
  label: string;
  code: string;
  entityId: string;
}

interface FlightPrice {
  date: string;
  price: string;
}

const fetchFlightPrices = async (
  from: Option | null,
  to: Option | null,
  startDate: string,
  endDate: string,
  flightClass: string,
  passengers: number
): Promise<FlightPrice[]> => {
  if (!from || !to) return [];

  try {
    const response = await api.get("/v2/flights/searchFlightPricesByDates", {
      params: {
        originSkyId: from.code,
        destinationSkyId: to.code,
        startDate,
        endDate,
        cabinClass: flightClass,
        adults: passengers.toString(),
        currency: "USD",
        market: "en-US",
        countryCode: "US"
      }
    });
    return response.data.data.prices; 
  } catch (error) {
    console.error("Error fetching flight prices:", error);
    return [];
  }
};

export default fetchFlightPrices;
