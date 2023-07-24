import { Constants } from "./constants";

export class Urls {
  static OPEN_API = `http://apis.data.go.kr`;
  static HYPHEN_DATA_MARKET = `https://api.hyphen.im`;
  static POS = process.env.HYPHEN_POS_URI;
  static KSTA = process.env.KSTA_URI
  static MNWISE =  Constants.ENV === 'production' ? 
    process.env.MNWISE_PROD : 
    process.env.MNWISE_DEV;
}