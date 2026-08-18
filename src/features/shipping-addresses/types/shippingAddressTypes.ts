export interface ShippingAddress {
  _id?: string;
  user?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  countryCode?: string;
  postalCode: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ShippingAddressPayload {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  countryCode?: string;
  postalCode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface ShippingAddressPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface ShippingAddressResponse {
  success: boolean;
  message?: string;
  pagination?: ShippingAddressPagination;
  data: ShippingAddress[];
}
