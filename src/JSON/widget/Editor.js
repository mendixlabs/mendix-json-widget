import { defineWidget, log, runCallback, fetchAttr } from 'widget-base-helpers';

import domStyle from 'dojo/dom-style';
import debounce from 'dojo/debounce';
import Deferred from 'dojo/Deferred';

import jsonEditor from 'jsoneditor';

import 'jsoneditor/dist/jsoneditor.css';

// The following code will be stripped with our webpack loader and should only be used if you plan on doing styling
/* develblock:start */
import loadcss from 'loadcss';
loadcss(`/widgets/JSON/widget/ui/Editor.css`);
/* develblock:end */

export default defineWidget('Editor', false, {

    // Set in Modeler
    schemaStringAttr: '',
    editable: true,

    _obj: null,
    _editor: null,

    constructor() {
        this.runCallback = runCallback.bind(this);
        this.log = log.bind(this);
    },

    postCreate() {
        this.log('.postCreate', this._WIDGET_VERSION);

        domStyle.set(this.domNode, 'height', '400px');
    },

    update(obj, cb) {
        this.log('update');

        this._obj = obj;

        this._updateRendering(cb);
    },

    _updateRendering(cb) {
        if (this._obj) {
            this._getJSON(this._obj, this.jsonStringAttr)
                .then(json => {
                    if (null !== json) {
                        if (null === this._editor) {
                            const views = this._isEditable() ?
                                ['tree', 'view', 'form', 'code', 'text'] :
                                ['view'];
                            this._editor = new jsonEditor(this.domNode, {
                                modes: views,
                                onChange: debounce(this._onChange.bind(this), 250),
                            });
                        }

                        this._editor.set(json);

                        if ('' !== this.schemaStringAttr) {
                            this._getJSON(this._obj, this.schemaStringAttr)
                                .then(schema => {
                                    this._editor.setSchema(schema);
                                }, () => {
                                    //mx.ui.error(err.toString());
                                });
                        }
                    }
                    this.runCallback(cb, '_updateRendering');
                }, err => {
                    mx.ui.error(err.toString());
                    this.runCallback(cb, '_updateRendering');
                });
        } else {
            this.runCallback(cb, '_updateRendering');
        }
    },

    _isEditable() {
        return this._obj && !(this.readOnly ||
            this.readonly ||
            this.get("disabled") ||
            this._obj && this._obj.isReadonlyAttr && this._obj.isReadonlyAttr(this.jsonStringAttr)) &&
            this.editable;
    },

    _getJSON(obj, attr){
        const deferred = new Deferred();

        fetchAttr(obj, attr)
            .then(str => {
                let json;
                try {
                    json = JSON.parse(str);
                } catch (err) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve(json);
            }, deferred.reject);

        return deferred;
    },

    _onChange() {
        const text = this._editor.getText();
        if (this._obj) {
            this._obj.set(this.jsonStringAttr, text);
        }
    },

});
