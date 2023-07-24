import { ApiProperty } from "@nestjs/swagger";

export type Constructor<I> = new (...args: any[]) => I

type Response = {
  message : [string],
  result_code : number,
}

export function ResponseModel(
): Constructor<Response>{
  class ResModel implements Response {
    @ApiProperty({ example: 2000 })
    readonly result_code: number

    @ApiProperty({ example: ['message'] })
    readonly message: [string];
  }
  return ResModel
}
