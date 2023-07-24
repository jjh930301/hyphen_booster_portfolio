import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { ApiRes, ServiceData } from "src/models";
import { DateRangeDto } from "../dto/date.range.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { DeliveryService } from "./delivery.service";
import { DeliveryTypeDto } from "./dto/delivery.type.dto";
import { SearchDeliveryDto } from "./dto/search.delivery,dto";
import { ServiceTypeDto } from "./dto/service.type.dto";
import { ServiceTypeListDto } from "./dto/service.type.list.dto";
import { DeliveriesResponse } from "./response/deliveries.response";
import { DeliveryDateResponse } from "./response/delivery.date.response";
import { DeliveryDepositListResponse } from "./response/delivery.deposit.list.response";
import { DeliveryDepositResponse } from "./response/delivery.deposit.response";
import { DeliveryPurchaseReseponse } from "./response/delivery.purchase.response";

@ApiTags('delivery')
@ApiBearerAuth("Required user accessToken")
@Controller()
export class DeliveryController {
  constructor(
    private readonly deliverySvc : DeliveryService
  ){}

  @ApiOperation({
    summary : '기간별 배달 결제 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryDateResponse
  })
  @Get('date/:business_id')
  async dayDelivery(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() type : DeliveryTypeDto, 
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.dayDelivery(
        business,
        date,
        type.payment_type,
        0
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '타입별 배달 결제 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryDateResponse
  })
  @Get('type/:business_id')
  async typeDelivery(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() type : DeliveryTypeDto,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.dayDelivery(
        business,
        date,
        type.payment_type,
        1
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '배달 상세 리스트 ** 값 확인',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveriesResponse
  })
  @Get('list/:business_id')
  async dayDeliveries(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() page : PaginationDto,
    @Query() type : DeliveryTypeDto,
    @Query() service : ServiceTypeListDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.dayDeliveries(
        business,
        date,
        page,
        type.payment_type, // 1 온라인 2 오프라인
        service.services,
        null, // 1 성공 2 취소 3 처리중
        null, // 검색할 단어
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }

  @ApiOperation({
    summary : '기간별 배달 입금 예정 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryPurchaseReseponse
  })
  @Get('purchase/date/:business_id')
  async expectedPurchase(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() type : DeliveryTypeDto,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.expectedPurchase(
        business,
        date,
        type.payment_type,
        0
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '타입별 배달 입금 예정 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryPurchaseReseponse
  })
  @Get('purchase/type/:business_id')
  async expectedTypePurchases(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() type : DeliveryTypeDto,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.expectedPurchase(
        business,
        date,
        type.payment_type,
        1
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '배달 입금 예정 상세 리스트',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryPurchaseReseponse
  })
  @Get('purchase/list/:business_id')
  async expectedPurchaseList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() type : DeliveryTypeDto,
    @Query() page : PaginationDto,
    @Query() service : ServiceTypeDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.expectedPurchaseList(
        business,
        date,
        page,
        type.payment_type,
        service.service
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '기간별 배달 입금내역 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryDepositResponse
  })
  @Get('deposit/date/:business_id')
  async dayDepositDelivery(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.dayDepositDelivery(
        business,
        date,
        0
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '타입별 배달 입금내역 조회',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryDepositResponse
  })
  @Get('deposit/type/:business_id')
  async typeDepositDelivery(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.dayDepositDelivery(
        business,
        date,
        1
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '배달 입금내역 상세 리스트',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveryDepositListResponse
  })
  @Get('deposit/list/:business_id')
  async depositDeliveryList(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() page : PaginationDto,
    @Query() service : ServiceTypeDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.depositDeliveryList(
        business,
        date,
        page,
        service.service
      );
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res, e.toString());;
    }
  }

  @ApiOperation({
    summary : '배달 검색',
    description : `
      5101 : server error
      4101 : businessId not match
    `
  })
  @ApiResponse({
    type : DeliveriesResponse
  })
  @Get('search/:business_id')
  async searchDeliveries(
    @Res() res,
    @Req() req,
    @Param('business_id') businessId : string,
    @Query() date : DateRangeDto,
    @Query() page : PaginationDto,
    @Query() service : ServiceTypeListDto,
    @Query() type : DeliveryTypeDto,
    @Query() search : SearchDeliveryDto
  ) {
    try {
      const user : User = req.user;
      const business : UserBusiness = user.getBusiness(businessId);
      if(!business) {
        return ServiceData.invalidRequest(
          'BusinessId not match',
          4101
        ).apiResponse(res).send();
      }
      const serviceData = await this.deliverySvc.dayDeliveries(
        business,
        date,
        page,
        type.payment_type,
        service.services,
        search.order_type,
        search.word
      )
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}