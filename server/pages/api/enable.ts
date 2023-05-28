// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from "./utils/database";
import { MessageModel } from "./utils/schemaModel";

type RequestData = {
  id: string
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqData: RequestData = req.body;

  try {
    console.log(`enable start.`);
    connectDB();

    const val: any = await MessageModel.updateOne({id: reqData.id}, {$set: {isValid: true}});
    console.log(`success.`);

    res.status(200).json({ message: `success:`});
  } catch(err) {
    console.log(`failure: \n${err}\n`);
    res.status(200).json({ message: `failure: \n${err}\n` });
  }
}
