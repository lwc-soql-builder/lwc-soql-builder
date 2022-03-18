import { LightningElement, api } from 'lwc';
import * as salesforce from '../../service/salesforce';
import { showToast } from '../../base/toast/toast-manager';
import { I18nMixin } from '../../i18n/i18n';

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
                if (data instanceof Object) {
                    if (!data.totalSize) {
                        this._collectColumnMap(data, [...relationships, name]);
                    }
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

const PAGE_SIZE = 200;

export default class OutputPanel extends I18nMixin(LightningElement) {
    columns;
    rows;
    _response;
    _nextRecordsUrl;
    _allRows;

    @api
    set response(res) {
        this._response = res;
        this._nextRecordsUrl = res.nextRecordsUrl;
        const collector = new ColumnCollector(res.records);
        this.columns = collector.collect();
        const rows = this._convertQueryResponse(res);
        this._allRows = rows;
        this.rows = rows.slice(0, PAGE_SIZE);
    }
    get response() {
        return this._response;
    }

    @api
    async generateCsv() {
        const convertToCsvValue = value => {
            if (/[\n",]/.test(value)) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };
        await this._fetchSubsequentRecords(this._nextRecordsUrl);
        const header = this.columns.map(convertToCsvValue).join(',');
        const data = this._allRows
            .map(row => {
                return row.values
                    .map(cell => {
                        return convertToCsvValue(cell.data);
                    })
                    .join(',');
            })
            .join('\n');
        return `${header}\n${data}`;
    }

    handleScroll(event) {
        const { target } = event;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
            const index = this.rows.length;
            if (index < this._allRows.length) {
                this.rows = [
                    ...this.rows,
                    ...this._allRows.slice(index, index + PAGE_SIZE)
                ];
            }
            const { totalSize } = this._response;
            if (
                this._nextRecordsUrl &&
                this._allRows.length < totalSize &&
                index >= this._allRows.length - PAGE_SIZE * 2
            ) {
                this._fetchNextRecords(this._nextRecordsUrl).catch(e => {
                    console.error(e);
                    showToast({
                        message: this.i18n.OUTPUT_TABLE_FAILED_FETCH_NEXT,
                        errors: e
                    });
                });
                this._nextRecordsUrl = null;
            }
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
    _convertQueryResponse(res) {
        if (!res) return [];
        const startIdx = this._allRows ? this._allRows.length : 0;
        return res.records.map((record, rowIdx) => {
            const acutualRowIdx = startIdx + rowIdx;
            let row = {
                key: acutualRowIdx,
                values: []
            };
            this.columns.forEach((column, valueIdx) => {
                const rawData = this._getFieldValue(column, record);
                let data = rawData;
                if (data && data.totalSize) {
                    data = `${data.totalSize} rows`;
                }
                row.values.push({
                    key: `${acutualRowIdx}-${valueIdx}`,
                    data,
                    rawData,
                    column
                });
            });
            return row;
        });
    }

    _getFieldValue(column, record) {
        let value = record;
        column.split('.').forEach(name => {
            if (value) value = value[name];
        });
        return value;
    }

    async _fetchNextRecords(nextRecordsUrl) {
        if (!nextRecordsUrl) return;
        const res = await salesforce.connection.request({
            method: 'GET',
            url: nextRecordsUrl,
            headers: salesforce.getQueryHeaders()
        });
        this._nextRecordsUrl = res.nextRecordsUrl;
        this._allRows = [...this._allRows, ...this._convertQueryResponse(res)];
    }

    async _fetchSubsequentRecords(nextRecordsUrl) {
        await this._fetchNextRecords(nextRecordsUrl);
        if (this._nextRecordsUrl) {
            await this._fetchSubsequentRecords(this._nextRecordsUrl);
        }
    }
}
