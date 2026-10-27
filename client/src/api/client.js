import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Network error
      error.isNetworkError = true
    }
    return Promise.reject(error)
  }
)

export default api