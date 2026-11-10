export interface IpWhoResponse {
  success: boolean;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  connection?: {
    isp?: string;
  };
}