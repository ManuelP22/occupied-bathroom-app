// App.tsx
import { useState, useEffect } from 'react';
import BathroomStatus from './components/BathroomStatus';
import { backendURL } from './lib/constants';
import { getUserId } from './lib/auth';
import useSignalR from './hooks/useSignalR';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type BathroomStatusData = {
  isOccupied: boolean;
  occupiedBy: string | null;
  activity: "none" | "peeing" | "pooping";
  // Nuevo campo que indica el instante (en ISO) desde que se ocupó el baño
  occupiedSince: string | null;
};

function App() {
  const userId = getUserId(); // Identificador único del usuario
  const [status, setStatus] = useState<BathroomStatusData>({
    isOccupied: false,
    occupiedBy: null,
    activity: "none",
    occupiedSince: null,
  });

  // Cada vez que se reciba una actualización vía SignalR se actualiza el estado global.
  useSignalR((newStatus: BathroomStatusData) => {
    console.log('Actualizando estado global con SignalR:', newStatus);
    setStatus(newStatus);
  });

  // Consulta el estado actual del baño al iniciar la aplicación.
  useEffect(() => {
    fetch(`${backendURL}/api/Bathroom`, {
      headers: {
        'X-User-Id': userId,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Estado inicial del baño:', data);
        setStatus(data);
      })
      .catch(err => console.error(err));
  }, [userId]);

  return (
    <div className={`flex relative w-full ${status.isOccupied ? 'bg-red-50' : 'bg-cyan-50'} h-screen items-center`}>
      <BathroomStatus status={status} userId={userId} setStatus={setStatus} />
      <ToastContainer />
    </div>
  );
}

export default App;