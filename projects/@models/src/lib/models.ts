export interface Member {
  id?: string | number;
  memberShipType: string;
  insurancetype: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  nickName?: string;
  legalSex?: string;
  DOB?: string;
  emrID?: number;
  DL?: string;
  mbrshpStartDate?: string;
  mbrshpEndDate?: string;
  address?: string;
  phone?: string;
  email?: string;
  avatar: string;
  emrContact?: string;
  emrRelationship?: string;
  emrPhone?: string;
  instructions?: string;
  memberTypeDesc: string;
  inKalani?: boolean;
  inHS?: boolean;
  membTypeIcon: string;
  membershiptypesIcon: string;
  membertype: string;
  fullAddress?: string;
  memberTypeTypeDesc?: string;
  barcode?: string;
  notes?: string;
  expired? : boolean;

}

export interface Trip {
  id?: number;
  rider_id?: number;
  driver?: string;
  seStatus: string;
  name?: string;
  pickupDate?: string;
  pickupTime?: string;
  apptDate?: string;
  apptTime?: string;
  pickAddress?: string;
  dropAddress?: string;
  phone?: string;
  Passengers?: number;
  reason?: string;
  miles?: number;
  instructions: string;
  rtnTrip?: string;
  lastUpdate?: Date;
  
}

export interface Rider {
  id?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  fullAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  Reason?: string;
  Miles?: number;
  instructions?: string;
  seStatus?: string;
  count?: number;
  canceled?: number;
  LastUpdate?: Date;
}

export interface RideStatus {
  Status?: number;
  StatusText?: string;
  icon?: string;
}

export interface pointTransaction {
  type?: 'points' | 'dps'; // Make optional
  tran_type: 'MEMBERSHIP' | 'REDEEM' | 'EARN' | 'PURCHASE';
  memberId?: string | number;
  id?: number | null;
  transactiondate?: string;
  amtpaid?: number;
  method?: string;
  daypass?: number;
  points?: number;
  mbrshpStartDate?: string;
  mbrshpEndDate?: string;
  notes?: string;
}

export interface  vehiclesodometer {
  id? : number;
  vehicle_id: number;
  driver?: string;
  odometer?: number;
  location?: string;
  reason?: string;
  notes?: string

}
export interface  ci_sessions  {
  id? : string;
  username?: string;
  fullName?: string;
  loginTime?: string;
  idleTime?: string;
}