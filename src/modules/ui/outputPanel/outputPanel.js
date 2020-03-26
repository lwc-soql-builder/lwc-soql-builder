import { LightningElement, api } from 'lwc';

export default class OutputPanel extends LightningElement {
    @api response;
    output;

    connectedCallback() {
        this.output = this._generateTableData(this.response);
    }

    /**
     * Covert query response to the follwoing format.
     * {
     *   totalSize: 999,
     *   columns: ['Field1', 'Field2', ...],
     *   rows: [
     *     { 'Field1':'Value1', 'Field2':'Value2', ...},
     *     ...
     *   ]
     * }
     * @param {*} res
     */
    _generateTableData(res) {
        let output = {
            totalSize: res.totalSize,
            rows: []
        };
        let columns = new Set();
        res.records.forEach(record => {
            Object.keys(record).forEach(name => {
                if (name !== 'attributes') {
                    columns.add(name);
                }
            });
        });
        output.columns = Array.from(columns);
        res.records.forEach(record => {
            let row = {
                key: Math.random()
                    .toString(36)
                    .slice(-8),
                values: []
            };
            output.columns.forEach(column => {
                row.values.push({
                    key: Math.random()
                        .toString(36)
                        .slice(-8),
                    data: record[column]
                });
            });
            output.rows.push(row);
        });
        return output;
    }
}
