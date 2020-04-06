import { LightningElement, wire } from 'lwc';
import { connectStore, store } from '../../app/store/store';

class ColumnCollector {
    columnMap = new Map();
    columns = [];
    records;

    constructor(records) {
        this.records = records;
    }

    collect() {
        this.records.forEach(record => {
            this._collectColumnMap(record);
        });
        this._collectColumns();
        return this.columns;
    }

    _collectColumnMap(record, relationships = []) {
        Object.keys(record).forEach(name => {
            if (name !== 'attributes') {
                let parentRelation = this.columnMap;
                relationships.forEach(relation => {
                    parentRelation = parentRelation.get(relation);
                });
                if (!parentRelation.has(name)) {
                    parentRelation.set(name, new Map());
                }
                const data = record[name];
                if (data && data.attributes) {
                    this._collectColumnMap(data, [...relationships, name]);
                }
            }
        });
    }

    _collectColumns(columnMap = this.columnMap, relationships = []) {
        for (let [name, data] of columnMap) {
            if (data.size) {
                this._collectColumns(data, [...relationships, name]);
            } else {
                this.columns.push([...relationships, name].join('.'));
            }
        }
    }
}

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
     *     [ { data:'Value1', rawData:'Value1' }, ...],
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
        const collector = new ColumnCollector(res.records);
        output.columns = collector.collect();
        res.records.forEach((record, rowIdx) => {
            let row = {
                key: rowIdx,
                values: []
            };
            output.columns.forEach((column, valueIdx) => {
                const rawData = this._getFieldValue(column, record);
                let data = rawData;
                if (data && data.totalSize) {
                    data = `${data.totalSize} rows`;
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

    _getFieldValue(column, record) {
        let value = record;
        column.split('.').forEach(name => {
            if (value) value = value[name];
        });
        return value;
    }
}
