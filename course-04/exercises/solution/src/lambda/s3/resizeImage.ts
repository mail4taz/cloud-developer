import { S3Handler, S3Event, SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es'

const s3 = new AWS.S3()

const imagesBucketName = process.env.IMAGES_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event', JSON.stringify(event))

    if (event.Records)
    {    
        for (const snsRecord of event.Records) {
            const s3EventStr = snsRecord.Sns.Message
            console.log('Processing S3 event from SNS topic', s3EventStr)
    
            await processS3Event(JSON.parse(s3EventStr))
        }
    }
}

async function processS3Event(event: S3Event) {
    //console.log('Processing S3 event', JSON.stringify(event))

    for (const s3Record of event.Records) {
        const key = s3Record.s3.object.key;
        console.log('Processing image ', key)
        
        await processImage(key)
    }
}

async function processImage(imgKey) {
    const body = await readImage(imgKey)

    const resizedImg = await resizeImage(body)

    await writeImage(resizedImg, imgKey)
}

async function readImage(imgKey): Promise<Buffer>
{
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: imgKey
        })
        .promise()

    return response.Body
}

async function resizeImage(body: Buffer): Promise<Buffer>
{
    // Read an image with the Jimp library
    const image = await Jimp.read(body)

    // Resize an image maintaining the ratio between the image's width and height
    image.resize(150, Jimp.AUTO)

    // Convert an image to a buffer that we can write to a different bucket
    const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)
    return convertedBuffer
}

async function writeImage(body: Buffer, name: string) {
    await s3
        .putObject({
            Bucket: thumbnailBucketName,
            Key: `${name}.jpeg`,
            Body: body
        })
        .promise()
}