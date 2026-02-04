// Pathé cinema seat data types

export type SeatType = "STD" | "NON" | "DIS" | "DUO" | "LOGE" | "AIL" | "HOU" | "DBX" | "SOFA" | "TRIO" | "COCOON" | "LOUNGE" | "TEDIBER" | "PRE";

export type SeatStatus = 0 | 1 | 2; // 0 = available, 1 = occupied, 2 = selected

export interface Seat {
  rowIndex: number;
  seatIndex: number;
  rowName: string;
  seatName: string;
  seatType: SeatType;
  section: number;
  status: SeatStatus;
  seatSide: string | null;
  companion: boolean;
  tooltip: string | null;
}

export interface Section {
  number: number;
  areaCodeId: string;
  type: string;
}

export interface CinemaMap {
  seatsAvailable: number;
  sections: Section[];
  roomName: string;
  isHandicappedSeats: boolean;
  rowCount: number;
  colCount: number;
  sessionId: string;
  isStandardSeats: boolean;
  isDuoSeats: boolean;
  isDboxSeats: boolean;
  isPremiumSeats: boolean;
  isLogeSeats: boolean;
  isSofaSeats: boolean;
  isTrioSeats: boolean;
  seatsTotalCount: number;
  seats: Seat[][];
  rowsNames: (string | null)[];
}

export interface SeatTypeInfo {
  code: SeatType;
  tooltip: string;
  tooltipPictureUrl: string | null;
}

export interface CinemaData {
  maps: CinemaMap[];
  seatTypes: SeatTypeInfo[];
}

// Flat seat for 3D rendering
export interface FlatSeat {
  id: string;
  rowName: string;
  seatName: string;
  seatType: SeatType;
  status: SeatStatus;
  gridRow: number;
  gridCol: number;
  position: [number, number, number];
}
