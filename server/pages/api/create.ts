// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from "./utils/database";
import { MessageModel } from "./utils/schemaModel";

type RequestData = {
  address: string,
  message: string,
  tip: number,
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqData: RequestData = req.body;

  try {
    console.log(`create start.`);
    connectDB();

    const data = {
      address: reqData.address,
      message: reqData.message,
      tip: reqData.tip,
      isValid: false,
      isCompleted: false
    };
    const val: any = await MessageModel.create(data);
    console.log(`success. result: ${val}`);

    res.status(200).json({ message: `success:`, id: val.id, address: reqData.address, tip: reqData.tip });
  } catch(err) {
    console.log(`failure: \n${err}\n`);
    res.status(200).json({ message: `failure: \n${err}\n` });
  }
}
