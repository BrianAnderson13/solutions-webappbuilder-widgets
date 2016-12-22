///////////////////////////////////////////////////////////////////////////
// Copyright (c) 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

/*global define*/
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/topic',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-style',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/popup',
    'esri/layers/GraphicsLayer',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/graphic',
    'esri/toolbars/draw',
    'dijit/TooltipDialog',
    './CoordinateInput',
    './EditOutputCoordinate',
    'dojo/text!./templates/TabLLOS.html'
], function (
    dojoDeclare,
    dojoLang,
    dojoOn,
    dojoTopic,
    dojoDomAttr,
    dojoDomClass,
    dojoDomStyle,
    dijitWidgetBase,
    dijitTemplatedMixin,
    dijitWidgetsInTemplate,
    DijitPopup,
    EsriGraphicsLayer,
    EsriSimpleMarkerSymbol,
    Graphic,
    Draw,
    DijitTooltipDialog,
    CoordInput,
    EditOutputCoordinate,
    templateStr
) {
    'use strict';
    return dojoDeclare([dijitWidgetBase, dijitTemplatedMixin, dijitWidgetsInTemplate], {
        templateString: templateStr,
        baseClass: 'jimu-widget-TabLLOS',

        /**
         * class constructor
         **/
        constructor: function (args) {
          dojoDeclare.safeMixin(this, args);
        },

        /**
         * dijit post create
         **/
        postCreate: function () {

          this._llosGL = new EsriGraphicsLayer();
        
          this.map.addLayers([this._llosGL]);

          this._pointSym = new EsriSimpleMarkerSymbol(this.pointSymbol);

          this._drawTb = new Draw(this.map);

          //this.coordTool = new CoordInput({ appConfig: this.appConfig }, this.startPointCoords);
          //this.coordTool.inputCoordinate.formatType = 'DD';

          this.coordinateFormat = new DijitTooltipDialog({
              content: new EditOutputCoordinate(),
              style: 'width: 400px'
          });

          dojoDomAttr.set(this.observerOffset, 'value', '2');
          dojoDomAttr.set(this.targetOffset, 'value', '0');

          this.syncEvents();
        },

        /**
         *
         **/
        syncEvents: function () {
          dojoTopic.subscribe('VISIBILITY_WIDGET_OPEN', dojoLang.hitch(this, this.setGraphicsShown));
          dojoTopic.subscribe('VISIBILITY_WIDGET_CLOSE', dojoLang.hitch(this, this.setGraphicsHidden));

          this.own(dojoOn(
            this.coordinateFormatButton,
            'click',
            dojoLang.hitch(this, this.coordinateFormatButtonWasClicked)
          ));

          this.own(dojoOn(
            this.clearGraphicsButton,
            'click',
            dojoLang.hitch(this, this.clearGraphics)
          ));

          this.own(
            this._drawTb.on(
              'draw-end',
              dojoLang.hitch(this, this.addGraphic)
          ));

          this.own(dojoOn(
            this.observerPointBtn,
            'click',
            dojoLang.hitch(this, this.observerPointButtonWasClicked)
          ));

          this.own(dojoOn(
            this.targetPointBtn,
            'click',
            dojoLang.hitch(this, this.targetPointButtonWasClicked)
          ));

        },

        /**
         * Observer Point button click event
         **/
        observerPointButtonWasClicked: function () {
          this.map.disableMapNavigation();
          this._drawTb.activate('point');
          dojoDomClass.toggle(this.observerPointBtn, 'jimu-state-active');
        },

        /**
        * Target Point button click event
        **/
        targetPointButtonWasClicked: function () {
            this.map.disableMapNavigation();
            this._drawTb.activate('point');
            dojoDomClass.toggle(this.targetPointBtn, 'jimu-state-active');
        },

        /**
        *
        **/
        coordinateFormatButtonWasClicked: function () {
            this.coordinateFormat.content.set('ct', this.coordTool.inputCoordinate.inputType);
            DijitPopup.open({
                popup: this.coordinateFormat,
                around: this.coordinateFormatButton
            });
        },

        addGraphic: function(evt){
            //deactivate the toolbar and clear existing graphics 
            this._drawTb.deactivate(); 
            this.map.enableMapNavigation();

            // figure out which symbol to use
            var symbol;
            if (evt.geometry.type === "point" || evt.geometry.type === "multipoint") {
                symbol = this._pointSym;
            }

            this._llosGL.add(new Graphic(evt.geometry, symbol));

        },

        /**
         *
         **/
        clearGraphics: function () {
            if (this._llosGL) {
                this._llosGL.clear();
            dojoDomAttr.set(this.observerPointCoords, 'value', '');
            dojoDomAttr.set(this.targetPointCoords, 'value', '');
            dojoDomAttr.set(this.observerPointCoordsList, 'value', '');
            dojoDomAttr.set(this.targetPointCoordsList, 'value', '');

          }
        },

        /**
         *
         **/
        setGraphicsHidden: function () {
            if (this._llosGL) {
                this._llosGL.hide();
          }
        },

        /**
         *
         **/
        setGraphicsShown: function () {
            if (this._llosGL) {
                this._llosGL.show();
          }
        }
    });
});
