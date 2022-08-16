import type { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
  url: string
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.body as RequestBody
  ;(res.socket as any).server.youtubeDL.delete(url)
  res.end()
}
