const Diploma = require("../models/diploma");
const XLSX = require("xlsx");

const createDiploma = async (
    subject, studentID, number, name,
    dateOfBirth, gender, rating, GDN,
    gradutateDate, numberInBook
) => {
    try {
        numberInBook = numberInBook?.trim();
        number = number?.trim();

        const existed = await Diploma.findOne({ numberInBook });

        if (existed) {
            return {
                status: "SKIPPED",
                reason: "DUPLICATE_NUMBER_IN_BOOK"
            };
        }

        const newDiploma = new Diploma({
            subject,
            studentID,
            number,
            name,
            dateOfBirth,
            gender,
            rating,
            GDN,
            gradutateDate,
            numberInBook
        });

        await newDiploma.save();

        return {
            status: "INSERTED"
        };
    } catch (err) {
        return {
            status: "ERROR",
            reason: err.message
        };
    }
};


const importDiploma = async () => {
    try {
        let inserted = 0;
        let skipped = 0;
        let errors = [];

        const headers = [
            "Ngành",
            "MSSV",
            "Số hiệu",
            "Họ và Tên",
            "Ngày sinh",
            "Giới tính",
            "Xếp loại",
            "Số QĐ Tốt nghiệp",
            "Năm TN",
            "Vào sổ cấp văn bằng, chứng chỉ số"
        ];

        const workBook = XLSX.readFile("files/VB_27.03.2026.xlsx");

        const data = XLSX.utils.sheet_to_json(
            workBook.Sheets["sheet1"],
            { defval: "" }
        ).map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(k => {
                cleanRow[k.trim()] = row[k];
            });
            return cleanRow;
        });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            const result = await createDiploma(
                row[headers[0]],
                row[headers[1]],
                row[headers[2]],
                row[headers[3]],
                row[headers[4]],
                row[headers[5]],
                row[headers[6]],
                row[headers[7]],
                row[headers[8]],
                row[headers[9]]
            );

            if (result.status === "INSERTED") {
                inserted++;
            } else if (result.status === "SKIPPED") {
                skipped++;
                console.log(
                    `⚠️ Bỏ dòng ${i + 2} – trùng số hiệu:`,
                    row[headers[9]]
                );
            } else {
                errors.push({
                    row: i + 2,
                    reason: result.reason
                });

                console.log(
                    `❌ LỖI dòng ${i + 2}:`,
                    result.reason,
                    "| number:",
                    row[headers[2]]
                );
            }
        }

        console.log("✅ Inserted:", inserted);
        console.log("⚠️ Skipped:", skipped);
        console.log("❌ Errors:", errors.length);

        return {
            inserted,
            skipped,
            errors
        };
    } catch (err) {
        console.log("Import Diploma:", err);
        return null;
    }
};


const updateDiploma = async (number, updateData) => {
    try {
        const diploma = await Diploma.findOne({ number });
        if (!diploma) {
            console.log(`Không tìm thấy văn bằng với số hiệu: ${number}`);
            return 0;
        }

        // Cập nhật các trường được truyền vào updateData
        Object.keys(updateData).forEach(key => {
            diploma[key] = updateData[key];
        });

        await diploma.save();
        console.log(`Đã cập nhật văn bằng số hiệu: ${number}`);
        return 1;
    } catch (err) {
        console.log("Update Diploma: ", err);
        return 0;
    }
};

const updateDiplomaFromExcel = async () => {
    try {
        let count = 0;
        const headers = ["Ngành", "MSSV", "Số hiệu", "Họ và Tên", "Ngày sinh",
            "Giới tính", "Xếp loại", "Số QĐ Tốt nghiệp", "Năm TN", "Vào sổ cấp văn bằng, chứng chỉ số"];
        const workBook = XLSX.readFile("files/DS_28-10.xlsx");
        const data = XLSX.utils.sheet_to_json(workBook.Sheets["Sheet2"]);

        for (const row of data) {
            const rowData = {};
            headers.forEach(header => {
                rowData[header] = row[header];
            });

            const updateData = {
                subject: rowData[headers[0]],
                studentID: rowData[headers[1]],
                name: rowData[headers[3]],
                dateOfBirth: rowData[headers[4]],
                gender: rowData[headers[5]],
                rating: rowData[headers[6]],
                GDN: rowData[headers[7]],
                gradutateDate: rowData[headers[8]],
                numberInBook: rowData[headers[9]],
            };

            const result = await updateDiploma(rowData[headers[2]], updateData);
            count += result;
        }

        console.log(`Đã cập nhật ${count} văn bằng.`);
        return count;
    } catch (err) {
        console.log("Update Diploma From Excel: ", err);
        return 0;
    }
};


const getDiplomas = async (number) => {
    try {
        const res = number.replace(/_/g, ' ');
        const result = await Diploma.findOne({ number: res });
        return result;
    }
    catch (err) {
        return null;
    }
}

module.exports = { createDiploma, importDiploma, updateDiploma, getDiplomas, updateDiplomaFromExcel };