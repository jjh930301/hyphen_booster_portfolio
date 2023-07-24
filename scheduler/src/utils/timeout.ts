export const SET_DAY = 3;
export const SET_TIME = 1000 * 30;
export const HTTP_TIMEOUT : number = 1000 * 60 * 60;
//export const timeout = util.promisify(setTimeout)
export const timeout = (time : number | null = 10000) => new Promise((resolve) => setTimeout(resolve, time))