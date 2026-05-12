// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';
 
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // A simple 200 with no body is the fastest way to say "I'm alive"
  res.status(200).end();
}