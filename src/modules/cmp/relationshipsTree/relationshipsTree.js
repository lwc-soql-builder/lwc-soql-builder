import { LightningElement, api, wire } from 'lwc';
import { getFlattenedFields } from 'soql-parser-js';
import { connectStore, store, toggleRelationship } from '../../store/store';

export default class RelationshipsTree extends LightningElement {
    // sObject Name
    @api sobject;
    sobjectMeta;
    relationships = [];
    _keyword;
    _rawRelationships = [];
    _expandedRelationshipNames = {};

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

    @wire(connectStore, { store })
    storeChange({ sobject, ui }) {
        const sobjectState = sobject[this.sobject];
        if (!sobjectState) return;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        }

        this._updateRelationships(ui.query);
    }

    selectRelationship(event) {
        const relationshipName = event.target.dataset.name;
        store.dispatch(toggleRelationship(relationshipName));
    }

    toggleChildRelationship(event) {
        const relationshipName = event.target.dataset.name;
        this._expandedRelationshipNames[relationshipName] = !this
            ._expandedRelationshipNames[relationshipName];
        this._filterRelationships();
    }

    _updateRelationships(query) {
        if (!this.sobjectMeta) return;
        const selectedFields = query ? getFlattenedFields(query) : [];
        this._rawRelationships = this.sobjectMeta.childRelationships.map(
            relation => {
                return {
                    ...relation,
                    itemLabel: `${relation.relationshipName} / ${relation.childSObject}`,
                    isActive: selectedFields.includes(
                        relation.relationshipName
                    ),
                    isExpanded: false
                };
            }
        );
        this._filterRelationships();
    }

    _filterRelationships() {
        let relationships;
        if (this.keyword) {
            relationships = this._rawRelationships.filter(relation => {
                return `${relation.relationshipName} ${relation.childSObject}`.includes(
                    this.keyword
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
}
