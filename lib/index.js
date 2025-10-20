"use strict";

/**
 * tinyEditableGrid
 * Initialize an editable grid inside the given container.
 * 
 * @name tinyEditableGrid
 * @function
 * @param {String} selector CSS selector for the container element.
 * @param {Object} options Configuration options:
 * 
 *    - headers: Array of column definitions 
 *    - data: 2D array of initial data
 *    - onChange: Callback function when data changes
 */
module.exports = function tinyEditableGrid(selector, options) {
    const container = document.querySelector(selector);
    const { headers, data, onChange } = options;

    const table = document.createElement('table');
    table.className = 'tiny-grid';

    // --- Header ---
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // --- Body ---
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // --- Create cell element ---
    function createCell(rowIdx, colIdx, value) {
        const col = headers[colIdx];
        const td = document.createElement('td');
        let input;

        if (col.enum) {
            input = document.createElement('select');
            col.enum.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v;
                opt.textContent = v;
                input.appendChild(opt);
            });
            input.value = value;
        } else {
            input = document.createElement('input');
            input.type = col.type || 'text';
            input.value = value;
        }

        input.dataset.row = rowIdx;
        input.dataset.col = colIdx;

        input.addEventListener('input', handleChange);
        input.addEventListener('keydown', handleKey);
        td.appendChild(input);
        return td;
    }

    // --- Render rows ---
    function render() {
        tbody.innerHTML = '';
        data.forEach((row, r) => {
            const tr = document.createElement('tr');
            row.forEach((val, c) => {
                tr.appendChild(createCell(r, c, val));
            });
            tbody.appendChild(tr);
        });
    }

    function handleChange(e) {
        const input = e.target;
        const r = +input.dataset.row, c = +input.dataset.col;
        data[r][c] = input.value;
        onChange && onChange(data);
    }

    function handleKey(e) {
        const input = e.target;
        const r = +input.dataset.row, c = +input.dataset.col;
        const rows = tbody.querySelectorAll('tr');
        const cells = rows[r].querySelectorAll('input, select');

        const isCmd = e.metaKey || e.ctrlKey;
        const rowCount = data.length;
        const colCount = headers.length;

        // Navigation
        if (!isCmd) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                focusCell(r, Math.min(c + 1, colCount - 1));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                focusCell(r, Math.max(c - 1, 0));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusCell(Math.min(r + 1, rowCount - 1), c);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusCell(Math.max(r - 1, 0), c);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                focusCell(Math.min(r + 1, rowCount - 1), c);
            }
        } else {
            // Cmd/Ctrl shortcuts
            if (e.key === 'Enter') {
                e.preventDefault();
                if (r === rowCount - 1) {
                    const newRow = headers.map(h => h.enum ? h.enum[0] || '' : '');
                    data.push(newRow);
                    render();
                    onChange && onChange(data);
                    focusCell(rowCount, 0);
                }
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                if (rowCount > 1) {
                    data.splice(r, 1);
                    render();
                    onChange && onChange(data);
                    focusCell(Math.max(0, r - 1), 0);
                }
            }
        }
    }

    function focusCell(r, c) {
        const input = tbody.querySelector(`tr:nth-child(${r + 1}) td:nth-child(${c + 1}) input, tr:nth-child(${r + 1}) td:nth-child(${c + 1}) select`);
        if (input) input.focus();
    }

    render();
    container.innerHTML = '';
    container.appendChild(table);
}
