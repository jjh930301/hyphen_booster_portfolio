import * as Crypto from 'crypto-js';
import { Constants } from 'src/constants/constants';
import bcrypt from 'bcryptjs';

export const encrypt = async (value) : Promise<string> => {
  return await Crypto.AES.encrypt(value , Constants.SECRET).toString();
}

export const decrypt = async (value) : Promise<string> => {
  return await Crypto.AES.decrypt(value , Constants.SECRET).toString(Crypto.enc.Utf8);
}

export const hash = async (value) : Promise<string> => {
  const salt = bcrypt.genSaltSync(12);
  return await bcrypt.hashSync(value,salt);
}

export const compare = async(value , hash) => {
  return await bcrypt.compareSync(value , hash);
}