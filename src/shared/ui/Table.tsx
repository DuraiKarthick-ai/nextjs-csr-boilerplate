"use client";

/**
 * Table — MUI-based generic accessible data table component.
 *
 * Renders a responsive, scrollable table from a column definition
 * and data array.
 *
 * @template T - The type of each row datum.
 * @param {TableProps<T>} props - Component props.
 * @returns {JSX.Element} A fully accessible MUI data table.
 */

import React from "react";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/**
 * Definition for a single table column.
 * @template T - The row data type.
 */
export interface TableColumn<T> {
  /** Unique column identifier. */
  key: string;
  /** Column heading label. */
  header: string;
  /**
   * Renders the cell content for this column.
   *
   * @param {T} row - The row data object.
   * @returns {React.ReactNode} The rendered cell content.
   */
  render: (row: T) => React.ReactNode;
  /** Optional CSS class applied to both th and td. */
  className?: string;
}

interface TableProps<T> {
  /** Array of column definitions. */
  columns: TableColumn<T>[];
  /** Array of row data objects. */
  data: T[];
  /**
   * Function to derive a unique key for each row.
   *
   * @param {T} row - The row datum.
   * @returns {string | number} A unique row key.
   */
  rowKey: (row: T) => string | number;
  /** Accessible caption describing the table contents. */
  caption?: string;
  /** Additional CSS class applied to the wrapper. */
  className?: string;
}

/**
 * Generic MUI data table.
 *
 * @template T
 * @param {TableProps<T>} props
 * @returns {JSX.Element}
 */
function Table<T>({
  columns,
  data,
  rowKey,
  caption,
  className = "",
}: TableProps<T>): JSX.Element {
  return (
    <TableContainer component={Paper} className={className}>
      <MuiTable size="small" aria-label={caption}>
        {caption && (
          <caption style={{ position: "absolute", left: "-9999px" }}>
            <Typography variant="caption">{caption}</Typography>
          </caption>
        )}
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                <strong>{col.header}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={rowKey(row)} hover>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}

export default Table;
