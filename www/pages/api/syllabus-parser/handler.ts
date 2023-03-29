import type { NextApiRequest, NextApiResponse } from 'next';
import { sendFileToAPI } from './sendFileToAPI';

export default async function handler(req: NextApiRequest , res: NextApiResponse) {
  const { file } = req.body;

  try {
    const response = await sendFileToAPI(file);
    res.status(response.response.status).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}
