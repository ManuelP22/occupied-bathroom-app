import { useState, useEffect } from 'react';
import BathroomStatus from './components/BathroomStatus';
import { backendURL } from './lib/constants';
import { getUserId } from './lib/auth';
import useSignalR from './hooks/useSignalR';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type BathroomStatusData = {
  isOccupied: boolean;
  occupiedBy: string | null;
  activity: "none" | "peeing" | "pooping";
  // Indica el instante (en formato ISO) desde que se ocupó el baño
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

  // Actualiza el estado global en tiempo real mediante SignalR
  useSignalR((newStatus: BathroomStatusData) => {
    console.log('Actualizando estado global con SignalR:', newStatus);
    setStatus(newStatus);
  });

  // Consulta el estado actual del baño al iniciar la aplicación
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

  // Función para ocupar el baño
  const occupyBathroom = async () => {
    try {
      const payload = { occupied: true, activity: "none" };
      const response = await fetch(`${backendURL}/api/Bathroom/occupy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Error al ocupar");
      const data = await response.json();
      setStatus(data);
      toast.success("Baño ocupado");
    } catch (error) {
      console.error(error);
      toast.error("Error al ocupar el baño");
    }
  };

  // Función para liberar el baño
  const freeBathroom = async () => {
    try {
      const response = await fetch(`${backendURL}/api/Bathroom/free`, {
        method: 'PUT',
        headers: {
          'X-User-Id': userId,
        },
      });
      if (!response.ok) throw new Error("Error al liberar");
      const data = await response.json();
      setStatus(data);
      toast.success("Baño liberado");
    } catch (error) {
      console.error(error);
      toast.error("Error al liberar el baño");
    }
  };

  // Función de "toggle": si el baño está libre, se ocupa; si está ocupado y es el mismo usuario, se libera
  const toggleBathroom = async () => {
    if (!status.isOccupied) {
      await occupyBathroom();
    } else if (status.occupiedBy === userId) {
      await freeBathroom();
    } else {
      toast.error("El baño está ocupado por otro usuario");
    }
  };

  // Al cargar la app, revisa si la URL tiene el parámetro nfc=toggle y ejecuta la acción
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nfcParam = params.get('nfc');
    if (nfcParam && nfcParam.toLowerCase() === 'toggle') {
      toggleBathroom();
    }
  }, []);

  return (
    <div className={`flex relative w-full ${status.isOccupied ? 'bg-red-50' : 'bg-cyan-50'} h-screen items-center flex-col`}>
      <BathroomStatus status={status} userId={userId} setStatus={setStatus} />
      <ToastContainer />
    </div>
  );
}

export default App;