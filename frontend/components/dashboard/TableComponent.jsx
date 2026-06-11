import React from 'react';

/**
 * TableComponent Component
 * Displays data in a clean, minimal, borderless list format matching the reference design.
 * 
 * @param {Object} props
 * @param {Array<string>} props.headers - Table headers
 * @param {Array<any>} props.rows - Array of row data items
 * @param {Function} props.renderRow - Function mapping a single row item to a table row (`<tr>`)
 * @param {string} [props.emptyMessage] - Message shown if there are no rows
 */
export default function TableComponent({ headers, rows = [], renderRow, emptyMessage = 'No data available' }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-white">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm text-gray-500">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/75">
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-4 font-semibold text-gray-600 uppercase text-xs tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 font-medium text-gray-700">
          {rows.length > 0 ? (
            rows.map((row, idx) => renderRow(row, idx))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
