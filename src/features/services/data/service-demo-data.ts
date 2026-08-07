export type ServiceStatus = "Active" | "Draft";

export type ServiceRow = {
  id: number;
  title: string;
  price: number;
  type: "Hourly" | "Fixed";
  delivery: string;
  status: ServiceStatus;
  isActive: boolean;
  earnings: number;
  totalBookings: number;
};

export type BookingRow = {
  id: string;
  serviceId: number;
  customerName: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  amount: number;
};

export const SERVICE_DEMO: ServiceRow[] = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    price: 250,
    type: "Hourly",
    delivery: "3 days",
    status: "Active",
    isActive: true,
    earnings: 12450,
    totalBookings: 18,
  },
  {
    id: 2,
    title: "E-commerce Website",
    price: 500,
    type: "Fixed",
    delivery: "7 days",
    status: "Active",
    isActive: true,
    earnings: 22600,
    totalBookings: 9,
  },
  {
    id: 3,
    title: "API Integration",
    price: 150,
    type: "Hourly",
    delivery: "2 days",
    status: "Draft",
    isActive: false,
    earnings: 3100,
    totalBookings: 6,
  },
];

export const SERVICE_BOOKINGS_DEMO: BookingRow[] = [
  {
    id: "BK-2031",
    serviceId: 1,
    customerName: "Nusrat Jahan",
    date: "2026-04-26",
    status: "Completed",
    amount: 850,
  },
  {
    id: "BK-2024",
    serviceId: 1,
    customerName: "Rahim Uddin",
    date: "2026-04-24",
    status: "Confirmed",
    amount: 1200,
  },
  {
    id: "BK-2017",
    serviceId: 1,
    customerName: "Amina Khatun",
    date: "2026-04-22",
    status: "Pending",
    amount: 600,
  },
  {
    id: "BK-1992",
    serviceId: 2,
    customerName: "Tanjil Hasan",
    date: "2026-04-20",
    status: "Completed",
    amount: 500,
  },
  {
    id: "BK-1989",
    serviceId: 2,
    customerName: "Sabbir Ahmed",
    date: "2026-04-18",
    status: "Completed",
    amount: 500,
  },
  {
    id: "BK-1960",
    serviceId: 3,
    customerName: "Shirin Akter",
    date: "2026-04-15",
    status: "Cancelled",
    amount: 0,
  },
];
