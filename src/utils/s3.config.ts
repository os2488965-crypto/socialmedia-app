// import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";
// import { StorageEnum } from '../middleware/multer.cloud';

// export const s3Client = () => {
//   return new S3Client({
//     region: process.env.AWS_REGION!,
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//     },
//   });
// };

// export const uploadFile = async (
//   {
//     storeType = StorageEnum.cloud,
//     Bucket = process.env.AWS_BUCKET_NAME!,
//     path = "general",
//     ACL = "private" as ObjectCannedACL,
//     file,
//   }: {
//     storeType?: StorageEnum,
//     Bucket?: string,
//     ACL?: ObjectCannedACL,
//     path: string,
//     file: Express.Multer.File
//   }
// ): Promise<string> => {

//   const command = new PutObjectCommand({
//     Bucket,
//     ACL,
//     Key: `${process.env.APPLICATION_NAME}/${path}/${uuidv4()}_${file.originalname}`,
//     Body: storeType === StorageEnum.cloud ? file.buffer : createReadStream(file.path),
//     ContentType: file.mimetype,
//   });

//   await s3Client().send(command);

//   if (!command.input.Key) {
//     throw new AppError("Failed to upload file to S3", 500);
//   }

//   return command.input.Key;
// };


