export const parseKoreaDate = (date : string) => {
  const arr = date.split('-');
  return `${arr[0]}년 ${arr[1]}월 ${arr[2]}일`
}