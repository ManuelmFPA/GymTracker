import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Rutinas from './pages/Rutinas'
import NuevaRutina from './pages/NuevaRutina'
import Entrenar from './pages/Entrenar'
import Exercises from './pages/Exercises'
import Progreso from './pages/Progreso'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/rutinas/nueva" element={<NuevaRutina />} />
          <Route path="/rutinas/:id/editar" element={<NuevaRutina />} />
          <Route path="/entrenar" element={<Entrenar />} />
          <Route path="/ejercicios" element={<Exercises />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>
    </Routes>
  )
}
