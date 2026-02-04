import { CinemaData, Seat, SeatStatus } from "./types";

// Generate sample cinema data based on Pathé structure
export function generateSampleCinemaData(): CinemaData {
  const rows = 6;
  const cols = 15;
  const seats: Seat[][] = [];

  // Row names from back to front (R6 is at back, R1 is at front)
  const rowNames = ["R6", "R5", "R4", "R3", "R2", "R1"];

  for (let r = 0; r < rows * 2; r++) {
    // Every other row is a spacer
    if (r % 2 === 1) {
      // Spacer row
      seats.push([
        {
          rowIndex: r,
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
      ]);
    } else {
      // Actual seat row
      const actualRowIndex = r / 2;
      const rowSeats: Seat[] = [];

      for (let c = 0; c < cols; c++) {
        // Randomly make some seats occupied (about 30%)
        const isOccupied = Math.random() < 0.3;
        // Add wheelchair spot in front row center
        const isWheelchair = actualRowIndex === rows - 1 && (c === 6 || c === 7);

        rowSeats.push({
          rowIndex: r,
          seatIndex: c,
          rowName: rowNames[actualRowIndex],
          seatName: `S${c + 1}`,
          seatType: isWheelchair ? "DIS" : "STD",
          section: 1,
          status: isOccupied ? 1 : 0,
          seatSide: null,
          companion: false,
          tooltip: null,
        });
      }

      seats.push(rowSeats);
    }
  }

  return {
    maps: [
      {
        seatsAvailable: rows * cols,
        sections: [{ number: 1, areaCodeId: "0000000001", type: "Area 1" }],
        roomName: "Zaal 4",
        isHandicappedSeats: true,
        rowCount: rows * 2,
        colCount: cols,
        sessionId: "12345",
        isStandardSeats: true,
        isDuoSeats: false,
        isDboxSeats: false,
        isPremiumSeats: false,
        isLogeSeats: false,
        isSofaSeats: false,
        isTrioSeats: false,
        seatsTotalCount: rows * cols,
        seats,
        rowsNames: rowNames.flatMap((name) => [name, null]),
      },
    ],
    seatTypes: [
      { code: "STD", tooltip: "Standard Seat", tooltipPictureUrl: null },
      { code: "DIS", tooltip: "Wheelchair Space", tooltipPictureUrl: null },
      { code: "NON", tooltip: "", tooltipPictureUrl: null },
      { code: "DUO", tooltip: "Loveseat", tooltipPictureUrl: null },
    ],
  };
}

// Convert Pathé data to flat seat array for 3D rendering
export function convertToFlatSeats(
  cinemaData: CinemaData,
  selectedSeats: Set<string>
): { seats: import("./types").FlatSeat[]; rowCount: number; colCount: number } {
  const map = cinemaData.maps[0];
  const flatSeats: import("./types").FlatSeat[] = [];

  const seatSpacing = 0.65;
  const rowSpacing = 1.0;

  // Count actual rows (non-spacer)
  let actualRowCount = 0;
  map.seats.forEach((row) => {
    if (row.length > 1 || (row[0] && row[0].seatType !== "NON")) {
      actualRowCount++;
    }
  });

  let actualRowIndex = 0;

  map.seats.forEach((row) => {
    // Skip spacer rows
    if (row.length === 1 && row[0].seatType === "NON") {
      return;
    }

    const startX = -((map.colCount - 1) * seatSpacing) / 2;
    const elevation = actualRowIndex * 0.3;
    const z = actualRowIndex * rowSpacing;

    row.forEach((seat) => {
      if (seat.seatType === "NON") return;

      const seatId = `${seat.rowName}-${seat.seatName}`;
      const x = startX + seat.seatIndex * seatSpacing;

      // Update status if selected
      let status = seat.status as SeatStatus;
      if (selectedSeats.has(seatId) && status === 0) {
        status = 2; // selected
      }

      flatSeats.push({
        id: seatId,
        rowName: seat.rowName,
        seatName: seat.seatName,
        seatType: seat.seatType,
        status,
        gridRow: actualRowIndex,
        gridCol: seat.seatIndex,
        position: [x, elevation, z],
      });
    });

    actualRowIndex++;
  });

  return {
    seats: flatSeats,
    rowCount: actualRowCount,
    colCount: map.colCount,
  };
}

// Get unique row names from cinema data
export function getRowNames(cinemaData: CinemaData): string[] {
  const rowNames: string[] = [];
  cinemaData.maps[0].seats.forEach((row) => {
    if (row.length > 1 && row[0].rowName && !rowNames.includes(row[0].rowName)) {
      rowNames.push(row[0].rowName);
    }
  });
  return rowNames;
}
