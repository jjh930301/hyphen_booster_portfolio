import { HttpService } from "@nestjs/axios";
import { AxiosRequestHeaders, AxiosResponse } from "axios";
import { lastValueFrom , map} from "rxjs";
import { Constants } from "src/constants/constants";
import { Urls } from "src/constants/urls";
import { HTTP_TIMEOUT } from "src/utils/timeout";

export class CustomHttp {
  private baseUrl : string;
  private header : AxiosRequestHeaders;
  constructor(
    base_url : string, //hyphen-booster url
    header : AxiosRequestHeaders | null = null,
    private readonly httpSvc : HttpService | null = new HttpService
  ) {
    this.baseUrl = base_url
    this.header = header
  }

  async get(
    endPoint : string,
    params : Object | null = {},
    data : any | null = {},
  ) : Promise<AxiosResponse<any> | number> {
    try {
      return await lastValueFrom(await this.httpSvc.get(
        `${this.baseUrl}/${endPoint}` ,
        {
          headers : this.header,
          params : params,
          timeout : HTTP_TIMEOUT,
          data : data
        }
      ).pipe(map(({data}) => data)))
    } catch(e) {
      return e.response.status ? e.response.status : 400
    }
  }

  async post(
    endPoint : string , 
    body : Object | null = {} , 
    params : Object | null = {}
  ) : Promise<AxiosResponse<any> | number> {
    try {
      return await lastValueFrom(await this.httpSvc.post(
        `${this.baseUrl}/${endPoint}` ,
        {
          ...body
        },
        {
          headers : this.header,
          params : params,
          timeout : HTTP_TIMEOUT
        },
      ).pipe(map(({data}) => data)))
    } catch(e) {
      /**
       * status를 찾을 수 없는 경우가 있음
       * 어떤 경우인지를 특정할 수 없기 때문에 프로세싱이 멈춘 곳에서 다시 불러와야 될 것 같음
       */
      return e?.response?.status ? e?.response?.status : 400
    }
  }

  async hyphenTokenRefresh() : Promise<AxiosResponse<any> | number> {
    try {
      return await lastValueFrom(await this.httpSvc.post(
        `https://api.hyphen.im/oauth/token`,
        {
          user_id : Constants.HYPHEN_ID,
          hkey : Constants.HYPHEN_KEY //HYPHEN_KEY
        },
        {
          headers : {
            'Content-Type':'application/json'
          }
        }
      ).pipe(map(({data}) => data)))
    } catch(e) {
      console.log(e);
      return e.response.status ? e.response.status : 400;
    }
  }

  async kstaTokenRefresh() : Promise<AxiosResponse<any> | number> {
    try {
      return await lastValueFrom(await this.httpSvc.post(
        `${this.baseUrl}/ksta/getKsToken` ,
        {
          usr_id: Constants.KSTA_ID,
          usr_splm_inf_10_vl_1: Constants.KSTA_KEY
        },
        {
          headers : this.header,
        }
      ).pipe(map(({data}) => data)))
    } catch(e) {
      return e.response.status ? e.response.status : 400
    }
  }
}