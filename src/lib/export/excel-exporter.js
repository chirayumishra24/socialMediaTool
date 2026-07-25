/**
 * Skilizee AI — CSV & Excel Export Utility
 * Exports campaign performance, audience reach, and hashtag data into downloadable spreadsheets.
 */

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map((k) => {
          let cell = row[k] === null || row[k] === undefined ? "" : String(row[k]);
          cell = cell.replace(/"/g, '""');
          if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
