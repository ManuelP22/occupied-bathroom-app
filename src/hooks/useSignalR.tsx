// useSignalR.tsx
import { useEffect } from 'react';
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { getUserId } from '../lib/auth';
import { backendURL } from '../lib/constants';

function useSignalR(onStatusUpdate: (status: any) => void) {
  useEffect(() => {
    const userId = getUserId();
    const connection = new HubConnectionBuilder()
      .withUrl(`${backendURL}/bathroomHub`, { transport: HttpTransportType.WebSockets })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        console.log('Conectado a SignalR');
        // Una vez conectado, unirse al grupo usando el userId
        connection.invoke('JoinGroup', userId)
          .catch(err => console.error('Error al invocar JoinGroup:', err));
      })
      .catch(err => console.error('Error al conectar a SignalR:', err));

    // En caso de reconexión, volver a unirse al grupo
    connection.onreconnected(() => {
      connection.invoke('JoinGroup', userId)
        .catch(err => console.error('Error al reinvocar JoinGroup tras reconexión:', err));
    });

    // Escuchar notificaciones de error desde el servidor
    connection.on('errorNotification', (message: string) => {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Escuchar actualizaciones de estado del baño
    connection.on('bathroomStatusUpdate', (status) => {
      console.log('Estado actualizado recibido por SignalR:', status);
      onStatusUpdate(status);
      toast.info(`El baño ahora está ${status.isOccupied ? 'ocupado' : 'libre'}`, {
        position: "top-right",
        autoClose: 3000,
      });
    });

    return () => {
      connection.stop();
    };
  }, [onStatusUpdate]);
}

export default useSignalR;