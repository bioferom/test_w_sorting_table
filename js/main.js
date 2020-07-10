
let data = [
    { name: 'Person 1', time_1: '6h 00m', time_2: '3h 27m', status: 'paid', total: '9h 27m' },
    { name: 'Person 2', time_2: '5h 48m', status: 'unpaid', total: '5h 48m' },
    { name: 'Person 3', time_1: '2h 10m', status: 'pending', total: '2h 10m' },
    { name: 'Person 4', time_1: '1h 10m', time_2: '2h 10m', status: 'pending', total: '3h 20m' },
    { name: 'Person 5', time_1: '0h 10m', time_2: '1h 25m', status: 'unpaid', total: '1h 35m' },
    { name: 'Person 6', time_1: '1h 10m', time_2: '2h 25m', status: 'paid', total: '3h 35m' },
]

function createTable() {
    const divId = 'dynamic-table';
    const div = document.getElementById(divId);

    div.innerHTML = '<span class="loading">Loading...</span>';

    setTimeout(() => {
        div.innerHTML = '';

        const tableId = 'sortable';
        const json = data;
        const table = new DynamicTable(tableId, json);
        div.appendChild(table);

        new SortableTable(tableId);
    }, 1000);
}


window.onload = function () {
    createTable();
};


function sortFn(a, b) {
    if (a.value < b.value) {
        return -1;
    }

    if (a.value > b.value) {
        return 1;
    }

    return 0;
}

function sortList(list, direction) {
    let sorted = list.sort(sortFn);

    if (direction === -1) {
        list.reverse();
    }

    return sorted;
}

function onHeadigClick(that, cellIndex) {
    return function () {
        that.sortColumn(this, cellIndex);

        return false;
    };
}

function createAnchor(html, index) {
    const a = document.createElement('a');
    a.href = '#';
    a.innerHTML = html;
    a.onclick = onHeadigClick(this, index);

    return a;
}


function DynamicTable(tableId, data) {
    let headings = data.reduce(function (result, item) {
        let item_headings = Object.keys(item);

        item_headings.forEach(function (heading) {
            if (result.indexOf(heading) === -1) {
                result.push(heading);
            }
        });

        return result;
    }, []);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const thead_tr = document.createElement('tr');

    headings.forEach(function (heading) {
        const cell = document.createElement('th');
        cell.innerHTML = heading;

        thead_tr.appendChild(cell);
    });

    data.forEach(function (item) {
        const tbody_tr = document.createElement('tr');

        headings.forEach(function (heading) {
            const cell = document.createElement('td');
            switch (item[heading]) {
                case 'pending':
                    // cell.className = 'pending';
                    cell.innerHTML = "<span class='pending'>pending</span>"
                    break;
                case 'paid':
                    cell.innerHTML = "<span class='paid'>paid</span>"
                    break;
                case 'unpaid':
                    cell.innerHTML = "<span class='unpaid'>unpaid</span>"
                    break;
                default:
                    cell.innerHTML = item[heading] || '';
                    break;

            }
            tbody_tr.appendChild(cell);
        });

        tbody.appendChild(tbody_tr);
    });

    thead.appendChild(thead_tr);
    table.appendChild(thead);
    table.appendChild(tbody);
    table.id = tableId;

    return table;
}

function SortableTable(id) {
    this.table = document.getElementById(id);
    this.lastSortedTh = null;

    if (this.table && this.table.nodeName === 'TABLE') {
        var headings = this.table.tHead.rows[0].cells;

        Object.assign([], headings).forEach(
            function (heading, index) {
                if (heading.className.match(/ascendent_sort|descendent_sort/)) {
                    this.lastSortedTh = heading;
                }
            }.bind(this),
        );

        this.setTableSortable();
    }
}

SortableTable.prototype.setTableSortable = function () {
    const headings = this.table.tHead.rows[0].cells;

    Object.assign([], headings).forEach(
        function (heading, index) {
            const sortAnchor = createAnchor.bind(this);
            const html = heading.innerHTML;
            heading.innerHTML = '';
            heading.appendChild(sortAnchor(html, index));
        }.bind(this),
    );
};

SortableTable.prototype.sortColumn = function (el, cellIndex) {
    const tBody = this.table.tBodies[0];
    const rows = this.table.rows;
    const th = el.parentNode;
    let list = [];

    Object.assign([], rows).forEach(function (row, index) {
        if (index > 0) {
            var cell = row.cells[cellIndex];
            var content = cell.textContent || cell.innerText;

            list.push({
                value: content,
                row: row,
            });
        }
    });

    const hasAscendentClassName = th.className.match('ascendent_sort');
    const hasDescendentClassName = th.className.match('descendent_sort');
    const sortBy = document.getElementById('sortBy')
    list = sortList(list, hasAscendentClassName ? -1 : 1);

    if (hasAscendentClassName) {
        th.className = th.className.replace(/ascendent_sort/, 'descendent_sort');
        sortBy.innerText = 'From high to low'
    } else {
        if (hasDescendentClassName) {
            th.className = th.className.replace(/descendent_sort/, 'ascendent_sort');
            sortBy.innerText = 'From low to high'
        } else {
            th.className += 'ascendent_sort';
            sortBy.innerText = 'From low to high'
        }
    }

    if (this.lastSortedTh && th !== this.lastSortedTh) {
        this.lastSortedTh.className = this.lastSortedTh.className.replace(
            /descendent_sort|ascendent_sort/g,
            '',
        );
    }

    this.lastSortedTh = th;

    list.forEach(function (item, index) {
        tBody.appendChild(item.row);
    });
};