import YoutubeDL from '../../helpers/youtube_dl'
import { Server } from 'socket.io'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import type { Socket } from 'socket.io'

export default (req: NextApiRequest, res: NextApiResponse) => {
  if ((res.socket as any).server.io) {
    // eslint-disable-next-line no-console
    console.log('Socket is already running')
  } else {
    // eslint-disable-next-line no-console
    console.log('Socket is initializing')
    const io = new Server((res.socket as any).server)
    const youtubeDL = new YoutubeDL()
    ;(res.socket as any).server.io = io
    ;(res.socket as any).server.youtubeDL = youtubeDL

    const socketPromise: Promise<Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>> = new Promise(
      (resolve) => {
        io.on('connection', (socket) => {
          // eslint-disable-next-line no-console
          resolve(socket)
        })
      }
    )
    youtubeDL.on('change', async (queue) => {
      const socket = await socketPromise
      // eslint-disable-next-line no-console
      // socket.broadcast.emit('status', queue)
      socket.emit('status', queue)
    })
  }
  res.end()
  //res.status(200).json(youtube_dl.queue)
}
