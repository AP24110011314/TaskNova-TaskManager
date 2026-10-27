import api from './client'

export const statsApi = {
  getAll: () => api.get('/stats')
}