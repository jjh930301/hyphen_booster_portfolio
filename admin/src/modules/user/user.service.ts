import { ConflictException, Injectable } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { Endpoint } from 'src/constants/endpoint';
import { Urls } from 'src/constants/urls';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { SelectHelper } from 'src/helpers/select/select.helper';
import { ServiceData } from 'src/models';
import { CustomHttp } from 'src/models/custom.http';
import { insertLoopDateParser, parseDashDate, parseDate } from 'src/utils/date';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../dashboard/dto/date.range.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchDto } from './dto/search.dto';
import { TestBusinessDto } from './dto/test.business.dto';
import { UserTypesDto } from './dto/user.types.dto';
import { UserBusinessProvider } from './user.business.provider';
import { UserProvider } from './user.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly userPvd : UserProvider,
    private readonly businessPvd : UserBusinessProvider,
    private readonly datasource : DataSource,
  ){}

  public async users(
    page : PaginationDto,
    date : DateRangeDto,
    types : UserTypesDto,
    search : SearchDto
  ) : Promise<ServiceData> {
    try {
      let startDate = null;
      let endDate = null;
      if(date.end_date && date.start_date) {
        startDate = parseDashDate(date.start_date);
        endDate = `${parseDashDate(date.end_date)} 23:59:59`;
      }
      const count = this.userPvd.userCount(types , startDate , endDate , search);
      const users = this.userPvd.users(page , types , startDate , endDate , search);
      if(users) {
        return ServiceData.ok(
          'Successfully getting users',
          {
            count : await count,
            users : await users
          },
          2101 
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      console.log(e)
      return ServiceData.serverError();
    }
  }

  public async detailUser(id : string) : Promise<ServiceData> {
    try {
      const user = await this.userPvd.detailUser(id);
      user.businesses.map(biz => {
        if(biz.banks.length !== 0) {
          biz.banks.map(bank => {
            bank.account = bank.account.substring(0 , 4) + 
            "****" + 
            bank.account.substring(bank.account.length - 4 , bank.account.length)
            if(bank.cert) {
              bank.cert = null
              bank["login_type"] = "cert"
            }
            if(bank.bank_id) {
              bank.bank_id = null
              bank["login_type"] = "id"
            }
          })
        }
      });
      if(user) {
        return ServiceData.ok(
          'Successfully getting user',
          {
            user
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async changedStatus(
    id : string,
    status : number
  ) : Promise<ServiceData>{
    try {
      const update = await this.userPvd.changedStatus(id , {type : status})
      if(update.affected === 1) {
        return ServiceData.ok(
          `Successfully changed status ${status}`,
          {
            result : status
          },
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  private async checkBusinessHyphen(businessNumber : string) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        // Authorization : `Bearer ${await this.tokenPvd.getToken()}`,
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    return await http.post(
      Endpoint.CHECK_BUSINESS_HYPHEN,
      {
        bizNo : businessNumber
      }
    )
  }

  public async testBusiness(
    userId : string,
    body : TestBusinessDto
  ) : Promise<ServiceData> {
    const user = await this.userPvd.joinById(
      userId,
      [
        ...SelectHelper.user_select,
        'devices.password',
        'devices.fail_count'
      ]
    );
    if (!user) return ServiceData.cannotAccess("not found user" , 2101);
    // 사업자 번호 확인 로직 hyphen
    let check = await this.checkBusinessHyphen(body.business_number);

    if(check['error']) {
      check = await this.checkBusinessHyphen(body.business_number);
    } 
    // 과세 유형이 없는 경우
    if(check['out']['taxTypeCd'] === '') {
      return ServiceData.invalidRequest(`Cannot regist business number ${body.business_number}`, 4104 , 'user')
    }
    const bizCheck = user.findBusinessNum(body.business_number);
    if(bizCheck) {
      return ServiceData.ok(
        'Already regist business number' , 
        {businesses : null}, 
        2102
      )
    }

    try {
      const databaseCheck = await this.businessPvd.databaseBizNoCheck(body.business_number);
      if(databaseCheck) {
        return ServiceData.ok(
          '이미 등록된 사업자 번호입니다 관리자에 문의하세요.',
          {
            user : null,
            other_business : {
              store_name : databaseCheck['user_businesses_store_name'],
              name : databaseCheck['users_name'],
              mobile : databaseCheck['users_mobile'],
            }
          }, 
          2103
        )
      }
      const business : UserBusiness = await this.businessPvd.createBusiness(user ,body , Number(check['out']['taxTypeCd']));//Number(check['out']['taxTypeCd'])
      if(business) {

        //ksnet 토큰 발급
        const token = await new CustomHttp(Urls.POS,{
            Authorization : Constants.hyphen_access_token,
            SecretKey : Constants.hyphen_secret
        }).post(
          Endpoint.POS_TOKEN,
          {
            usr_id : Constants.KSTA_ID
          }
        )
        
        const isKsnet = await new CustomHttp(Urls.KSTA , {
          Authorization : `Bearer ${token['data']}`,
        }).post(
            Endpoint.KSNET_USER_CHECK , 
          {
            rqs_hdr : Constants.RQS_HDR, 
            rqs_data:{ 
              bzpr_no: body.business_number
            }
          }
        )

        //ksnet사용자일 경우
        if(isKsnet['rspd_hdr']['rc'] === '0') {
          business.is_ksnet = 1;
          business.type = 1;
          await this.userPvd.changedBusiness(business , {
            is_ksnet : 1,
            type : 1,      
          })
          const model = await this.userPvd.joinById(
            user.id,
            SelectHelper.user_select
          );
          const payload = {
            user : model
          }
          return ServiceData.ok(
            'Successfully regist business[ksnet]',
            payload,
            2000
          )
        } else {
          const model = await this.userPvd.joinById(
            user.id,
            SelectHelper.user_select
          );
          const payload = {
            user : model
          }
          return ServiceData.ok(
            'Successfully regist business',
            payload ,
            2101
          );
        }
      }
      throw new ConflictException()
      
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
