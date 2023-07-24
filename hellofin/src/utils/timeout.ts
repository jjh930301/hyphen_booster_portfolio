export const SET_TIME = 1000 * 60;
export const HTTP_TIMEOUT : number = 1000 * 60 * 20;
export const timeout = async (time : number | null = 3000) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

