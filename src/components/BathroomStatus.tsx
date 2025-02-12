// BathroomStatus.tsx
import { useState, useEffect } from 'react';
import Button from './_components/button';
import freeWC from '../assets/freewc.png';
import busyWC from '../assets/busywc.png';
import Pee from '../assets/peeing.png';
import Poop from '../assets/pooping.png';
import { backendURL } from '../lib/constants';
import { toast } from 'react-toastify';
import { formatTime } from '../lib/helpers';
import { BathroomStatusData } from '../App';

export type Activity = "none" | "peeing" | "pooping";

type BathroomStatusProps = {
  status: BathroomStatusData;
  userId: string;
  setStatus: (status: BathroomStatusData) => void;
};

function BathroomStatus({ status, userId, setStatus }: BathroomStatusProps) {
  // El tiempo transcurrido se calculará a partir de occupiedSince
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    let timerId: number;
    if (status.isOccupied && status.occupiedSince) {
      const occupiedSince = status.occupiedSince; // Capturamos el valor para que TS lo considere como string
      timerId = window.setInterval(() => {
        const startTime = new Date(occupiedSince).getTime();
        const now = Date.now();
        const diffInSeconds = Math.floor((now - startTime) / 1000);
        setElapsed(diffInSeconds);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  }, [status.isOccupied, status.occupiedSince]);

  // Llama al endpoint /occupy para ocupar el baño (actividad inicial "none")
  const handleOccupy = async () => {
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al ocupar el baño");
    }
  };

  // Llama al endpoint /free para liberar el baño
  const handleFree = async () => {
    try {
      const response = await fetch(`${backendURL}/api/Bathroom/free`, {
        method: 'PUT',
        headers: {
          'X-User-Id': userId,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al liberar el baño");
    }
  };

  // Llama al endpoint /activity para actualizar la actividad (peeing o pooping)
  const handleSetActivity = async (selectedActivity: Activity) => {
    try {
      const payload = { activity: selectedActivity };
      const response = await fetch(`${backendURL}/api/Bathroom/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la actividad");
    }
  };

  // Solo el usuario que ocupa el baño puede actualizar la actividad o liberarlo
  const isOccupant = status.isOccupied && (status.occupiedBy === userId);

  return (
    <div className="flex flex-col w-full items-center gap-4 select-none">
      <h1 className="text-3xl font-bold mb-6">Estado del Baño</h1>

      <div>
        {status.isOccupied ? (
          <>
            {status.activity === "none" && (
              <img width={180} height={180} src={busyWC} alt="Baño ocupado" draggable={false} />
            )}
            {status.activity === "peeing" && (
              <img
                width={180}
                height={180}
                src={Pee}
                alt="Orinando"
                draggable={false}
                className="animate-[pendulum_3s_ease-in-out_infinite]"
              />
            )}
            {status.activity === "pooping" && (
              <img
                width={180}
                height={180}
                src={Poop}
                alt="Defecando"
                draggable={false}
                className="animate-[pendulum_3s_ease-in-out_infinite]"
              />
            )}
          </>
        ) : (
          <img
            width={180}
            height={180}
            src={freeWC}
            alt="Baño libre"
            draggable={false}
            className="animate-pulse"
          />
        )}
      </div>

      <div className={`text-2xl font-bold mb-2 ${status.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
        {status.isOccupied ? 'Ocupado' : 'Disponible'}
      </div>

      {status.isOccupied ? (
        <>
          <div className="font-semibold text-red-500 text-lg">
            Tiempo ocupado: {formatTime(elapsed)}
          </div>
          {isOccupant && status.activity === "none" && (
            <div className="flex gap-4">
              <Button variant="destructive" onClick={() => handleSetActivity("peeing")}>
                1 - Orinando
              </Button>
              <Button variant="destructive" onClick={() => handleSetActivity("pooping")}>
                2 - Defecando
              </Button>
            </div>
          )}
          {isOccupant && (
            <Button variant="destructive" onClick={handleFree}>
              Liberar baño
            </Button>
          )}
        </>
      ) : (
        <Button variant="solid" onClick={handleOccupy}>
          Ocupar baño
        </Button>
      )}
    </div>
  );
}

export default BathroomStatus;