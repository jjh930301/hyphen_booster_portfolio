import { CustomHttp } from "src/models/custom.http";

export const hyphenTokenRefresh = async () : Promise<string> => {
  const hyphenToken = await new CustomHttp('`https://api.hyphen.im/oauth/token`').hyphenTokenRefresh();
  console.log('hyphen token refresh')
  return hyphenToken['access_token'];
}