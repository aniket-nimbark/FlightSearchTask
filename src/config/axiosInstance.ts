import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "https://sky-scrapper.p.rapidapi.com/api",
  headers: {
    "x-rapidapi-key": "9ed3f8448cmsh56ca1753074ee7fp17a8cejsnd7886e01562f",
    "x-rapidapi-host": "sky-scrapper.p.rapidapi.com"
  }
});

export default api;
