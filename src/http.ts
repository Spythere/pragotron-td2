import axios from 'axios';

const http = axios.create({
  baseURL: 'https://stacjownik.spythere.eu'
});

export default http;
