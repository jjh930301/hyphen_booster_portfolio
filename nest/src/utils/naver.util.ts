import * as AWS from 'aws-sdk';
import { Constants } from 'src/constants/constants';
import { User } from 'src/entities/booster/user/user.entity';
import * as fs from 'fs';

export class NaverUtil {
  private S3 = new AWS.S3({
    endpoint : Constants.NAVER_BASE_URL,
    region : Constants.NAVER_REGION,
    credentials : {
      accessKeyId : Constants.NAVER_ACCESS_KEY,
      secretAccessKey : Constants.NAVER_SECRET_KEY
    }
  })

  async sendImage(
    user : User,
    folder : string,
    files : Array<Express.Multer.File>
  ) {
    try {
      const buckets = Promise.all(files.map(async (file) => {
        const key = `${user.id}/${folder}/${Date.now()}`
        await this.S3.putObject({
          Bucket : Constants.NAVER_BUCKET,
          Key : key, // user uuid + timestamp
          ACL: 'public-read',
          Body : file.buffer,
          ContentType: 'image/png' // ContentType을 받아야 하는지
        },).promise()
        return `${Constants.NAVER_BASE_URL}/${Constants.NAVER_BUCKET}/${key}`
      })).then((result) => {
        return result
      })

      return buckets;
    } catch(e) {
      console.log('naver object storage',e);
    }
  }
}