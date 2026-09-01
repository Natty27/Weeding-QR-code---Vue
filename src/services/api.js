import axios from "axios";

const hostname = typeof window !== "undefined" && window.location.hostname 
  ? window.location.hostname 
  : "192.168.0.108";

export default axios.create({
  baseURL: `http://${hostname}:3000`,
});
