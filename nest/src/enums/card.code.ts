export enum CardCodeString {
  BC = "010001",
  KB = "010002",
  HANA_KEB = "010003", // 하나(구 외환)
  SAMSUNG = "010004",
  SHINHAN = "010005",
  HYUNDAI = "010008",
  LOTTE = "010009",
  CITI_HANMI = "010011", // 비씨
  SUHYUP = "010012", // 비씨
  WOORI = "010014", // 비씨
  NH = "010015", // 국민
  JEJU = "010016", // 비씨
  GWANGJU = "010017", // 비씨
  JEONBUK = "010018", // 비씨
  HANA_HANA = "010024",
  OVERSEAS = "010025",
  CITI_CITI = "010026", // 비씨
}

export enum CardCode {
  BC = "01",
  KB = "02",
  HANA_KEB = "03", // 하나(구 외환)
  SAMSUNG = "04",
  SHINHAN = "05",
  HYUNDAI = "08",
  LOTTE = "09",
  CITI_HANMI = "11", // 비씨
  SUHYUP = "12", // 비씨
  WOORI = "14", // 비씨
  NH = "15", // 국민
  JEJU = "16", // 비씨
  GWANGJU = "17", // 비씨
  JEONBUK = "18", // 비씨
  HANA_HANA = "24",
  OVERSEAS = "25",
  CITI_CITI = "26", // 비씨
}

export enum CardName {
  unknown,
  KB카드,
  비씨카드,
  현대카드,
  하나카드,
  삼성카드,
  신한카드,
  롯데카드,
  농협NH카드,
  우리카드,
  씨티은행
}

export const CardCodeObj = {
  BC : {
    code : "01",
    name : '비씨카드'
  },
  KB : {
    code : "02",
    name : 'KB카드'
  },
  HANA_KEB : {
    code : "03",
    name : '하나카드'
  },
  SAMSUNG : {
    code : "04",
    name : '삼성카드'
  },
  SHINHAN : {
    code : "05",
    name : '신한카드'
  },
  HYUNDAI : {
    code : "08",
    name : '헌대카드'
  },
  LOTTE : {
    code : "09",
    name : '롯데카드'
  },
  CITI_HANMI : {
    code : "11",
    name : '씨티카트'
  },
  SUHYUP : {
    code : "12",
    name : '수협카드'
  },
  WOORI : {
    code : "14",
    name : '우리카드'
  },
  NH : {
    code : "15",
    name : '농협NH카드'
  },
  JEJU : {
    code : "16",
    name : '제주카드'
  },
  GWANGJU : {
    code : "17",
    name : '광주카드'
  },
  JEONBUK : {
    code : "18",
    name : '전북카드'
  },
  HANA_HANA : {
    code : "24",
    name : '하나카드'
  },
  OVERSEAS : {
    code : "25",
    name : '해외카드'
  },
  CITI_CITI : {
    code : "26",
    name : '씨티카드'
  } 
}

// 수정 절대 불가
export const CardCompany = {
  'KB카드' : 1,
  '비씨카드' : 2,
  '현대카드' : 3,
  '하나카드' : 4,
  '삼성카드' : 5,
  '신한카드' : 6,
  '롯데카드' : 7,
  '농협NH카드' : 8,
  '우리카드' : 9,
  '씨티은행' : 10,
}

export const KstaCardCompany = {
  "25" : {
    code : 11,
    name : "해외"
  }, // 해외
  "02" : {
    code : 1,
    name : "KB카드"
  }, // 국민카드
  "01" : {
    code : 2,
    name : "비씨카드"
  }, // 비씨카드
  "11" : {
    code : 2,
    name : "비씨카드"
  },
  "12" : {
    code : 2,
    name : "비씨카드"
  },
  "14" : {
    code : 2,
    name : "비씨카드"
  },
  "16" : {
    code : 2,
    name : "비씨카드"
  },
  "17" : {
    code : 2,
    name : "비씨카드"
  },
  "18" : {
    code : 2,
    name : "비씨카드"
  },
  "08" : {
    code : 3,
    name : "현대카드"
  }, // 현대카드
  "03" : {
    code : 4,
    name : "하나카드"
  }, // 하나카드
  "24" : {
    code : 4,
    name : "하나카드"
  },
  "04" : {
    code : 5,
    name : "삼성카드"
  }, // 삼성카드
  "05" : {
    code : 6,
    name : "신한카드"
  }, // 신한카드
  "09" : {
    code : 7,
    name : "롯데카드"
  }, // 롯데카드
  "15" : {
    code : 8,
    name : "농협NH카드"
  }, // 농협NH카드
  "26" : {
    code : 10,
    name : "씨티은행"
  },
}