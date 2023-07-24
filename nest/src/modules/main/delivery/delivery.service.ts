import { Injectable } from "@nestjs/common";
import { UserBusiness } from "src/entities/booster/user/user.business.entity";
import { User } from "src/entities/booster/user/user.entity";
import { SelectHelper } from "src/helpers/select/select.helper";
import { ServiceData } from "src/models";
import { TokenProvider } from "src/modules/booster/token.provider";
import { DeliveryDepositProvider } from "src/modules/user/delivery/delivery.deposit.provider";
import { DeliveryProvider } from "src/modules/user/delivery/delivery.provider";
import { RegistBaeminDto } from "src/modules/user/dto/regist.baemin.dto";
import { UserProvider } from "src/modules/user/user.provider";
import { encrypt } from "src/utils/crypto";
import { parseDashDate } from "src/utils/date";
import { DataSource } from "typeorm";
import { BaeminService } from "../../user/delivery/baemin.service";
import { DateRangeDto } from "../dto/date.range.dto";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class DeliveryService {

  constructor(
    private readonly tokenPvd : TokenProvider,
    private readonly baeminSvc : BaeminService,
    private readonly userPvd : UserProvider,
    private readonly deliveryPvd : DeliveryProvider,
    private readonly deliveryDepositPvd : DeliveryDepositProvider,
    private readonly datasource : DataSource
  ) {}

  public async registBaemin(
    user : User,
    body : RegistBaeminDto,
    business : UserBusiness | null = null
  ) : Promise<ServiceData> {
    let check = await this.baeminSvc.checkBaemin(body);

    //만료된 토큰일 경우
    if(!check['errYn']) {
      //토큰 발급 후 호출
      check = await this.baeminSvc.checkBaemin(body);
    }
    if(check['errYn'] === 'Y') {
      return ServiceData.invalidRequest(check['errMsg'] , 4104)
    }
    try {
      business.baemin_id = body.baemin_id,
      business.baemin_password = body.baemin_password,
      business.baemin_store_id = body.baemin_store_id ? body.baemin_store_id : null,
      business.baemin_updated_at = new Date(),
      await this.userPvd.changedBusiness(business , {
        baemin_id : body.baemin_id,
        baemin_password : await encrypt(body.baemin_password),
        baemin_store_id : body.baemin_store_id ? body.baemin_store_id : null,
        baemin_updated_at : new Date(),
      })
      
      /**
       * 배민 계정은 배민1 , 배달의민족 때문에 storeId가 두개이기 때문에
       * 그냥 등록시켜주면 됩니다.
       * (수정) 사업자 번호가 들어오는지 안들어오는지만 확인하면 됨
       * 들어오지 않음 그냥 등록
       */
      

      if(!business) {
        return ServiceData.ok(
          'Store id is not match',
          {
            user : null
          },
          4101
        )
      }
      const newUser : User = await this.userPvd.joinById(
        user.id , 
        SelectHelper.user_select
      );
      
      if(!business.baemin_login) {
        await this.userPvd.changedBusiness(
          business,
          {
            baemin_login : true
          }
        ) 
        const biz = await this.userPvd.findBzById(business.id);
        //insert baemin
        this.baeminSvc.insertBaemin(
          user,
          biz
        );
      }
      return ServiceData.ok(
        'Successfully regist baemin account',
        {
          user : newUser
        },
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async dayDelivery(
    business : UserBusiness,
    date : DateRangeDto,
    type : number,
    group : number
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const deliveries = await this.deliveryPvd.dayDelivery(
        business,
        startDate,
        `${endDate} 23:59:59`,
        type,
        group
      )
      if(deliveries) {
        return ServiceData.ok(
          'Successfully getting day delivery',
          {
            deliveries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async expectedPurchase(
    business : UserBusiness,
    date : DateRangeDto,
    type : number,
    group : number
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const deliveries = await this.deliveryPvd.expectedPurchase(
        business,
        startDate,
        `${endDate} 23:59:59`,
        type,
        group
      )
      if(deliveries) {
        return ServiceData.ok(
          'Successfully getting purchase delivery',
          {
            deliveries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async expectedPurchaseList(
    business : UserBusiness,
    date : DateRangeDto,
    page : PaginationDto,
    type : number,
    service : number,
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const total = this.deliveryPvd.rangeSum(business , startDate , endDate , type , String(service));
      const deliveries = this.deliveryPvd.expectedPurchaseList(
        business,
        startDate,
        `${endDate} 23:59:59`,
        page,
        type,
        service
      )
      if(deliveries) {
        return ServiceData.ok(
          'Successfully getting purchase delivery',
          {
            total : await total,
            deliveries : await deliveries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async dayDepositDelivery(
    business : UserBusiness,
    date : DateRangeDto,
    group : number
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const deliveries = await this.deliveryDepositPvd.dayDepositDelivery(
        business,
        startDate,
        `${endDate} 23:59:59`,
        group
      )
      if(deliveries) {
        return ServiceData.ok(
          'Successfully getting deposit delivery',
          {
            deliveries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async depositDeliveryList(
    business : UserBusiness,
    date : DateRangeDto,
    page : PaginationDto,
    service : number
  ) : Promise<ServiceData> {
    try {
      const startDate = parseDashDate(date.start_date);
      const endDate = parseDashDate(date.end_date);
      const deliveries = await this.deliveryDepositPvd.depositDeliveryList(
        business,
        startDate,
        `${endDate} 23:59:59`,
        page,
        service
      )
      if(deliveries) {
        return ServiceData.ok(
          'Successfully getting deposit delivery',
          {
            deliveries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async dayDeliveries(
    business : UserBusiness,
    date : DateRangeDto,
    page : PaginationDto,
    type : number, // 온라인 , 오프라인
    service : string, // 서비스타입
    order_type : number,
    word : string,
  ) : Promise<ServiceData> {
    try {
      const startDate =  date.start_date ? parseDashDate(date.start_date) : null;
      const endDate = date.end_date ? parseDashDate(date.end_date) : null;
      const dayDeliveries = this.deliveryPvd.dayDeliveries(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        page,
        type ,
        service,
        order_type,
        word
      );
      const sum = await this.deliveryPvd.rangeSum(
        business,
        startDate !== '--' ? startDate : null,
        endDate !== '--' ? `${endDate} 23:59:59` : null,
        type ,
        service,
        order_type,
        word
      );
      if(dayDeliveries) {
        return ServiceData.ok(
          'Succssfully getting deliveries',
          {
            total : sum['total'],
            onlineTotal : sum['onlineTotal'],
            offlineTotal : sum['offlineTotal'],
            success : sum['success'],
            failure : sum['failure'],
            allCnt : sum['allCnt'],
            deliveries : await dayDeliveries
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}