import { defineWidget, log, runCallback, fetchAttr, executePromise } from 'widget-base-helpers';

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
    jsonStringAttr: '',
    onChangeMf: '',
    editable: true,
    height: 400,
    showNavigationBar: true,
    showStatusBar: true,

    _obj: null,
    _editor: null,

    constructor() {
        this.runCallback = runCallback.bind(this);
        this.log = log.bind(this);
    },

    postCreate() {
        this.log('postCreate', this._WIDGET_VERSION);

        domStyle.set(this.domNode, 'height', `${this.height}px`);

        this.addOnDestroy(() => {
            this.log('destroy');

            null !== this._editor && this._editor.destroy();
        });
    },

    update(obj, cb) {
        this.log('update');

        this._obj = obj;

        this._resetSubscriptions();
        this._updateRendering(cb);
    },

    _createEditor() {
        this.log('_createEditor');

        const views = this._isEditable() ?
            ['tree', 'view', 'form', 'code', 'text'] :
            ['view'];

        this._editor = new jsonEditor(this.domNode, {
            modes: views,
            onChange: debounce(this._onChange.bind(this), 250),
            onError: this._onError.bind(this),
            navigationBar: this.showNavigationBar,
            statusBar: this.showStatusBar,
        });
    },

    async _updateRendering(cb) {
        this.log('_updateRendering');
        if (this._obj) {
            let json = {};

            try {
                json = await this._getJSON(this._obj, this.jsonStringAttr);
            } catch (e) {
                console.error(this.id, e);
                json = null;
            }

            try {
                if (null === this._editor) {
                    this._createEditor();
                }

                this._editor.set(json);
                this.runCallback(cb, '_updateRendering');
            } catch (e) {
                console.error(this.id, e);
                this.runCallback(cb, '_updateRendering');
            }
        } else {
            this.runCallback(cb, '_updateRendering');
        }
    },

    _isEditable() {
        this.log('_isEditable');
        return this._obj && !(this.readOnly ||
            this.readonly ||
            this.get("disabled") ||
            this._obj && this._obj.isReadonlyAttr && this._obj.isReadonlyAttr(this.jsonStringAttr)) &&
            this.editable;
    },

    async _getJSON(obj, attr){
        this.log('_getJSON');
        const deferred = new Deferred();

        try {
            const str = await fetchAttr(obj, attr);
            const json = '' !== str ? JSON.parse(str) : null;
            deferred.resolve(json);
        } catch (e) {
            deferred.reject(e);
        }

        return deferred;
    },

    _onChange() {
        this.log('_onChange');
        const text = this._editor.getText();
        if (this._obj) {
            try {
                JSON.parse(text);
                this._obj.set(this.jsonStringAttr, text);

                if ('' !== this.onChangeMf) {
                    executePromise.call(this, this.onChangeMf, this._obj.getGuid());
                }
            } catch (e) {
                console.warn(this.id + '._onChange, not set:', e);
            }
        }
    },

    _onError(err) {
        this.log('_onError');
        mx.ui.exception(err);
    },

    _resetSubscriptions() {
        this.log('_resetSubscriptions');

        this.unsubscribeAll();

        if (this._obj) {
            this.subscribe({
                guid: this._obj.getGuid(),
                callback: this._updateRendering.bind(this),
            });

            // if (this.jsonStringAttr) {
            //     this.subscribe({
            //         guid: this._obj.getGuid(),
            //         attr: this.jsonStringAttr,
            //         callback: this._updateRendering.bind(this),
            //     });
            // }
        }

    },

});
