export interface LoginUser {
  id: number;
  displayedName: string;
  email: string;
  isActive: boolean;
}

export interface LoginExpiration {
  hours: number;
}

export interface LoginResponseData {
  user: LoginUser;
  token: string;
  expiration: LoginExpiration;
  loginTime: string;
}
