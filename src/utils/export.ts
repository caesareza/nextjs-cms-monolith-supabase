import ExcelJS from "exceljs";
import type { ArticleDisplay } from "@/types/article";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function exportArticlesToExcel(
  articles: ArticleDisplay[],
  year: number,
  month: number,
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Production Sheet");

  // Enable grid lines visibility
  worksheet.views = [{ showGridLines: true }];

  const monthName = MONTH_NAMES[month - 1] || "";

  // 1. Title Banner (Spanning columns A to W for 23 fields)
  worksheet.mergeCells("A1:W1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "POSTHINKS CMS - CONTENT PRODUCTION SHEET";
  titleCell.font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // Dark Slate
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 40;

  // 2. Metadata Context Panel
  worksheet.getCell("A3").value = "Production Cycle:";
  worksheet.getCell("A3").font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF64748B" },
  };
  worksheet.getCell("B3").value = `${monthName} ${year}`;
  worksheet.getCell("B3").font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF0F172A" },
  };

  worksheet.getCell("D3").value = "Total Articles:";
  worksheet.getCell("D3").font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF64748B" },
  };
  worksheet.getCell("E3").value = articles.length;
  worksheet.getCell("E3").font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF0F172A" },
  };

  worksheet.getCell("G3").value = "Export Date:";
  worksheet.getCell("G3").font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF64748B" },
  };
  worksheet.getCell("H3").value = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  worksheet.getCell("H3").font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF0F172A" },
  };

  worksheet.getRow(3).height = 20;

  // 3. Table Headers Configuration (All 23 Fields)
  const headers = [
    { header: "ID", key: "id", width: 8 },
    { header: "Job Code", key: "job_code", width: 15 },
    { header: "Article Title", key: "title", width: 35 },
    { header: "Target Keyword", key: "target_keyword", width: 25 },
    { header: "Related Keywords", key: "related_keyword", width: 25 },
    { header: "Demand Volume", key: "demand", width: 16 },
    { header: "Meta Description", key: "meta_description", width: 35 },
    { header: "CTA Internal Link", key: "cta_internal_link", width: 30 },
    {
      header: "Google Drive Draft Link",
      key: "gdrive_draft_content",
      width: 30,
    },
    { header: "Category", key: "category", width: 18 },
    { header: "Section", key: "section", width: 18 },
    { header: "Content Writer", key: "writer", width: 20 },
    { header: "Product Segment", key: "product_name", width: 20 },
    { header: "Priority / Segment", key: "product_priority", width: 20 },
    { header: "Audience Persona", key: "persona", width: 20 },
    { header: "Campaign Attribution", key: "campaign", width: 20 },
    { header: "Strategic Theme", key: "theme", width: 20 },
    { header: "Content Intent", key: "intent", width: 18 },
    { header: "Article Type", key: "type", width: 15 },
    { header: "Classification", key: "classification", width: 15 },
    { header: "Approval State", key: "approval", width: 15 },
    { header: "Workflow Status", key: "status", width: 18 },
    { header: "Date Created", key: "created_at", width: 16 },
  ];

  // Set headers on Row 5
  const headerRow = worksheet.getRow(5);
  headerRow.height = 28;

  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h.header;
    cell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF4B2B" }, // Vermillion orange matching brand dot
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: h.key === "demand" ? "right" : "center",
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "medium", color: { argb: "FF94A3B8" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // 4. Data Rows Injection
  articles.forEach((art, rowIdx) => {
    const currentLine = rowIdx + 6;
    const row = worksheet.getRow(currentLine);
    row.height = 22;

    const writerName = art.writer || "—";
    const priorityName = art.product_priority || "—";
    const sectionName = art.section || "—";
    const categoryName = art.category || "—";
    const cleanType =
      art.type === "new"
        ? "New Article"
        : art.type === "adjust"
          ? "Optimization"
          : art.type || "—";
    const cleanDate = art.created_at
      ? new Date(art.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

    row.getCell(1).value = art.id || "—";
    row.getCell(2).value = art.job_code || "—";
    row.getCell(3).value = art.title || "Untitled Article";
    row.getCell(4).value = art.target_keyword || "—";
    row.getCell(5).value = art.related_keyword || "—";
    row.getCell(6).value = art.demand ? Number(art.demand) : 0;
    row.getCell(7).value = art.meta_description || "—";
    row.getCell(8).value = art.cta_internal_link || "—";
    row.getCell(9).value = art.gdrive_draft_content || "—";
    row.getCell(10).value = categoryName;
    row.getCell(11).value = sectionName;
    row.getCell(12).value = writerName;
    row.getCell(13).value = art.product_name || "—";
    row.getCell(14).value = priorityName;
    row.getCell(15).value = art.persona || "—";
    row.getCell(16).value = art.campaign || "—";
    row.getCell(17).value = art.theme || "—";
    row.getCell(18).value = art.intent || "—";
    row.getCell(19).value = cleanType;
    row.getCell(20).value = art.classification || "—";
    row.getCell(21).value = art.approval
      ? String(art.approval).toUpperCase()
      : "—";
    row.getCell(22).value = art.status
      ? String(art.status).toUpperCase()
      : "DRAFT";
    row.getCell(23).value = cleanDate;

    // Apply Zebra striping background colors
    const rowColor = rowIdx % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC"; // Alternating white / slate-50

    // Apply Cells Alignment & Formatting
    for (let c = 1; c <= 23; c++) {
      const cell = row.getCell(c);
      cell.font = { name: "Arial", size: 9.5 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowColor },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      if (c === 6) {
        // Format Demand column as integers with commas
        cell.numFmt = "#,##0";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if ([1, 2, 10, 11, 14, 18, 19, 20, 21, 22, 23].includes(c)) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    }

    // Dynamic Highlighting of Status Column (Col 22)
    const statusCell = row.getCell(22);
    const statusVal = String(art.status).toLowerCase();
    let statusBg = "FFF1F3F4"; // Default light gray
    let statusFg = "FF5F6368"; // Default dark gray

    if (statusVal === "published") {
      statusBg = "FFE6F4EA"; // Light Green
      statusFg = "FF137333";
    } else if (
      statusVal === "revision pending" ||
      statusVal === "drafting pending"
    ) {
      statusBg = "FFFEF7E0"; // Light Yellow
      statusFg = "FFB06000";
    } else if (statusVal === "seo pending" || statusVal === "writing pending") {
      statusBg = "FFE8F0FE"; // Light Blue
      statusFg = "FF1A73E8";
    }

    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: statusBg },
    };
    statusCell.font = {
      name: "Arial",
      size: 8.5,
      bold: true,
      color: { argb: statusFg },
    };
    statusCell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // 5. Auto Column Width Fitting
  headers.forEach((h, colIdx) => {
    const column = worksheet.getColumn(colIdx + 1);
    let maxLen = h.width || 12;

    column.eachCell({ includeEmpty: false }, (cell, rowNum) => {
      if (rowNum > 4) {
        // Ignore Title and Meta cards
        const valStr = cell.value ? String(cell.value) : "";
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
    });

    column.width = Math.min(50, maxLen + 3); // Cap max column width at 50
  });

  // 6. Generate and Download File Blobs
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Posthinks_Production_Sheet_${year}_${month}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
