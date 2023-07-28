import { getYoutubeDL } from 'helpers/extend_socket';
import type { NextApiRequest, NextApiResponse } from 'next';

interface RequestBody {
  url: string;
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.body as RequestBody;
  const [youtubeDL] = getYoutubeDL(res.socket);
  youtubeDL.delete(url);
  res.end();
};
