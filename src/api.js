const BASE = '/api';
const getToken = () => localStorage.getItem('token');

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(BASE + path, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (r.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    throw new Error('Sesión expirada');
  }
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

export const api = {
  login:            (login, password)  => req('POST',   '/auth/login', { login, password }),
  me:               ()                 => req('GET',    '/auth/me'),
  getCuadernos:     ()                 => req('GET',    '/cuadernos'),
  getCuaderno:      (id)               => req('GET',    `/cuadernos/${id}`),
  createCuaderno:   (data)             => req('POST',   '/cuadernos', data),
  saveCuaderno:     (id, datos)        => req('PUT',    `/cuadernos/${id}`, { datos }),
  deleteCuaderno:   (id)               => req('DELETE', `/cuadernos/${id}`),
  getInscripciones: (id)               => req('GET',    `/cuadernos/${id}/inscripciones`),
  inscribir:        (cid, alumno_id)   => req('POST',   `/cuadernos/${cid}/inscripciones`, { alumno_id }),
  desinscribir:     (cid, uid)         => req('DELETE', `/cuadernos/${cid}/inscripciones/${uid}`),
  getUsuarios:      (rol)              => req('GET',    `/usuarios${rol ? `?rol=${rol}` : ''}`),
  createUsuario:    (data)             => req('POST',   '/usuarios', data),
  updateUsuario:    (id, data)         => req('PUT',    `/usuarios/${id}`, data),
  deleteUsuario:    (id)               => req('DELETE', `/usuarios/${id}`),
  changePassword:   (id, password)     => req('PUT',    `/usuarios/${id}/password`, { password }),
  updateCiclosDocente: (id, ciclos)    => req('PUT',    `/usuarios/${id}/ciclos`, { ciclos }),
  getCiclos:        ()                 => req('GET',    '/ciclos'),
  createCiclo:      (data)             => req('POST',   '/ciclos', data),
  deleteCiclo:      (id)               => req('DELETE', `/ciclos/${id}`),
  createGrupo:      (cicloId, data)    => req('POST',   `/ciclos/${cicloId}/grupos`, data),
  deleteGrupo:      (id)               => req('DELETE', `/ciclos/grupo/${id}`),
  getDocentesCuaderno:   (cid)          => req('GET',    `/cuadernos/${cid}/docentes`),
  addDocenteCuaderno:    (cid, did)      => req('POST',   `/cuadernos/${cid}/docentes`, { docente_id: did }),
  removeDocenteCuaderno: (cid, did)      => req('DELETE', `/cuadernos/${cid}/docentes/${did}`),
};
