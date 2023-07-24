export const HTTP_TIMEOUT : number = 1000 * 60 * 60;
export const timeout = async (time : number | null = 3000) => {
  new Promise(resolve => setTimeout(resolve, time))
}