import connectDB from "../utils/database"
import { MessageModel } from "../utils/schemaModel"
import type { NextApiRequest, NextApiResponse } from 'next'

const getSingleItem = async(req: NextApiRequest, res: NextApiResponse) => {
    try {
        console.log("item start");
        console.log(req.query.id)
        await connectDB()
        const singleItem = await MessageModel.findById(req.query.id)

        return res.status(200).json({message: "Reading item(single) is successful.", item: singleItem})
    } catch(err) {
        return res.status(400).json({message: "Reading item(single) is failed."})
    }
}

export default getSingleItem