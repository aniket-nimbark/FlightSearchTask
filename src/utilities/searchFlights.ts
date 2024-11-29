import api from "../config/axiosInstance";

interface Option {
  label: string;
  code: string;
  entityId: string;
}

interface Flight {
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: string;
  co2: string;
}

const searchFlights = async (
  from: Option,
  to: Option,
  departureDate: string,
  flightClass: string,
  passengers: number,
  setLoader: Function,
  setFlights: Function
) => {
  if (!from || !to || !departureDate) return;

  try {
    setLoader(true);
    const searchParams = {
      originSkyId: from.code,
      destinationSkyId: to.code,
      originEntityId: from.entityId,
      destinationEntityId: to.entityId,
      date: departureDate,
      cabinClass: flightClass,
      adults: passengers.toString(),
      sortBy: "best",
      currency: "USD",
      market: "en-US",
      countryCode: "US"
    };

   

    const response = await api.get("/v2/flights/searchFlights", {
      params: searchParams
    });

    const flightsData: Flight[] = response.data.data.itineraries.map(
      (itinerary: any) => ({
        airline: itinerary.legs[0].carriers.marketing[0].name,
        departureTime: itinerary.legs[0].departure,
        arrivalTime: itinerary.legs[0].arrival,
        duration: `${Math.floor(
          itinerary.legs[0].durationInMinutes / 60
        )}h ${itinerary.legs[0].durationInMinutes % 60}m`,
        stops: itinerary.legs[0].stopCount,
        price: itinerary.price.formatted
      })
    );

    setFlights(flightsData);
    setLoader(false);
  } catch (error) {
    setLoader(false);
    console.error("Error searching flights:", error);
  }
};

export default searchFlights;
