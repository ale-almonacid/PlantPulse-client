import axios from "axios"

// service will be an object with all initial configurations for the requests made to the backend.
const service = axios.create({
  // to not have this in all the requests ("https://server.app/" and "https://server.app" both work)
  baseURL: `${import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "")}/api`,
})

export default service
