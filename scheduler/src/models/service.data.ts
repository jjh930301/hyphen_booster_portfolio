import { HttpStatus } from '@nestjs/common';
import { Response as Res } from 'express';
import { ApiRes } from './api.response';

export class ServiceData {
  /**
   *
   * @param status Response Status Code
   * @param message Response Message
   * @param payload Response Body JSON data
   * @param result_code Response Result Code
   */
  constructor(
    public status: number,
    private message: string,
    public payload?: any | null,
    private result_code?: number | null,
  ) { }

  /**
   * 일반적으로 요청이 올바르지 못한 경우
   */
  static invalidRequest = (
    message: string,
    result_code: number | null = null,
  ) => {
    return new ServiceData(HttpStatus.BAD_REQUEST, message, {result:null}, result_code);
  };

  /**
   * 요청한 데이터가 존재하지 않을 때
   */
  static noModelFound = (name: string) => {
    return new ServiceData(
      HttpStatus.BAD_REQUEST,
      `no ${name} found`,
      {result:null},
      4001,
    );
  };

  /**
   * 로그인 등 Authentication에 실패 했을 경우
   */
  static notAuthorized = (message : string | null = "") => {
    return new ServiceData(
      HttpStatus.UNAUTHORIZED,
      `authentication failed${message}`,
      {result:null},
      4001,
    );
  };

  static cannotAccess = (
    message : string | null = "",
    result_code : number | null = 4000
  ) => {
    return new ServiceData(
      HttpStatus.FORBIDDEN,
      `Access denied${message}`,
      {result:null},
      result_code
    )
  }

  /**
   * 클라이언트 Request의 Body에 필수요청 데이터가 누락된 경우
   */
  static missingRequestBody = (name: string | null = 'check all') => {
    return new ServiceData(
      HttpStatus.BAD_REQUEST,
      `missing body data found${` - (${name}`})`,
      {result:null},
      4002,
    );
  };

  /**
   * 클라이언트 Request의 Body에 필수요청 데이터가 유효하지 않은 경우
   */
  static invalidRequestData = (name: string) => {
    return new ServiceData(
      HttpStatus.BAD_REQUEST,
      `invalid ${name} found`,
      {result:null},
      4003,
    );
  };

  /**
   * hyphen 서버에서 받아온 데이터 리턴
   */
  static httpOk = (
    message : string | null = "Successfully getting hyphen data",
    data: any | null = null,
  ) => {
    return new ServiceData(
      HttpStatus.OK, 
      message, 
      data.data, 
      2101
    );
  };

  static httpError = (
    message : string,
    data : any
  ) => {
    return new ServiceData(
      HttpStatus.BAD_GATEWAY,
      message,
      data,
      5001
    )
  }

  /**
   * 요청응답이 200이어서 OK일때
   */
  static ok = (
    message: string,
    payload: any | null = null,
    result_code: number | null = null,
  ) => {
    return new ServiceData(HttpStatus.OK, message, payload, result_code);
  };

  /**
   * 요청응답이 200이어서 OK일때
   */
  static successfullyFetched = (
    name: string,
    payload: any,
    result_code: number | null = null,
  ) => {
    return new ServiceData(
      HttpStatus.OK,
      `${name} successfully fetched`,
      payload,
      result_code,
    );
  };

  /**
   * 새로운 데이터를 DB에 입력할 때
   */
  static dataRegistered = (name: string, payload: any) => {
    return new ServiceData(
      HttpStatus.CREATED,
      `${name} successfully registered`,
      payload,
    );
  };

  /**
   * 데이터를 수정했을 때
   */
  static successModify = (message: string, paylod: any , result_code : number) => {
    return new ServiceData(
      HttpStatus.OK,
      `${message}`,
      paylod
    )
  }

  /**
   * 서버 에러 응답을 보낼 때
   */
   static serverError = (
    message: string | null = "Unknown Error", 
    result_code: number | null = 5101
  ) => {
    return new ServiceData(
      HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      {result:null},
      result_code,
    );
  };

  /**
   * 서버에서 CRUD중 에러가 났을 경우
   */
  static serverCrudError = () => {
    return new ServiceData(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `CRUD error`,
      {result:null},
      5001,
    );
  };

  apiResponse = (res: Res): ApiRes =>
    new ApiRes(
      res,
      this.status,
      [this.message],
      this.result_code,
      this.payload,
    );
}
