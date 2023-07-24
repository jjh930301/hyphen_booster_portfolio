import { Response as Res } from 'express';
import { Constants } from 'src/constants/constants';

export class ApiRes {
  constructor(
    public res: Res,
    public status_code: number,
    public message: Array<string>,
    public result_code?: number,
    public payload?: any,
  ) {}

  static _500(
    res: Res,
    message: string,
    result_code: number | null = null,
  ): any {
    console.error(`status: 500, message: ${message}`);
    const response = new ApiRes(res, 500, [message], null, result_code);
    return response.json;
  }

  public send() {
    if (this.status_code >= 200 && this.status_code < 300) {
      if(Constants.ENV !== 'production') {
        console.log(`${this.status_code}, ${this.message}`);
      }
    } else {
      console.error(`${this.status_code}, ${this.message}`);
    }

    return this.res.status(this.status_code).json({
      message: this.message,
      result_code: this.result_code,
      payload: this.payload,
    });
  }

  static end(
    res : Res
  ) {
    res.end();
  }

  public get json() {
    return this.res.status(this.status_code).json({
      message: this.message,
      result_code: this.result_code,
      payload: this.payload,
    });
  }
}
