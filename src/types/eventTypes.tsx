export interface Event {
  id: string;
  eventName: string;
  genre: string;
  category: string;
  eventDate: string;
  eventTime: string;
  location: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  venue: string;
  maxCapacity: number;
  ageLimit: string;
  allowance: string;
  allowAlcohol: boolean;
  allowSmokingAreas: boolean;
  description: string;
  images: string[];
}
