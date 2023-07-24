import { DateRangeDto } from "src/modules/dto/date.rage.dto"



export const parseMonth = (month : number) => {
  return month < 9 ? `0${month + 1}` : `${month +1}`
  
}

export const parseDay = (day : number) => {
  return String(day).length === 2 ? `${day}` : `0${day}`
}

//yyyymmdd
export const parseDashDate = (date : string) => {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  return `${year}-${month}-${day}`;
}

export const parseColonTime = (time : string) => {
  const hour = time.substring(0,2);
  const min = time.substring(2,4);
  let sec = time.substring(4,6);
  if (!sec) {
    sec = '00'
  }
  return `${hour}:${min}:${sec}`;
}

export const parseDate = (date : Date | string) => {
  if(date instanceof Date) {
    return `${date.getFullYear()}${parseMonth(date.getMonth())}${parseDay(date.getDate())}`;
  }
  if(typeof(date) === 'string') {
    const year = date.substring(0 , 4);
    const month = date.substring(5 , 7);
    const day = date.substring(7 , 9);
    return `${year}${month}${day}`;
  }
}

export const insertLoopDateParser = (date : Date) : DateRangeDto => {
  //first
  const startDate = new Date(date.getFullYear() , date.getMonth() - 1 , 1);
  const start = parseDate(startDate)
  //last
  const endDate = new Date(date.getFullYear() , date.getMonth() , 0);
  const end = parseDate(endDate);
  //create DateRangeDto
  const dateRange = new DateRangeDto();
  dateRange.end_date = end;
  dateRange.start_date = start;

  return dateRange;
}

export const datetimeNow = () => {
  var today = new Date();
  today.setHours(today.getHours() + 9);
  return today.toISOString().replace('T', ' ').substring(0, 19);
}