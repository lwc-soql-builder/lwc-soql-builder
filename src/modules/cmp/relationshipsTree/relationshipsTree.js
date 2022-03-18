import { LightningElement, api, wire } from 'lwc';
import { getFlattenedFields } from 'soql-parser-js';
import { connectStore, store, toggleRelationship } from '../../store/store';
import { escapeRegExp } from '../../base/utils/regexp-utils';
import { fullApiName } from '../../service/salesforce';
import { I18nMixin } from '../../i18n/i18n';

export default class RelationshipsTree extends I18nMixin(LightningElement) {
    // sObject Name
    @api sobject;
    sobjectMeta;
    relationships = [];
    _keyword;
    _rawRelationships = [];
    _expandedRelationshipNames = {};
    _sobjectLabelMap;

    @api
    get keyword() {
        return this._keyword;
    }
    set keyword(value) {
        if (this._keyword !== value) {
            this._keyword = value;
            this._filterRelationships();
        }
    }

    get isNoRelationships() {
        return !this.relationships || !this.relationships.length;
    }

    @wire(connectStore, { store })
    storeChange({ sobjects, sobject, ui }) {
        if (!this._sobjectLabelMap && sobjects.data) {
            this._sobjectLabelMap = this._getSObjectLabelMap(sobjects.data);
        }
        const sobjectState = sobject[this.sobject];
        if (!sobjectState) return;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        }

        this._updateRelationships(ui.query);
    }

    selectRelationship(event) {
        const relationshipName = event.currentTarget.dataset.name;
        store.dispatch(toggleRelationship(relationshipName));
    }

    toggleChildRelationship(event) {
        const relationshipName = event.target.dataset.name;
        this._expandedRelationshipNames[relationshipName] = !this
            ._expandedRelationshipNames[relationshipName];
        this._filterRelationships();
    }

    _getSObjectLabelMap(sobjectsData) {
        return sobjectsData.sobjects.reduce((result, sobj) => {
            return {
                ...result,
                [sobj.name]: sobj.label
            };
        }, {});
    }

    _updateRelationships(query) {
        if (!this.sobjectMeta) return;
        const selectedFields = query ? this._getFlattenedFields(query) : [];
        this._rawRelationships = this.sobjectMeta.childRelationships.map(
            relation => {
                return {
                    ...relation,
                    itemLabel: `${relation.relationshipName} / ${relation.childSObject}`,
                    details: this._getRelationDetails(relation),
                    isActive: selectedFields.includes(
                        fullApiName(relation.relationshipName)
                    ),
                    isExpanded: false
                };
            }
        );
        this._filterRelationships();
    }

    _getRelationDetails(relation) {
        return `${relation.childSObject} / ${
            this._sobjectLabelMap[relation.childSObject]
        }`;
    }

    _filterRelationships() {
        let relationships;
        if (this.keyword) {
            const escapedKeyword = escapeRegExp(this.keyword);
            const keywordPattern = new RegExp(escapedKeyword, 'i');
            relationships = this._rawRelationships.filter(relation => {
                return keywordPattern.test(
                    `${relation.relationshipName} ${relation.childSObject}`
                );
            });
        } else {
            relationships = this._rawRelationships;
        }

        this.relationships = relationships.map(relation => {
            return {
                ...relation,
                isExpanded: !!this._expandedRelationshipNames[
                    relation.relationshipName
                ]
            };
        });
    }

    _getFlattenedFields(query) {
        return getFlattenedFields(query).map(field => fullApiName(field));
    }
}
