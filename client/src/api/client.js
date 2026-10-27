import axios from 'axios'

const rawUrl = import.meta.env.VITE_API_URL || '/api'
const normalizedUrl = rawUrl.startsWith('http') && !rawUrl.endsWith('/api') && !rawUrl.includes('/api/')
  ? rawUrl.replace(/\/+$/, '') + '/api'
  : rawUrl

const api = axios.create({
  baseURL: normalizedUrl,
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