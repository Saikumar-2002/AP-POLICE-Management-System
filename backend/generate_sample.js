import xlsx from 'xlsx';
import path from 'path';

const data = [
  {
    ministry: "Home Ministry",
    unitCode: "AP000",
    legacyReference: "HQ-01",
    name: "Andhra Pradesh Police HQ",
    parentUnitCode: "",
    unitType: "hq",
    department: "AP Police",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "Z01",
    legacyReference: "Z-VJA",
    name: "Vijayawada Zone",
    parentUnitCode: "AP000",
    unitType: "zone",
    department: "AP Police",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "Z02",
    legacyReference: "Z-VSKP",
    name: "Visakhapatnam Zone",
    parentUnitCode: "AP000",
    unitType: "zone",
    department: "AP Police",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "R01",
    legacyReference: "R-GNT",
    name: "Guntur Range",
    parentUnitCode: "Z01",
    unitType: "range",
    department: "AP Police",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "D01",
    legacyReference: "D-VJA",
    name: "NTR District",
    parentUnitCode: "R01",
    unitType: "district",
    department: "AP Police",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "C01",
    legacyReference: "C-VJA-EAST",
    name: "Vijayawada East Circle",
    parentUnitCode: "D01",
    unitType: "circle",
    department: "AP Police",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "S01",
    legacyReference: "PS-MACHAVARAM",
    name: "Machavaram Police Station",
    parentUnitCode: "C01",
    unitType: "station",
    department: "Law & Order",
    isVirtual: "false"
  },
  {
    ministry: "Home Ministry",
    unitCode: "S02",
    legacyReference: "PS-PATAMATA",
    name: "Patamata Police Station",
    parentUnitCode: "C01",
    unitType: "station",
    department: "Law & Order",
    isVirtual: "false"
  }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "PoliceUnits");

const filePath = path.join(process.cwd(), 'sample_police_data.xlsx');
xlsx.writeFile(wb, filePath);

console.log('Sample Excel file generated at:', filePath);
