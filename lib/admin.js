// Guard de las rutas de administracion (panel de novios).
// El acceso se controla con el token de un grupo cuyo rol sea 'novios'.
import { findGuestByToken } from './repo.js'

export async function requireNovios(token) {
  const guest = await findGuestByToken(token)
  if (!guest) return { ok: false, status: 401, error: 'Token requerido o invalido' }
  if (guest.role !== 'novios') return { ok: false, status: 403, error: 'Acceso solo para novios' }
  return { ok: true, guest }
}
