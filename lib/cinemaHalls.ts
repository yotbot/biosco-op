import { CinemaData, Seat, SeatType, SeatStatus } from "./types";

// Helper to create a seat
function createSeat(
  rowIndex: number,
  seatIndex: number,
  rowName: string,
  seatNum: number,
  seatType: SeatType,
  status: SeatStatus = 0
): Seat {
  return {
    rowIndex,
    seatIndex,
    rowName,
    seatName: `S${seatNum}`,
    seatType,
    section: 1,
    status,
    seatSide: null,
    companion: false,
    tooltip: null,
  };
}

// Create spacer row
function createSpacerRow(rowIndex: number): Seat[] {
  return [
    {
      rowIndex,
      seatIndex: 0,
      rowName: "",
      seatName: "",
      seatType: "NON",
      section: 0,
      status: 0,
      seatSide: null,
      companion: false,
      tooltip: null,
    },
  ];
}

// Randomly set some seats as occupied
function randomOccupied(): SeatStatus {
  return Math.random() < 0.25 ? 1 : 0;
}

// ============================================
// ZAAL 1: Standard - Classic cinema setup
// ============================================
function createZaal1(): CinemaData {
  const seats: Seat[][] = [];
  const rows = 8;
  const cols = 14;

  for (let r = 0; r < rows; r++) {
    const rowName = `R${rows - r}`;
    const rowSeats: Seat[] = [];

    for (let c = 0; c < cols; c++) {
      // Wheelchair spots in front row (R1), positions 6-7
      const isWheelchair = r === rows - 1 && (c === 5 || c === 6);

      rowSeats.push(
        createSeat(
          r * 2,
          c,
          rowName,
          c + 1,
          isWheelchair ? "DIS" : "STD",
          randomOccupied()
        )
      );
    }

    seats.push(rowSeats);
    if (r < rows - 1) {
      seats.push(createSpacerRow(r * 2 + 1));
    }
  }

  return {
    maps: [
      {
        seatsAvailable: rows * cols,
        sections: [{ number: 1, areaCodeId: "0000000001", type: "Standard" }],
        roomName: "Zaal 1 - Classic",
        isHandicappedSeats: true,
        rowCount: rows,
        colCount: cols,
        sessionId: "10001",
        isStandardSeats: true,
        isDuoSeats: false,
        isDboxSeats: false,
        isPremiumSeats: false,
        isLogeSeats: false,
        isSofaSeats: false,
        isTrioSeats: false,
        seatsTotalCount: rows * cols,
        seats,
        rowsNames: Array.from({ length: rows }, (_, i) => `${rows - i}`),
      },
    ],
    seatTypes: [
      { code: "STD", tooltip: "Standard Seat", tooltipPictureUrl: null },
      { code: "DIS", tooltip: "Wheelchair Space", tooltipPictureUrl: null },
      { code: "NON", tooltip: "", tooltipPictureUrl: null },
    ],
  };
}

// ============================================
// ZAAL 2: Premium - LOGE + PRE seats
// ============================================
function createZaal2(): CinemaData {
  const seats: Seat[][] = [];
  const rows = 6;
  const cols = 12;

  for (let r = 0; r < rows; r++) {
    const rowName = `R${rows - r}`;
    const rowSeats: Seat[] = [];

    // Back 2 rows are LOGE (VIP balcony)
    const isLogeRow = r < 2;
    // Middle rows are Premium
    const isPremiumRow = r >= 2 && r < 4;

    for (let c = 0; c < cols; c++) {
      let seatType: SeatType = "STD";

      if (isLogeRow) {
        seatType = "LOGE";
      } else if (isPremiumRow) {
        seatType = "PRE";
      } else if (r === rows - 1 && c === 0) {
        // One wheelchair spot
        seatType = "DIS";
      }

      rowSeats.push(
        createSeat(r * 2, c, rowName, c + 1, seatType, randomOccupied())
      );
    }

    seats.push(rowSeats);
    if (r < rows - 1) {
      seats.push(createSpacerRow(r * 2 + 1));
    }
  }

  return {
    maps: [
      {
        seatsAvailable: rows * cols,
        sections: [
          { number: 1, areaCodeId: "0000000002", type: "Loge" },
          { number: 2, areaCodeId: "0000000003", type: "Premium" },
        ],
        roomName: "Zaal 2 - Premium",
        isHandicappedSeats: true,
        rowCount: rows,
        colCount: cols,
        sessionId: "10002",
        isStandardSeats: true,
        isDuoSeats: false,
        isDboxSeats: false,
        isPremiumSeats: true,
        isLogeSeats: true,
        isSofaSeats: false,
        isTrioSeats: false,
        seatsTotalCount: rows * cols,
        seats,
        rowsNames: Array.from({ length: rows }, (_, i) => `${rows - i}`),
      },
    ],
    seatTypes: [
      { code: "STD", tooltip: "Standard Seat", tooltipPictureUrl: null },
      { code: "PRE", tooltip: "Premium Seat", tooltipPictureUrl: null },
      { code: "LOGE", tooltip: "Loge (VIP Balcony)", tooltipPictureUrl: null },
      { code: "DIS", tooltip: "Wheelchair Space", tooltipPictureUrl: null },
      { code: "NON", tooltip: "", tooltipPictureUrl: null },
    ],
  };
}

// ============================================
// ZAAL 3: Comfort - DUO, SOFA, TRIO
// ============================================
function createZaal3(): CinemaData {
  const seats: Seat[][] = [];

  // Row 5 (back): 6 DUO loveseats (12 positions, pairs)
  const row5: Seat[] = [];
  for (let c = 0; c < 6; c++) {
    row5.push(createSeat(0, c * 2, "R5", c * 2 + 1, "DUO", randomOccupied()));
    row5.push(createSeat(0, c * 2 + 1, "R5", c * 2 + 2, "DUO", row5[c * 2].status)); // Same status for pair
  }
  seats.push(row5);
  seats.push(createSpacerRow(1));

  // Row 4: 4 TRIO seats (12 positions, groups of 3)
  const row4: Seat[] = [];
  for (let c = 0; c < 4; c++) {
    const status = randomOccupied();
    row4.push(createSeat(2, c * 3, "R4", c * 3 + 1, "TRIO", status));
    row4.push(createSeat(2, c * 3 + 1, "R4", c * 3 + 2, "TRIO", status));
    row4.push(createSeat(2, c * 3 + 2, "R4", c * 3 + 3, "TRIO", status));
  }
  seats.push(row4);
  seats.push(createSpacerRow(3));

  // Row 3: 4 SOFA seats (big comfy sofas)
  const row3: Seat[] = [];
  for (let c = 0; c < 8; c++) {
    row3.push(createSeat(4, c, "R3", c + 1, "SOFA", randomOccupied()));
  }
  seats.push(row3);
  seats.push(createSpacerRow(5));

  // Row 2: Mixed DUO and STD
  const row2: Seat[] = [];
  for (let c = 0; c < 10; c++) {
    const isDuo = c >= 3 && c <= 6;
    row2.push(createSeat(6, c, "R2", c + 1, isDuo ? "DUO" : "STD", randomOccupied()));
  }
  seats.push(row2);
  seats.push(createSpacerRow(7));

  // Row 1 (front): Standard with wheelchair
  const row1: Seat[] = [];
  for (let c = 0; c < 10; c++) {
    const isWheelchair = c === 0 || c === 9;
    row1.push(createSeat(8, c, "R1", c + 1, isWheelchair ? "DIS" : "STD", randomOccupied()));
  }
  seats.push(row1);

  return {
    maps: [
      {
        seatsAvailable: 52,
        sections: [{ number: 1, areaCodeId: "0000000003", type: "Comfort" }],
        roomName: "Zaal 3 - Comfort",
        isHandicappedSeats: true,
        rowCount: 5,
        colCount: 12,
        sessionId: "10003",
        isStandardSeats: true,
        isDuoSeats: true,
        isDboxSeats: false,
        isPremiumSeats: false,
        isLogeSeats: false,
        isSofaSeats: true,
        isTrioSeats: true,
        seatsTotalCount: 52,
        seats,
        rowsNames: ["5", "4", "3", "2", "1"],
      },
    ],
    seatTypes: [
      { code: "STD", tooltip: "Standard Seat", tooltipPictureUrl: null },
      { code: "DUO", tooltip: "Loveseat (2 persons)", tooltipPictureUrl: null },
      { code: "TRIO", tooltip: "Triple Seat (3 persons)", tooltipPictureUrl: null },
      { code: "SOFA", tooltip: "Luxury Sofa", tooltipPictureUrl: null },
      { code: "DIS", tooltip: "Wheelchair Space", tooltipPictureUrl: null },
      { code: "NON", tooltip: "", tooltipPictureUrl: null },
    ],
  };
}

// ============================================
// ZAAL 4: Experience - D-BOX motion seats
// ============================================
function createZaal4(): CinemaData {
  const seats: Seat[][] = [];
  const rows = 5;
  const cols = 10;

  for (let r = 0; r < rows; r++) {
    const rowName = `R${rows - r}`;
    const rowSeats: Seat[] = [];

    // Middle 3 rows have D-BOX motion seats in the center
    const isDboxRow = r >= 1 && r <= 3;

    for (let c = 0; c < cols; c++) {
      let seatType: SeatType = "STD";

      // D-BOX in center columns (3-6) for middle rows
      if (isDboxRow && c >= 2 && c <= 7) {
        seatType = "DBX";
      }

      // Wheelchair in front corners
      if (r === rows - 1 && (c === 0 || c === cols - 1)) {
        seatType = "DIS";
      }

      rowSeats.push(
        createSeat(r * 2, c, rowName, c + 1, seatType, randomOccupied())
      );
    }

    seats.push(rowSeats);
    if (r < rows - 1) {
      seats.push(createSpacerRow(r * 2 + 1));
    }
  }

  return {
    maps: [
      {
        seatsAvailable: rows * cols,
        sections: [
          { number: 1, areaCodeId: "0000000004", type: "D-BOX" },
          { number: 2, areaCodeId: "0000000005", type: "Standard" },
        ],
        roomName: "Zaal 4 - Experience",
        isHandicappedSeats: true,
        rowCount: rows,
        colCount: cols,
        sessionId: "10004",
        isStandardSeats: true,
        isDuoSeats: false,
        isDboxSeats: true,
        isPremiumSeats: false,
        isLogeSeats: false,
        isSofaSeats: false,
        isTrioSeats: false,
        seatsTotalCount: rows * cols,
        seats,
        rowsNames: Array.from({ length: rows }, (_, i) => `${rows - i}`),
      },
    ],
    seatTypes: [
      { code: "STD", tooltip: "Standard Seat", tooltipPictureUrl: null },
      { code: "DBX", tooltip: "D-BOX Motion Seat", tooltipPictureUrl: null },
      { code: "DIS", tooltip: "Wheelchair Space", tooltipPictureUrl: null },
      { code: "NON", tooltip: "", tooltipPictureUrl: null },
    ],
  };
}

// ============================================
// Export all halls
// ============================================
export const CINEMA_HALLS: Record<string, () => CinemaData> = {
  "zaal-1": createZaal1,
  "zaal-2": createZaal2,
  "zaal-3": createZaal3,
  "zaal-4": createZaal4,
};

export function getCinemaHall(hallId: string): CinemaData {
  const createHall = CINEMA_HALLS[hallId];
  if (!createHall) {
    return createZaal1(); // Default fallback
  }
  return createHall();
}

export function getAllHallIds(): string[] {
  return Object.keys(CINEMA_HALLS);
}

export function getHallName(hallId: string): string {
  const hall = getCinemaHall(hallId);
  return hall.maps[0].roomName;
}

// Get all unique seat types across all halls
export function getAllSeatTypes(): { code: SeatType; tooltip: string }[] {
  return [
    { code: "STD", tooltip: "Standard Seat" },
    { code: "DIS", tooltip: "Wheelchair Space" },
    { code: "DUO", tooltip: "Loveseat (2 persons)" },
    { code: "TRIO", tooltip: "Triple Seat (3 persons)" },
    { code: "SOFA", tooltip: "Luxury Sofa" },
    { code: "LOGE", tooltip: "Loge (VIP Balcony)" },
    { code: "PRE", tooltip: "Premium Seat" },
    { code: "DBX", tooltip: "D-BOX Motion Seat" },
  ];
}
