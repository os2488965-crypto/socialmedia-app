import  { Request ,Response,NextFunction} from "express"
import { ZodType } from "zod"
import { AppError } from "../utils/classError"

type ReqType = keyof Request
type schemaType = Partial<Record<ReqType,ZodType>>

export const validation = (schema:schemaType)=>{
   return (req:Request ,res:Response,next:NextFunction)=>{

    const validationErorrs = []
    for (const key of Object.keys(schema) as ReqType[]) {
        if(!schema[key]) continue
        if (req.file) {
            req.body.attachments = req.file;
        }

        if (req.files) {
            req.body.attachments = req.files;
        }

        const result = schema[key].safeParse(req[key])
        if(!result.success)
           validationErorrs.push(result.error)  
    }

    if(validationErorrs.length){
        throw new AppError(JSON.parse(validationErorrs as unknown as string),400)
    }
    next()
   }
}

