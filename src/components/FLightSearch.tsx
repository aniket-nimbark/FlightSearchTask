import React, { useState } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Hidden,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import searchFlights from "../utilities/searchFlights";
import fetchAirports from "../utilities/fetchAirports";
import api from "../config/axiosInstance";
import "./FLightSearch.css";
import SearchIcon from "@mui/icons-material/Search";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

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

interface FlightDay {
  day: string;
  group: string;
  price: number;
}

interface FlightData {
  status: boolean;
  timestamp: number;
  data: {
    flights: {
      noPriceLabel: string;
      groups: { id: string; label: string }[];
      days: FlightDay[];
      currency: string;
    };
  };
}


const FlightSearch: React.FC = () => {
  // State management
  const [from, setFrom] = useState<Option | null>(null);
  const [to, setTo] = useState<Option | null>(null);
  const [tripType, setTripType] = useState<string>("round-trip");
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [flightClass, setFlightClass] = useState<string>("economy");
  const [fromOptions, setFromOptions] = useState<Option[]>([]);
  const [toOptions, setToOptions] = useState<Option[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [flightDays, setFlightDays] = useState<FlightDay[]>([]);
  const [isFromDatePickerOpen, setIsFromDatePickerOpen] =
    useState<boolean>(false);
  const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean>(false);
  const today: Date = new Date();

  const fetchFlightPrices = async (from: any, to: any) => {
    try {
      const response = await api.get<FlightData>(
        `/v1/flights/getPriceCalendar?originSkyId=${
          from.code
        }&destinationSkyId=${to.code}&fromDate=${today.toLocaleDateString(
          "en-CA"
        )}&currency=USD`
      );
     

      const { data } = response.data;
     
      const days = data.flights.days;

      setFlightDays(days);
      const priceMap: { [key: string]: number } = {};
      days.forEach((day: { day: string | number; price: number }) => {
        priceMap[day.day] = day.price;
      });
      setPrices(priceMap);
    } catch (error) {
      console.error("Error fetching flight prices:", error);
    }
  };

  const renderDayContents = (day: number, date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    const price = prices[dateString];
    return (
      <div className="custom-day">
        <div>{day}</div>
        {price ? (
          <div className="price" style={{fontSize:'10px'}}>${price}</div>
        ) : (
          <div className="no-price">-</div>
        )}
      </div>
    );
  };

  const handleDepartureSearch = () => {
  
    const departureDateStr = departureDate
      ? departureDate.toLocaleDateString("en-CA")
      : "";

   
    searchFlights(
      from!,
      to!,
      departureDateStr,
      flightClass,
      passengers,
      setLoader,
      setFlights
    );
  };

  const formatTime = (isoDateString:any) => {
    const date = new Date(isoDateString);
    const options:any = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, 
    };
    return date.toLocaleTimeString([], options);
  };

  return (
    <Box className="search-flight" sx={{ paddingTop: 2 }}>
      <Box className="header-section" sx={{ width: "90vw", margin: "auto" }}>
        <div className="heading" onClick={() => setIsFromDatePickerOpen(false)}>
          <Typography
            variant="h1"
            fontSize={34}
            sx={{ my: 3 }}
            fontStyle={"bold"}
          >
            FLIGHTS <FlightTakeoffIcon fontSize="large" />
          </Typography>
        </div>

        <Grid
          className="input-form"
          rowSpacing={2}
          container
          sx={{ width: "90vw", margin: "auto" }}
        >
      
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Trip Type</InputLabel>
              <Select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                label="Trip Type"
                className="trip-type"
              >
                <MenuItem value="round-trip">Round Trip</MenuItem>
                <MenuItem value="one-way">One Way</MenuItem>
              </Select>
            </FormControl>
          </Grid>

      
          <Grid item xs={12} sm={4} paddingX={{ sm: 2, xs: 0 }}>
            <TextField
              label="Number of Passengers"
              type="number"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              fullWidth
            />
          </Grid>

         
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={flightClass}
                onChange={(e) => setFlightClass(e.target.value)}
                label="Class"
                className="flight-class"
              >
                <MenuItem value="economy">Economy</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="first">First Class</MenuItem>
              </Select>
            </FormControl>
          </Grid>

         
          <Grid item xs={12} sm={6} lg={3} paddingRight={{ sm: 2, xs: 0 }}>
            <Autocomplete
              value={from}
              onInputChange={(e, value) => fetchAirports(value, setFromOptions)}
              onChange={(_, newValue) => setFrom(newValue)}
              options={fromOptions}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label="From" />}
              className="departure-date"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} paddingRight={{ sm: 0, lg: 2 }}>
            <Autocomplete
              value={to}
              onInputChange={(e, value) => fetchAirports(value, setToOptions)}
              onChange={(_, newValue) => {
                setTo(newValue);
                fetchFlightPrices(from, newValue);
              }}
              options={toOptions}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label="To" />}
            />
          </Grid>


          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            paddingRight={{ sm: 2, xs: 0 }}
            paddingLeft={{ sm: 0, lg: 0 }}
          >
            <FormControl fullWidth>
              <Box onClick={() => setIsFromDatePickerOpen(true)}>
                <TextField
                  label="Departure Date"
                  type="text"
                  value={
                    departureDate
                      ? departureDate.toLocaleDateString("en-CA")
                      : ""
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
              {isFromDatePickerOpen && (
                  <DatePicker
                    selected={departureDate}
                    minDate={today}
                    onChange={(date: Date | null) => {
                      setIsFromDatePickerOpen(false); 
                      setDepartureDate(date); 
                    }}
                    dateFormat="yyyy-MM-dd"
                    inline
                    renderDayContents={renderDayContents}
                    className="datepicker"
                  />
                )}
            </FormControl>

          </Grid>

        
          {tripType === "round-trip" && (
            <Grid item xs={12} sm={6} lg={3} paddingRight={{ sm: 0, xs: 0 }}>
              <FormControl fullWidth>
                <Box onClick={() => setIsToDatePickerOpen(true)}>
                  <TextField
                    label="Return Date"
                    type="text"
                    value={
                      returnDate
                        ? returnDate.toLocaleDateString("en-CA")
                        : ""
                    }
                    fullWidth
                  />
                </Box>
                {isToDatePickerOpen && (
                    <DatePicker
                      selected={returnDate}
                      minDate={today}
                      onChange={(date: Date | null) => {
                        setReturnDate(date);
                        setIsToDatePickerOpen(() => false);
                      }}
                      dateFormat="yyyy-MM-dd"
                      inline
                      renderDayContents={renderDayContents}
                    />
                  )}
              </FormControl>
            </Grid>
          )}

        
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDepartureSearch}
              disabled={loader}
              className="search-btn"
              startIcon={<SearchIcon />}
            >
              Search Flights
              <Box paddingLeft={1}>
                {loader ? <CircularProgress size={24} /> : ""}
              </Box>
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Hidden>
      {flights.length > 0 && (
        <TableContainer
          component={Paper}
          className="TableContainer"
          sx={{ width: '90vw', margin: 'auto', marginTop: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Airline</TableCell>
                <TableCell>Departure Time</TableCell>
                <TableCell>Arrival Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Stops</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.map((flight, index) => (
                <TableRow key={index}>
                  <TableCell>{flight.airline}</TableCell>
                  <TableCell>{formatTime(flight.departureTime)}</TableCell>
                  <TableCell>{formatTime(flight.arrivalTime)}</TableCell>
                  <TableCell>{flight.duration}</TableCell>
                  <TableCell>{flight.stops}</TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {flight.price}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Hidden>
    </Box>
  );
};

export default FlightSearch;
