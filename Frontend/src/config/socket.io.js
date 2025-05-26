// import socket from 'socket.io-client';


// let socketInstance = null;


// export const initializeSocket = (projectId) => {

//     socketInstance = socket(import.meta.env.VITE_API_URL, {
//         auth: {
//             token: localStorage.getItem('token')
//         },
//         query: {
//             projectId
//         }
//     });
// console.log("client connected");
//     return socketInstance;

// }

// export const receiveMessage = (eventName, cb) => {
//     socketInstance.on(eventName, cb);
// }

// export const sendMessage = (eventName, data) => {
//     socketInstance.emit(eventName, data);
// }
import socketIO from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
  socketInstance = socketIO(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem('token'),
    },
    query: {
      projectId,
    },
  });

  // ✅ Confirm connection
  socketInstance.on('connect', () => {
    console.log('✅ Client connected to socket with ID:', socketInstance.id);
  });

  // ❗️Listen for connection errors
  socketInstance.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return socketInstance;
};
export const receiveMessage = (eventName, cb) => {
    socketInstance.off(eventName);
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}