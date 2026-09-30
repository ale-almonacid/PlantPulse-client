import axios from "axios"

// service will be an object with all initial configurations for the requests made to the backend.
const service = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`, // to not have this in all the requests
})

export default service
