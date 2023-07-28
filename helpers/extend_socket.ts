import YoutubeDL from './youtube_dl';
import { Server as IOServer } from 'socket.io';
import { Socket } from 'node:net';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { Socket as IOSocket } from 'socket.io';
import { Server } from 'node:http';

export type SocketWithYoutubeDL = Socket & {
  server: Server & {
    youtubeDL?: YoutubeDL;
    io?: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;
  };
};

const socketPromise = async (
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>
): Promise<IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>> => {
  return new Promise((resolve) => {
    io.on('connection', (socket) => {
      // eslint-disable-next-line no-console
      resolve(socket);
    });
  });
};

export const getYoutubeDL = (
  socket: SocketWithYoutubeDL | Socket
): [YoutubeDL, IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>] => {
  const socketWithYtDl = socket as unknown as SocketWithYoutubeDL;

  if (socketWithYtDl.server?.io) {
    // eslint-disable-next-line no-console
    console.log('Socket is already running');
  } else {
    // eslint-disable-next-line no-console
    console.log('Socket is initializing');
    const io = new IOServer(socketWithYtDl.server);
    const youtubeDL = new YoutubeDL();
    socketWithYtDl.server.io = io;
    socketWithYtDl.server.youtubeDL = youtubeDL;

    youtubeDL.on('change', async (queue) => {
      const socket = await socketPromise(io);
      // eslint-disable-next-line no-console
      // socket.broadcast.emit('status', queue)
      socket.emit('status', queue);
    });
  }
  return [socketWithYtDl.server.youtubeDL, socketWithYtDl.server?.io];
};
