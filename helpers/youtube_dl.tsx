import { spawn } from 'child_process'
import { randomUUID } from 'crypto'

export interface YoutubeDLQueue {
  url: string
  started: boolean
  running: boolean
  data: string
  error?: string
  progress?: number
  exit?: { code: number; signal: NodeJS.Signals }
}

type YoutubeDLCallbackEvent = 'change'
interface YoutubeDLCallback {
  event: YoutubeDLCallbackEvent
  callback: (queue: YoutubeDLQueue[]) => void
}

const progress = (line: string, progress?: number): number | undefined => {
  const match = line.match(/([\d]+\.[\d]+)%/)
  if (match && match[1]) {
    return Number(match[1])
  }
  return progress
}

// [download]   0.7% of 464.94MiB at 62.13KiB/s ETA 02:06:51'

const messageAddLine = (data: string, line: string) => {
  if (line.startsWith('\r')) {
    return data.split('\n').slice(0, -1).concat(line.replace('\r', '')).join('\n')
  }
  return data + '\n' + line
}

export default class YoutubeDL {
  queue: YoutubeDLQueue[] = []
  callbacks: Readonly<YoutubeDLCallback[]> = Object.freeze([])
  id = randomUUID()

  add(url: string) {
    this.queue.push({ url, started: false, running: false, data: '' })
    this.worker()
  }

  delete(url: string) {}

  on(event: YoutubeDLCallbackEvent, callback: (queue: YoutubeDLQueue[]) => void) {
    this.callbacks = Object.freeze(this.callbacks.concat({ event, callback }))
  }

  executeCallback(runEvent: YoutubeDLCallbackEvent) {
    this.callbacks.forEach(({ event, callback }) => {
      if (event === runEvent) {
        callback(this.queue)
      }
    })
  }

  worker() {
    this.queue.forEach((entry) => {
      if (entry.started === false) {
        entry.started = true
        const process = spawn('youtube-dl', [entry.url], { stdio: ['pipe', 'pipe', 'pipe'] })
        // eslint-disable-next-line no-console
        console.log('start download of ', entry.url)
        // process.on('message', (message, _sendHandle) => {
        //   const line = message.toString()
        //   entry.data += line + '\n'
        //   entry.progress = progress(line, entry.progress)
        //   entry.running = true
        //   this.executeCallback('change')
        // })
        process.stdout.on('data', (chunk) => {
          // eslint-disable-next-line no-console
          // console.log('stdout', entry.url, String(chunk))
          entry.data = messageAddLine(entry.data, String(chunk))
          entry.progress = progress(String(chunk), entry.progress)
          this.executeCallback('change')
        })
        process.stderr.on('data', (chunk) => {
          // eslint-disable-next-line no-console
          // console.log('stderr', entry.url, String(chunk))
          entry.data = messageAddLine(entry.data, String(chunk))
          entry.progress = progress(String(chunk), entry.progress)
          this.executeCallback('change')
        })
        process.on('error', (error) => {
          // eslint-disable-next-line no-console
          console.error('error accured for', entry.url, error.message)
          entry.error = error.message
          this.executeCallback('change')
        })
        process.on('close', (code, signal) => {
          // eslint-disable-next-line no-console
          console.info('closed', entry.url, code, signal)
          entry.exit = { code, signal }
          entry.running = false
          this.executeCallback('change')
        })
        process.on('exit', (code, signal) => {
          // eslint-disable-next-line no-console
          console.info('exit', entry.url, code, signal)
          entry.exit = { code, signal }
          entry.running = false
          this.executeCallback('change')
        })
      }
    })
  }
}
