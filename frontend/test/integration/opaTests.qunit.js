/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/mahesh/covi19india/Covid19-India/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});