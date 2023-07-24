export class Constants {
  static ENV = process.env.ENV;
  static secret = process.env.JWT_SECRET;
  static hyphen_secret = process.env.HYPHEN_SECRET;
  static hyphen_access_token = process.env.HYPHEN_ACCESS_TOKEN;
  static HYPHEN_ID = process.env.HYPHEN_ID;
  static HYPHEN_KEY = process.env.HYPHEN_KEY;
  static data_portal_key = process.env.DATA_PORTAL_KEY;
  static KSTA_ID = process.env.KSTA_ID;
  static KSTA_KEY = process.env.KSTA_KEY;
  static SECRET = process.env.SECRET;
  static NAVER_BASE_URL='https://kr.object.ncloudstorage.com';
  static NAVER_ACCESS_KEY = process.env.NAVER_ACCESS_KEY;
  static NAVER_SECRET_KEY = process.env.NAVER_SECRET_KEY;
  static NAVER_REGION = process.env.NAVER_REGION;
  static NAVER_BUCKET = process.env.NAVER_BUCKET;
  static RUNNABLE : boolean = Constants.ENV === 'production';
  static MNWISE_KEY = Constants.ENV !== 'production' ? process.env.MNWISE_DEV : process.env.MNWISE_PROD;
  static SENDER_KEY = process.env.MNWISE_SENDER_KEY
}