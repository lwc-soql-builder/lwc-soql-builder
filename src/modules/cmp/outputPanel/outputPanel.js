import { LightningElement, wire } from 'lwc';
import { connectStore, store } from '../../app/store/store';

export default class OutputPanel extends LightningElement {
    output;

    @wire(connectStore, { store })
    storeChange({ query }) {
        if (query.data) {
            this.output = this._generateTableData(query.data);
        } else if (query.error) {
            console.error(query.error);
        }
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
        res.records.forEach((record, rowIdx) => {
            let row = {
                key: rowIdx,
                values: []
            };
            output.columns.forEach((column, valueIdx) => {
                const rawData = record[column];
                let data = rawData;
                if (data && data.totalSize) {
                    data = `${column}(${data.totalSize})`;
                }
                row.values.push({
                    key: `${rowIdx}-${valueIdx}`,
                    data,
                    rawData
                });
            });
            output.rows.push(row);
        });
        return output;
    }
}
