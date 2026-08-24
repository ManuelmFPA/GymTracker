import api from './api'

const auth = {
  async login(email:string, password:string){
    const r = await api.post('/auth/login', { email, password })
    const token = r.data?.token
    if(token) localStorage.setItem('token', token)
    return r.data
  },
  async register(email:string, password:string){
    return api.post('/auth/register', { email, password })
  },
  logout(){
    localStorage.removeItem('token')
  }
}

export default auth
