import axios from 'axios'

const base = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(cfg=>{
  const token = localStorage.getItem('token')
  if(token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` }
  return cfg
})

export default api
