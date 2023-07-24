import { ConflictException, Injectable } from '@nestjs/common';
import { Constants } from 'src/constants/constants';
import { Endpoint } from 'src/constants/endpoint';
import { Urls } from 'src/constants/urls';
import { UserBusiness } from 'src/entities/booster/user/user.business.entity';
import { UserDevice } from 'src/entities/booster/user/user.device.entity';
import { User } from 'src/entities/booster/user/user.entity';
import { SelectHelper } from 'src/helpers/select/select.helper';
import { ServiceData } from 'src/models';
import { CustomHttp } from 'src/models/custom.http';
import { ACCOUNT_TYPE } from 'src/utils/account';
import { compare } from 'src/utils/crypto';
import { parseDate } from 'src/utils/date';
import { DataSource } from 'typeorm';
import { TokenProvider } from '../booster/token.provider';
import { WithdrawFeedbackProvider } from '../feedback/withdraw.feedback.provider';
import { AlertProvider } from './alert/alert.provider';
import { ChangedBusinessNameDto } from './dto/changed.business.name.dto';
import { ChangedDeviceNameDto } from './dto/changed.device.name.dto';
import { ChangedDevicePasswordDto } from './dto/changed.device.password.dto';
import { ChangedTokenDto } from './dto/changed.token.dto';
import { RegistBusinessDto } from './dto/regist.business.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { UserProvider } from './user.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly userPvd : UserProvider,
    private readonly datasource : DataSource,
    private readonly tokenPvd : TokenProvider,
    private readonly alertPvd : AlertProvider,
    private readonly withdrawPvd : WithdrawFeedbackProvider,
  ){}

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

  private async checkNewBusinessHyphen(
    businessNumber : string,
    userName : string,
    opened_at : string,
  ) {
    const http = await new CustomHttp(
      Urls.HYPHEN_DATA_MARKET,
      {
        'user-id' : Constants.HYPHEN_ID,
        Hkey : Constants.HYPHEN_KEY
      }
    );
    return await http.post(
      Endpoint.NEW_CHECK_BUSINESS_HYPHEN,
      {
        b_no : businessNumber,
        p_nm : userName,
        start_dt : opened_at
      }
    )
  }

  public async checkKsnet(
    business : UserBusiness
  ) : Promise<ServiceData> {
    try {
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
            bzpr_no: business.business_number
          }
        }
      )
      if(isKsnet['rspd_hdr']['rc'] === '0') {
        
        return ServiceData.ok(
          'Ksnet user',
          {result : true},
          2000
        )
      } 
      return ServiceData.ok('Not found ksnet user' , {result : false} , 2102);
    } catch(e) {
      return ServiceData.serverError();
    }
  }
  
  public async registKsnet(
    user : User,
    business : UserBusiness,
    agree : number,
  ) : Promise<ServiceData> {
    if(agree !== 1) {
      return ServiceData.ok(
        'Disagree ksnet data',
        {
          result : false
        },
        2102
      );
    }
    let token = await new CustomHttp(Urls.POS,{
        Authorization : Constants.hyphen_access_token,
        SecretKey : Constants.hyphen_secret
    }).post(
      Endpoint.POS_TOKEN,
      {
        usr_id : Constants.KSTA_ID
      }
    )
    try {
      //유저를 체크할 token이 null이거나 pos server가 동작하지 않았을 때
      if(!token['success'] || token['data'] === null) {
        return ServiceData.httpError('Invalid pos server' , {result : null});
      }
      const auth = await new CustomHttp(Urls.KSTA , {
        Authorization : `Bearer ${token['data']}`
      }).post(Endpoint.KSNET_USER_AUTHORIZATION , {
        rqs_hdr : Constants.RQS_AUTH_HDR, 
        rqs_data:{ 
          bzpr_no: business.business_number,
          // 인증 Y , 해제 N
          cer_yn : 'Y'
        }
      })
      // 사용자를 찾을 수 없거나 값을 잘못 넣었을 때
      if(auth['rspd_hdr']['rc'] !== '0' || !auth['rspd_hdr']['rc']) {
        return ServiceData.ok('Not found Ksnet member' , {result : null} , 2103)
      } else if(auth['rspd_hdr']['rc'] === '-4') {
        //ksnet 토큰 만료
        return ServiceData.httpError(
          'Ksnet token expried try again',
          {result : null}
        );
      }
      //정상 처리
      if(auth['rspd_hdr']['rc'] === '0') {
        await this.userPvd.changedBusiness(business , {
          agreemented_at : new Date(),
          is_ksnet : agree,
          type : 1 // ksnet
        })
      }
      // const bizCreatedAt = new Date(new Date().setMonth(business.created_at.getMonth() + 1));
      // 1년 단위의 KstaData를 한번에 db에 적재하는 API, 적재 후 조회하면 적재된 데이터를 db에서 반환할 수 있도록 도와줌
      // const startDate = new Date(new Date().setFullYear(new Date().getFullYear()-1));
      const http = new CustomHttp(Urls.POS , {
        Authorization : Constants.hyphen_access_token,
        SecretKey : Constants.hyphen_secret
      })
      //카드
      http.post(Endpoint.POS_CARD , {
        user_id: business.business_number,
        startDate: parseDate(new Date())
      })
      //현금
      http.post(Endpoint.POS_CASH , {
        user_id: business.business_number,
        startDate: parseDate(new Date())
      })
      
      return ServiceData.ok(
        'Successfully regist ksnet user',
        {
          result : true
        },
        2101
      )

    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async removeKsnet(
    user : User,
    business : UserBusiness,
  ) : Promise<ServiceData> {
    let token = await new CustomHttp(Urls.POS,{
        Authorization : Constants.hyphen_access_token,
        SecretKey : Constants.hyphen_secret
    }).post(
      Endpoint.POS_TOKEN,
      {
        usr_id : Constants.KSTA_ID
      }
    )
    try {
      //유저를 체크할 token이 null이거나 pos server가 동작하지 않았을 때
      if(!token['success'] || token['data'] === null) {
        return ServiceData.httpError('Invalid pos server' , {result : null});
      }
      const auth = await new CustomHttp(Urls.KSTA , {
        Authorization : `Bearer ${token['data']}`
      }).post(Endpoint.KSNET_USER_AUTHORIZATION , {
        rqs_hdr : Constants.RQS_AUTH_HDR, 
        rqs_data:{ 
          bzpr_no: business.business_number,
          // 인증 Y , 해제 N
          cer_yn : 'N'
        }
      })
      // 사용자를 찾을 수 없거나 값을 잘못 넣었을 때
      if(auth['rspd_hdr']['rc'] !== '0' || !auth['rspd_hdr']['rc']) {
        return ServiceData.ok('Not found Ksnet member' , {result : null} , 2103)
      } else if(auth['rspd_hdr']['rc'] === '-4') {
        //ksnet 토큰 만료
        return ServiceData.httpError(
          'Ksnet token expried try again',
          {result : null}
        );
      }
      //정상 처리
      if(auth['rspd_hdr']['rc'] === '0') {
        await this.userPvd.changedBusiness(business , {
          // agreemented_at : new Date(),
          is_ksnet : 0,
          type : 0 // ksnet
        })
      }
      
      return ServiceData.ok(
        'Successfully remove ksnet',
        {
          result : true
        },
        2101
      )

    } catch(e) {
      return ServiceData.serverError();
    }
  }
    
  public async business(
    user : User,
    body : RegistBusinessDto
  ) : Promise<ServiceData> {
    // (수정)하이픈데이터마켓 사업자 번호 조회
    let newCheck = await this.checkNewBusinessHyphen(
      body.business_number,
      user.name,
      body.opened_at
    )
    if(!newCheck['data']['valid_cnt']) {
      return ServiceData.invalidRequest('Info is not match',4103, 'user');
    }
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
      const databaseCheck = await this.userPvd.databaseBizNoCheck(body.business_number);
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
      const business : UserBusiness = await this.userPvd.createBusiness(body , user.id , Number(check['out']['taxTypeCd']));//Number(check['out']['taxTypeCd'])
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
              bzpr_no: business.business_number
            }
          }
        )

        //ksnet사용자일 경우
        if(isKsnet['rspd_hdr']['rc'] === '0') {
          
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
      console.log(e);
      return ServiceData.serverError();
    }
  }

  public async changedBusinessInfo(
    user : User,
    body : ChangedBusinessNameDto
  ) : Promise<ServiceData> {
    const business : UserBusiness = user.getBusiness(body.id);
    if(!business) {
      return ServiceData.invalidRequest(
        'BusinessId not match',
        4101,
        'user',
      );
    }
    try {
      if(body.name) {
        await this.userPvd.changedBusiness(business , {
          store_name : body.name
        })
      }

      const model = await this.userPvd.joinById(
        user.id,
        SelectHelper.user_select
      );

      return ServiceData.ok(
        'Successfully changed business info',
        {
          user : model
        },
        2101
      )

    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async changedDeviceInfo(
    user : User,
    body : ChangedDeviceNameDto | ChangedDevicePasswordDto | ChangedTokenDto
  ) : Promise<ServiceData> {
    try {
      const device : UserDevice = user.getDevice(body.device_id);
      if(!device) 
        return ServiceData.invalidRequest(`user has not ${body.device_id}`,4101 , 'user');
      if(body['device_name']) {
        await this.userPvd.changedDevice(device , {
          device_name : body['device_name']
        })
      }
      if(body['password']) {
        await this.userPvd.changedDevice(device , {
          password : body['password']
        })
      }
      if(body['token']) {
        await this.userPvd.changedDevice(device , {
          token : body['token']
        })
      }

      const model = await this.userPvd.joinById(
        user.id,
        SelectHelper.user_select
      );

      return ServiceData.ok(
        'Successfully changed device info',
        {
          user : model
        },
        2101
      )

    } catch(e) {
      return ServiceData.serverError(e);
    }
  }

  public async disconnectAccount(
    business : UserBusiness,
    user : User,
    type : number
  ) : Promise<ServiceData> {
    try {
      const account = ACCOUNT_TYPE[type];
      if(!account) {
        return ServiceData.invalidRequest('Cannot find type' ,4104, 'user');
      }
      await this.userPvd.changedBusiness(business , {
        ...account
      })
      
      const model = await this.userPvd.joinById(
        user.id,
        SelectHelper.user_select
      );
      if(model) 
        return ServiceData.ok(
          'Successfully disconnect account' , 
          {
            user : model
          },
          2101
        );
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async checkPassword(
    device : UserDevice,
    password : string,
  ) : Promise<ServiceData> {
    try {
      if(5 <= device.fail_count) {
        return ServiceData.ok('Required changed password' , {result : 101} , 4004);
      }
      const check = await compare(password , device.password);
      if(!check) {
        await this.userPvd.changedDevice(device , {
          fail_count : device.fail_count + 1
        })
        return ServiceData.ok("Check your password" , {result : device.fail_count} , 4001)
      }
      return ServiceData.ok('Successfully check password' , {result : 100} , 2101);
    } catch(e) {
      return ServiceData.serverError();
    }
  }
  public async device(deviceId) : Promise<ServiceData> {
    try {
      const device = await this.userPvd.findDeviceById(deviceId)
      if(device) {
        return ServiceData.ok(
          'Successfully getting device info',
          {
            device
          },
          2101
        )
      }
      return ServiceData.invalidRequest('Not found device' , 4102)
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async detailBusiness(
    id : string
  ) {
    try {
      const business = await this.userPvd.findDetailBusiness(id);
      if(business) {
        return ServiceData.ok(
          'Successfully getting detail business info',
          {business},
          2101
        )
      }
      return ServiceData.timeout();
    } catch(e) {
      return null;
    }
  }

  public async logout(deviceId : string) : Promise<ServiceData> {
    try {
      const device = await this.userPvd.removeDevice(deviceId);
      if(device.affected !== 0) {
        return ServiceData.ok(
          'Successfully remove device',
          {
            result : true
          },
          2101
        )
      }
      return ServiceData.invalidRequest('Not found device_id' , 4101);
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async removeUser(
    user : User,
    body : WithdrawDto
  ) : Promise<ServiceData> {
    try {
      const remove = await this.userPvd.softDelete(user);
      await this.withdrawPvd.createFeedback(user , body);
      if(remove){
        return ServiceData.ok('Successfully remove user' , {result : true} , 2101)
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }

  public async removeBusiness(
    business : UserBusiness
  ) : Promise<ServiceData> {
    try {
      const remove = await this.userPvd.removeBusiness(business);
      if(remove.affected === 1) {
        return ServiceData.ok('Successfully remove business' , {result : true} , 2101);
      }
      return ServiceData.timeout();
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
