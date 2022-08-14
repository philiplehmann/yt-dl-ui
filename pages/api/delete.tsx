import youtube_dl from '../../helpers/youtube_dl'
import type { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
  url: string
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.body as RequestBody
  youtube_dl.delete(url)
  res.status(200).json(youtube_dl.queue)
}
