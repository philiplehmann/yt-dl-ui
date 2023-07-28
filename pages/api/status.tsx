import type { NextApiRequest, NextApiResponse } from 'next';
import { getYoutubeDL } from 'helpers/extend_socket';

export default (req: NextApiRequest, res: NextApiResponse) => {
  getYoutubeDL(res.socket);
  res.end();
};
