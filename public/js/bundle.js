/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function(module) {\n\tif (!module.webpackPolyfill) {\n\t\tmodule.deprecate = function() {};\n\t\tmodule.paths = [];\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/module.js?");

/***/ }),

/***/ "./src/controler.js":
/*!**************************!*\
  !*** ./src/controler.js ***!
  \**************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return Controler; });\n/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model */ \"./src/model.js\");\n/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./view */ \"./src/view.js\");\n/* harmony import */ var _eventHandlers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./eventHandlers */ \"./src/eventHandlers.js\");\n/* harmony import */ var _pageLoader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pageLoader */ \"./src/pageLoader.js\");\n\r\n\r\n\r\n\r\n\r\nclass Controler {\r\n\tconstructor() {\r\n\t\tthis.mModel = new _model__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"]()\r\n\t\tthis.mView = new _view__WEBPACK_IMPORTED_MODULE_1__[/* default */ \"a\"]()\r\n\t\tthis.mEventHandler = new _eventHandlers__WEBPACK_IMPORTED_MODULE_2__[/* default */ \"a\"](this.mView)\r\n\t\tthis.mPageLoader = new _pageLoader__WEBPACK_IMPORTED_MODULE_3__[/* default */ \"a\"](this.mView)\r\n\r\n\t\tthis.initialize()\r\n\t}\r\n\r\n\tasync initialize() {\r\n\t\tthis.mModel.AddObserver(this.mPageLoader)\r\n\r\n\t\tawait this.mModel.initialise()\r\n\t\tthis.mEventHandler.initialise()\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/controler.js?");

/***/ }),

/***/ "./src/eventHandlers.js":
/*!******************************!*\
  !*** ./src/eventHandlers.js ***!
  \******************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return EventHandler; });\n/* harmony import */ var _utils_createElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/createElement */ \"./src/utils/createElement.js\");\n/* harmony import */ var _utils_clearChildren__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/clearChildren */ \"./src/utils/clearChildren.js\");\n\r\n\r\n\r\n// @brief: Class that contains all the event listeners (for clarity only)\r\nclass EventHandler {\r\n\tconstructor(pView) {\r\n\t\tthis.mView = pView\r\n\t}\r\n\r\n\tinitialise() {\r\n\t\tthis.fListenersForHeader()\r\n\t\tthis.fListenersForVideo(this.mView)\r\n\t\tthis.fListenersForSliders()\r\n\t\tthis.fListenersForThumbnails(this.mView)\r\n\t}\r\n\r\n\tfListenersForHeader() {\r\n\t\tconst fHideSections = (pClassNameToHide, pClassNameToDisplay) => {\r\n\t\t\tfor (let section of document.getElementsByClassName(\r\n\t\t\t\tpClassNameToDisplay\r\n\t\t\t)) {\r\n\t\t\t\tsection.style.display = 'inline'\r\n\t\t\t}\r\n\t\t\tfor (let section of document.getElementsByClassName(pClassNameToHide)) {\r\n\t\t\t\tsection.style.display = 'none'\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tconst films = document.getElementById('Films')\r\n\r\n\t\tfilms.addEventListener('click', (event) => {\r\n\t\t\tfHideSections('serie', 'film')\r\n\t\t})\r\n\r\n\t\tconst series = document.getElementById('Series')\r\n\r\n\t\tseries.addEventListener('click', (event) => {\r\n\t\t\tfHideSections('film', 'serie')\r\n\t\t})\r\n\t}\r\n\r\n\tfListenersForVideo(pView) {\r\n\t\tlet viewer = pView.mViewer\r\n\t\tlet back_button = pView.mBackButton\r\n\t\tlet video = pView.mVideo\r\n\t\tlet time_out\r\n\r\n\t\t// @brief: close the player when we click on the 'back' button\r\n\t\tback_button.addEventListener('click', (event) => {\r\n\t\t\t// Reduce the size of the player\r\n\r\n\t\t\tObject.assign(viewer.style, {\r\n\t\t\t\theight: '0%',\r\n\t\t\t\twidth: '0%',\r\n\t\t\t\ttop: '50%',\r\n\t\t\t\tleft: '50%',\r\n\t\t\t})\r\n\r\n\t\t\t// Hide the text of the button\r\n\t\t\tObject.assign(back_button.style, {\r\n\t\t\t\tdisplay: 'none',\r\n\t\t\t})\r\n\r\n\t\t\tfetch(video.src + '/end')\r\n\r\n\t\t\t// Reset the button so it can be visible next time\r\n\t\t\t// We use this weird code to hide the text because otherwise, if you\r\n\t\t\t// click the button and move the mouse, it stays on the screen because\r\n\t\t\t// moving the mouse in the player shows the button (see after).\r\n\t\t\tsetTimeout(() => {\r\n\t\t\t\tObject.assign(back_button.style, {\r\n\t\t\t\t\tcolor: 'transparent',\r\n\t\t\t\t\tdisplay: 'unset',\r\n\t\t\t\t\tpointerEvents: 'none',\r\n\t\t\t\t})\r\n\t\t\t\t// We also pause the video if it is playing\r\n\t\t\t\t// if (!video.paused) video.pause()\r\n\t\t\t\tvideo.src = ''\r\n\t\t\t}, 1000)\r\n\t\t})\r\n\r\n\t\t// @brief: Display controls and back button when the mouse moves in the video tag.\r\n\t\t// Hide them after a time.\r\n\t\tvideo.addEventListener('mousemove', (event) => {\r\n\t\t\tvideo.removeAttribute('class')\r\n\t\t\tback_button.style.pointerEvents = 'all'\r\n\t\t\tback_button.style.color = 'white'\r\n\r\n\t\t\tclearTimeout(time_out)\r\n\r\n\t\t\ttime_out = setTimeout(() => {\r\n\t\t\t\tvideo.setAttribute('class', 'hide-controls')\r\n\t\t\t\tback_button.style.color = 'transparent'\r\n\t\t\t}, 3000)\r\n\t\t})\r\n\r\n\t\t// video.addEventListener('play', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('durationchange', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('ended', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('loadeddata', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('loadstart', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('progress', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('ratechange', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('seeked', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('seeking', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('suspend', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t\t// video.addEventListener('waiting', (event) => {\r\n\t\t// \tconsole.log(event)\r\n\t\t// })\r\n\t}\r\n\r\n\tfListenersForSliders() {\r\n\t\tlet right_sliders = document.getElementsByClassName('right-slider')\r\n\t\tlet left_sliders = document.getElementsByClassName('left-slider')\r\n\r\n\t\tconst fMoveArea = (slider, side) => {\r\n\t\t\tlet next_carousel_id = slider.id.replace('to-', '')\r\n\t\t\tlet slider_carousel = slider.parentElement\r\n\t\t\tlet next_carousel = document.getElementById(next_carousel_id)\r\n\t\t\tlet files_area = slider_carousel.parentElement\r\n\r\n\t\t\tconst current_left_position = Number(\r\n\t\t\t\tfiles_area.style.left.replace('px', '')\r\n\t\t\t)\r\n\r\n\t\t\t// Move the area of a carousel's width to the left or right\r\n\t\t\tconst shift =\r\n\t\t\t\tside === 'left'\r\n\t\t\t\t\t? -slider_carousel.clientWidth\r\n\t\t\t\t\t: +next_carousel.clientWidth\r\n\t\t\tfiles_area.style.left = `${current_left_position + shift}px`\r\n\r\n\t\t\t// Hide the sliders of the current carousel\r\n\t\t\tfor (let link of slider_carousel.getElementsByClassName('slider')) {\r\n\t\t\t\tlink.style.display = 'none'\r\n\t\t\t}\r\n\r\n\t\t\t// And display the one of the new carousel\r\n\t\t\tfor (let link of next_carousel.getElementsByClassName('slider')) {\r\n\t\t\t\tlink.style.display = 'inherit'\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tfor (let right_slider of right_sliders) {\r\n\t\t\tright_slider.addEventListener('click', (event) => {\r\n\t\t\t\tfMoveArea(right_slider, 'left')\r\n\t\t\t})\r\n\t\t}\r\n\r\n\t\t// Same but we move it right\r\n\t\tfor (let left_slider of left_sliders) {\r\n\t\t\tleft_slider.addEventListener('click', (event) => {\r\n\t\t\t\tfMoveArea(left_slider, 'right')\r\n\t\t\t})\r\n\t\t}\r\n\t}\r\n\r\n\tfListenersForThumbnails(pView) {\r\n\t\tlet thumbnails = document.getElementsByClassName('thumbnail')\r\n\r\n\t\tfor (let thumbnail of thumbnails) {\r\n\t\t\tconst video_source = `${thumbnail.poster.replace('/thumbnail:', '')}`\r\n\t\t\tconst file_description = thumbnail.parentElement.getElementsByClassName(\r\n\t\t\t\t'file-name'\r\n\t\t\t)[0]\r\n\r\n\t\t\t// Open and play the selected video on click\r\n\t\t\tthumbnail.addEventListener('click', (event) => {\r\n\t\t\t\tconst language = pView.mUserLanguage.selectedOptions[0].value\r\n\r\n\t\t\t\tconst viewer_style = {\r\n\t\t\t\t\theight: '100%',\r\n\t\t\t\t\twidth: '100%',\r\n\t\t\t\t\ttop: '0%',\r\n\t\t\t\t\tleft: '0%',\r\n\t\t\t\t}\r\n\r\n\t\t\t\tObject.assign(pView.mViewer.style, viewer_style)\r\n\r\n\t\t\t\t// Play back the video it it was the last one playing\r\n\t\t\t\tif (pView.mVideo.src.includes(video_source))\r\n\t\t\t\t\tpView.mVideo.play().catch((error) => {\r\n\t\t\t\t\t\tconsole.log(error)\r\n\t\t\t\t\t})\r\n\t\t\t\t// Else load it\r\n\t\t\t\telse {\r\n\t\t\t\t\tpView.mVideo.src = `${video_source}/${language}`\r\n\t\t\t\t\tpView.mVideo.poster = thumbnail.poster\r\n\t\t\t\t\tpView.mVideo.load()\r\n\t\t\t\t}\r\n\t\t\t\t// Play it after a little time\r\n\t\t\t\tsetTimeout(async () => {\r\n\t\t\t\t\tObject(_utils_clearChildren__WEBPACK_IMPORTED_MODULE_1__[/* default */ \"a\"])(pView.mVideo)\r\n\r\n\t\t\t\t\tconst CreateTrack = (pOptions) => {\r\n\t\t\t\t\t\tconst track = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('track', {\r\n\t\t\t\t\t\t\tid: pOptions.id,\r\n\t\t\t\t\t\t\tkind: 'captions',\r\n\t\t\t\t\t\t\tlabel: pOptions.label,\r\n\t\t\t\t\t\t\tsrc:\r\n\t\t\t\t\t\t\t\tthumbnail.poster.replace('thumbnail', 'subtitles') +\r\n\t\t\t\t\t\t\t\t'/' +\r\n\t\t\t\t\t\t\t\tpOptions.language,\r\n\t\t\t\t\t\t\tdefault: pOptions.default,\r\n\t\t\t\t\t\t})\r\n\r\n\t\t\t\t\t\ttrack.addEventListener('load', (event) => {\r\n\t\t\t\t\t\t\tlet cues = event.target.track.cues\r\n\t\t\t\t\t\t\tif (!cues || !cues.length) return\r\n\r\n\t\t\t\t\t\t\tlet index = 0\r\n\r\n\t\t\t\t\t\t\tfor (index = 0; index < cues.length; ++index) {\r\n\t\t\t\t\t\t\t\tlet cue = cues[index]\r\n\t\t\t\t\t\t\t\tcue.snapToLines = false\r\n\t\t\t\t\t\t\t\tcue.line = 90\r\n\t\t\t\t\t\t\t}\r\n\t\t\t\t\t\t})\r\n\r\n\t\t\t\t\t\tpView.mVideo.appendChild(track)\r\n\t\t\t\t\t}\r\n\r\n\t\t\t\t\tCreateTrack({\r\n\t\t\t\t\t\tid: 'sub-video-fre-forced',\r\n\t\t\t\t\t\tlabel: 'French Forced',\r\n\t\t\t\t\t\tlanguage: 'fre_forced',\r\n\t\t\t\t\t\tdefault: true,\r\n\t\t\t\t\t})\r\n\r\n\t\t\t\t\tCreateTrack({\r\n\t\t\t\t\t\tid: 'sub-video-eng-forced',\r\n\t\t\t\t\t\tlabel: 'English Forced',\r\n\t\t\t\t\t\tlanguage: 'eng_forced',\r\n\t\t\t\t\t\tdefault: false,\r\n\t\t\t\t\t})\r\n\r\n\t\t\t\t\tCreateTrack({\r\n\t\t\t\t\t\tid: 'sub-video-fre',\r\n\t\t\t\t\t\tlabel: 'French',\r\n\t\t\t\t\t\tlanguage: 'fre',\r\n\t\t\t\t\t\tdefault: false,\r\n\t\t\t\t\t})\r\n\r\n\t\t\t\t\tCreateTrack({\r\n\t\t\t\t\t\tid: 'sub-video-eng',\r\n\t\t\t\t\t\tlabel: 'English',\r\n\t\t\t\t\t\tlanguage: 'eng',\r\n\t\t\t\t\t\tdefault: false,\r\n\t\t\t\t\t})\r\n\r\n\t\t\t\t\tpView.mVideo.play().catch((error) => {\r\n\t\t\t\t\t\tconsole.log(error)\r\n\t\t\t\t\t})\r\n\r\n\t\t\t\t\tconst { top, left } = pView.mVideo.getBoundingClientRect()\r\n\r\n\t\t\t\t\tObject.assign(pView.mBackButton.style, {\r\n\t\t\t\t\t\ttop: top + 20 + 'px',\r\n\t\t\t\t\t\tleft: left + 20 + 'px',\r\n\t\t\t\t\t})\r\n\t\t\t\t}, 500)\r\n\t\t\t})\r\n\r\n\t\t\tlet tPlayPreview = null\r\n\t\t\t// Plays the preview on over\r\n\t\t\tthumbnail.addEventListener('mouseenter', (event) => {\r\n\t\t\t\tif (tPlayPreview) clearTimeout(tPlayPreview)\r\n\r\n\t\t\t\tfile_description.style.color = 'white'\r\n\r\n\t\t\t\ttPlayPreview = setTimeout(() => {\r\n\t\t\t\t\tthumbnail.src = thumbnail.poster.replace('/thumbnail:', '/preview:')\r\n\t\t\t\t\t// thumbnail.load()\r\n\t\t\t\t\tthumbnail.play()\r\n\t\t\t\t}, 1500)\r\n\t\t\t})\r\n\r\n\t\t\tthumbnail.addEventListener('mouseleave', (event) => {\r\n\t\t\t\tif (tPlayPreview) clearTimeout(tPlayPreview)\r\n\t\t\t\tthumbnail.style.opacity = '0.7'\r\n\r\n\t\t\t\tfile_description.style.color = 'transparent'\r\n\r\n\t\t\t\ttPlayPreview = setTimeout(() => {\r\n\t\t\t\t\tthumbnail.src = ''\r\n\t\t\t\t\tthumbnail.style.opacity = '1'\r\n\t\t\t\t}, 1000)\r\n\t\t\t})\r\n\r\n\t\t\tthumbnail.addEventListener('ended', (event) => {\r\n\t\t\t\tif (tPlayPreview) clearTimeout(tPlayPreview)\r\n\r\n\t\t\t\ttPlayPreview = setTimeout(() => {\r\n\t\t\t\t\tthumbnail.src = ''\r\n\t\t\t\t}, 1000)\r\n\t\t\t})\r\n\t\t}\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/eventHandlers.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no exports provided */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _controler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./controler */ \"./src/controler.js\");\n\r\n\r\nlet controler = new _controler__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"]()\r\n\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ }),

/***/ "./src/model.js":
/*!**********************!*\
  !*** ./src/model.js ***!
  \**********************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return Model; });\n/* harmony import */ var _observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./observable */ \"./src/observable.js\");\n/* harmony import */ var _utils_removeChar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/removeChar */ \"./src/utils/removeChar.js\");\n/* harmony import */ var _utils_removeChar__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_utils_removeChar__WEBPACK_IMPORTED_MODULE_1__);\n\r\n\r\n\r\nclass Model extends _observable__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"] {\r\n\tconstructor() {\r\n\t\tsuper()\r\n\t}\r\n\r\n\tasync initialise() {\r\n\t\tlet response = await fetch('/data')\r\n\r\n\t\tif (!response.ok) console.log('HTTP-Error: ' + response.status)\r\n\r\n\t\tlet data_from_server = await response.json()\r\n\r\n\t\tthis.mPathToFiles = {}\r\n\t\tthis.mCategories = []\r\n\t\tthis.mSeasons = []\r\n\t\tthis.mTitles = []\r\n\r\n\t\tthis.fUnpack(data_from_server)\r\n\r\n\t\tthis.SetChanged()\r\n\t\tthis.NotifyObservers()\r\n\t}\r\n\r\n\t// Destructurate the tree sent by the server into several objects\r\n\tfUnpack(tree, path = '/') {\r\n\t\tlet folder_contains_only_files = true\r\n\r\n\t\tfor (let key of Object.keys(tree)) {\r\n\t\t\tlet node = tree[key]\r\n\t\t\tnode.name = key\r\n\r\n\t\t\tkey = Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_1__[\"RemoveChar\"])(key, ' ')\r\n\r\n\t\t\tif (node.isFile) {\r\n\t\t\t\tthis.mPathToFiles[path + key] = node\r\n\t\t\t\tcontinue\r\n\t\t\t} else {\r\n\t\t\t\tfolder_contains_only_files = false\r\n\t\t\t}\r\n\r\n\t\t\tconst does_folder_contain_only_files = this.fUnpack(\r\n\t\t\t\tnode.children,\r\n\t\t\t\tpath + key + '/'\r\n\t\t\t)\r\n\r\n\t\t\tif (node.parent === '') {\r\n\t\t\t\tthis.mCategories.push(node)\r\n\t\t\t\tcontinue\r\n\t\t\t}\r\n\r\n\t\t\tif (\r\n\t\t\t\t!does_folder_contain_only_files ||\r\n\t\t\t\t!node.name.toLowerCase().includes('season')\r\n\t\t\t) {\r\n\t\t\t\tthis.mTitles.push(node)\r\n\t\t\t} else this.mSeasons.push(node)\r\n\t\t}\r\n\r\n\t\treturn folder_contains_only_files\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/model.js?");

/***/ }),

/***/ "./src/observable.js":
/*!***************************!*\
  !*** ./src/observable.js ***!
  \***************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return Observable; });\nclass Observable {\r\n\tconstructor() {\r\n\t\tthis.mObservers = []\r\n\t\tthis.mState = false\r\n\t}\r\n\r\n\tAddObserver(pObserver) {\r\n\t\tthis.mObservers.push(pObserver)\r\n\t}\r\n\r\n\tSetChanged() {\r\n\t\tthis.mState = true\r\n\t}\r\n\r\n\tNotifyObservers(pOptions = null) {\r\n\t\tif (this.mState) {\r\n\t\t\tthis.mObservers.forEach((pObserver) => {\r\n\t\t\t\tpObserver.OnUpdate(this, pOptions)\r\n\t\t\t})\r\n\t\t\tthis.mState = false\r\n\t\t}\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/observable.js?");

/***/ }),

/***/ "./src/observer.js":
/*!*************************!*\
  !*** ./src/observer.js ***!
  \*************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return Observer; });\nclass Observer {\r\n\tconstructor(pView) {\r\n\t\tthis.mView = pView\r\n\t}\r\n\r\n\tOnUpdate(pModel, pOption) {\r\n\t\tthrow new Error('This method has to be override!')\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/observer.js?");

/***/ }),

/***/ "./src/pageLoader.js":
/*!***************************!*\
  !*** ./src/pageLoader.js ***!
  \***************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return PageLoader; });\n/* harmony import */ var _observer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./observer */ \"./src/observer.js\");\n\r\n\r\nclass PageLoader extends _observer__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"] {\r\n\tconstructor(pView) {\r\n\t\tsuper(pView)\r\n\t}\r\n\r\n\tOnUpdate(pModel, pOption) {\r\n\t\tlet data = {\r\n\t\t\tpaths: pModel.mPathToFiles,\r\n\t\t\tcategories: pModel.mCategories,\r\n\t\t\ttitles: pModel.mTitles,\r\n\t\t\tseasons: pModel.mSeasons,\r\n\t\t}\r\n\r\n\t\tthis.mView.Load(data)\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/pageLoader.js?");

/***/ }),

/***/ "./src/utils/clearChildren.js":
/*!************************************!*\
  !*** ./src/utils/clearChildren.js ***!
  \************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony default export */ __webpack_exports__[\"a\"] = ((element) => {\r\n\twhile (element.firstChild) element.removeChild(element.firstChild)\r\n});\r\n\n\n//# sourceURL=webpack:///./src/utils/clearChildren.js?");

/***/ }),

/***/ "./src/utils/createElement.js":
/*!************************************!*\
  !*** ./src/utils/createElement.js ***!
  \************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/**\r\n * @brief\r\n * Create a HTML element, directly with children and attributes.\r\n *\r\n * @param {String} tag: The tag name of the element.\r\n * @param {Object} attribute: An object containing the element's attribute(s).\r\n * @param {Array} children: The list of the element's children.\r\n *\r\n */\r\n/* harmony default export */ __webpack_exports__[\"a\"] = ((tag, attribute = {}, children = []) => {\r\n\tif (typeof tag === undefined) return\r\n\tif (typeof attribute !== 'object') return\r\n\tif (typeof children === undefined) children = []\r\n\r\n\tlet element = document.createElement(tag)\r\n\tfor (let key in attribute) {\r\n\t\telement[key] = attribute[key]\r\n\t}\r\n\r\n\tif (!Array.isArray(children)) children = [children]\r\n\r\n\tfor (let i = 0; i < children.length; ++i) {\r\n\t\tif (children[i].tagName) element.appendChild(children[i])\r\n\t\telse element.appendChild(document.createElement(children[i]))\r\n\t}\r\n\r\n\treturn element\r\n});\r\n\n\n//# sourceURL=webpack:///./src/utils/createElement.js?");

/***/ }),

/***/ "./src/utils/removeChar.js":
/*!*********************************!*\
  !*** ./src/utils/removeChar.js ***!
  \*********************************/
/*! no static exports found */
/*! exports used: RemoveChar */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(module) {\r\n\r\nif (!module) {\r\n\texports = { ReplaceChar, RemoveChar }\r\n}\r\n\r\nconst ReplaceChar = (str, which, by) => {\r\n\tlet result = str\r\n\twhile (result.includes(which)) result = result.replace(which, by)\r\n\treturn result\r\n}\r\n\r\nconst RemoveChar = (str, char) => {\r\n\treturn ReplaceChar(str, char, '')\r\n}\r\n\r\nif (module) {\r\n\tmodule.exports = { ReplaceChar, RemoveChar }\r\n}\r\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./src/utils/removeChar.js?");

/***/ }),

/***/ "./src/view.js":
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return View; });\n/* harmony import */ var _utils_createElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/createElement */ \"./src/utils/createElement.js\");\n/* harmony import */ var _utils_clearChildren__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/clearChildren */ \"./src/utils/clearChildren.js\");\n/* harmony import */ var _utils_removeChar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/removeChar */ \"./src/utils/removeChar.js\");\n/* harmony import */ var _utils_removeChar__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__);\n\r\n\r\n\r\n\r\nclass View {\r\n\tconstructor() {\r\n\t\tthis.mContainer = document.getElementById('container')\r\n\t\tthis.mHeader = document.getElementById('header')\r\n\t\tthis.mUserLanguage = document.getElementById('user-language')\r\n\r\n\t\tthis.mViewer = document.getElementById('viewer')\r\n\t\tthis.mVideo = document.getElementById('main-video')\r\n\t\tthis.mBackButton = document.getElementById('go-back')\r\n\r\n\t\tthis.mTitles = {}\r\n\t}\r\n\r\n\tLoad(pData) {\r\n\t\tthis.BuildCategories(pData.categories)\r\n\t\tthis.BuildTitles(pData.titles)\r\n\t\tthis.BuildSeasons(pData.seasons)\r\n\t\tthis.BuildFiles(pData.paths)\r\n\r\n\t\tfor (let selecter of document.getElementsByTagName('select')) {\r\n\t\t\tthis.DisplayFilesForSeason(\r\n\t\t\t\tselecter.parentElement,\r\n\t\t\t\tObject(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(selecter.selectedOptions[0].id, ' ')\r\n\t\t\t)\r\n\t\t}\r\n\t}\r\n\r\n\tDisplayFilesForSeason(pTitle, pSeason) {\r\n\t\tpSeason = pSeason.toLowerCase()\r\n\r\n\t\tfor (let files_area of pTitle.getElementsByTagName('div')) {\r\n\t\t\tif (files_area.className !== 'files-area') continue\r\n\t\t\tif (files_area.id.toLowerCase().includes(pSeason))\r\n\t\t\t\tfiles_area.style.display = 'flex'\r\n\t\t\telse files_area.style.display = 'none'\r\n\t\t}\r\n\t}\r\n\r\n\tBuildCategories(pCategories) {\r\n\t\tlet categories = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('div', {\r\n\t\t\tid: 'categories',\r\n\t\t})\r\n\r\n\t\tfor (let categorie of pCategories) {\r\n\t\t\tconst categorie_name = Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(`${categorie.name}`, ' ')\r\n\t\t\tlet categorie_item = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('a', {\r\n\t\t\t\tclassName: 'categories-item',\r\n\t\t\t\tid: categorie_name,\r\n\t\t\t\tinnerHTML: `${categorie.name}`,\r\n\t\t\t\t// href: `./${categorie.name}`,\r\n\t\t\t})\r\n\r\n\t\t\tcategories.appendChild(categorie_item)\r\n\t\t}\r\n\r\n\t\tthis.mHeader.appendChild(categories)\r\n\t}\r\n\r\n\tBuildTitles(pTitles) {\r\n\t\tObject(_utils_clearChildren__WEBPACK_IMPORTED_MODULE_1__[/* default */ \"a\"])(this.mContainer)\r\n\r\n\t\tfor (let title of pTitles) {\r\n\t\t\tlet title_name = Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(`${title.name}`, ' ')\r\n\r\n\t\t\tlet section = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('div', {\r\n\t\t\t\tclassName:\r\n\t\t\t\t\t'section flex-item' +\r\n\t\t\t\t\t(title.parent === 'Series' ? ' serie' : ' film'),\r\n\t\t\t\tid: title_name,\r\n\t\t\t\tinnerHTML: `${title.name}`,\r\n\t\t\t})\r\n\r\n\t\t\tthis.mTitles[title_name] = section\r\n\r\n\t\t\tthis.mContainer.appendChild(section)\r\n\t\t}\r\n\t}\r\n\r\n\tBuildSeasons(pSeasons) {\r\n\t\tfor (let season of pSeasons) {\r\n\t\t\tlet serie = this.mTitles[Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(season.parent, ' ')]\r\n\r\n\t\t\tif (serie === undefined) continue\r\n\r\n\t\t\tif (serie.children.length > 0) {\r\n\t\t\t\tlet season_selecter = serie.children[0]\r\n\t\t\t\tconst option = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('option', {\r\n\t\t\t\t\tvalue: `${season.name}`,\r\n\t\t\t\t\tid: Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(`${season.name}`, ' '),\r\n\t\t\t\t\tinnerHTML: `${season.name}`,\r\n\t\t\t\t})\r\n\r\n\t\t\t\tseason_selecter.appendChild(option)\r\n\t\t\t\tcontinue\r\n\t\t\t}\r\n\r\n\t\t\tlet season_selecter = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('select', {\r\n\t\t\t\tclassName: 'season-selecter',\r\n\t\t\t\tinnerHTML: `<option id=\"${Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(`${season.name}`, ' ')}\" value=\"${\r\n\t\t\t\t\tseason.name\r\n\t\t\t\t}\">${season.name}</options>`,\r\n\t\t\t})\r\n\r\n\t\t\tseason_selecter.addEventListener('change', (event) => {\r\n\t\t\t\tthis.DisplayFilesForSeason(\r\n\t\t\t\t\tserie,\r\n\t\t\t\t\tObject(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(event.target.selectedOptions[0].id, ' ')\r\n\t\t\t\t)\r\n\t\t\t})\r\n\r\n\t\t\tserie.appendChild(season_selecter)\r\n\t\t}\r\n\t}\r\n\r\n\tBuildFiles(pPaths) {\r\n\t\tfor (let path of Object.keys(pPaths)) {\r\n\t\t\tlet file = pPaths[path]\r\n\t\t\tlet split = path.split('/')\r\n\r\n\t\t\t// Folder is equal to path without the name of the file (which is the last element of 'split')\r\n\t\t\tlet folder = path.replace(`/${split[split.length - 1]}`, '')\r\n\r\n\t\t\t// Here the file can be either an episode of a serie, or a film.\r\n\t\t\t// If it is an episode, its parent contains 'season' in its name\r\n\t\t\t// so to get the title of this serie we have to take the name of\r\n\t\t\t// the parent of the parent of 'file', which is 'split[split.length - 3]'\r\n\t\t\t// Else, file's parent is the name of the movie\r\n\t\t\tlet title = file.parent.toLowerCase().includes('season')\r\n\t\t\t\t? split[split.length - 3]\r\n\t\t\t\t: file.parent\r\n\r\n\t\t\ttitle = Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(title, ' ')\r\n\r\n\t\t\tlet section = this.mTitles[title]\r\n\r\n\t\t\t// We get the area were the file will be displayed\r\n\t\t\tlet files_area = document.getElementById(folder)\r\n\r\n\t\t\t// If it doesn't exist, we create it. We add to it the\r\n\t\t\t// first carousel\r\n\t\t\tif (files_area === null || files_area === undefined) {\r\n\t\t\t\tfiles_area = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])(\r\n\t\t\t\t\t'div',\r\n\t\t\t\t\t{\r\n\t\t\t\t\t\tclassName: 'files-area',\r\n\t\t\t\t\t\tid: folder,\r\n\t\t\t\t\t},\r\n\t\t\t\t\t[\r\n\t\t\t\t\t\tObject(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('div', {\r\n\t\t\t\t\t\t\tclassName: 'carousel',\r\n\t\t\t\t\t\t\tid: folder + 'carousel-0',\r\n\t\t\t\t\t\t}),\r\n\t\t\t\t\t]\r\n\t\t\t\t)\r\n\t\t\t\t// And add it to the section\r\n\t\t\t\tsection.appendChild(files_area)\r\n\t\t\t}\r\n\r\n\t\t\tconst server_path_to_file = `${files_area.id}/${Object(_utils_removeChar__WEBPACK_IMPORTED_MODULE_2__[\"RemoveChar\"])(\r\n\t\t\t\tfile.name,\r\n\t\t\t\t' '\r\n\t\t\t)}`\r\n\r\n\t\t\tconst file_info = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])(\r\n\t\t\t\t'div',\r\n\t\t\t\t{\r\n\t\t\t\t\tclassName: 'file-info',\r\n\t\t\t\t},\r\n\t\t\t\t[\r\n\t\t\t\t\tObject(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('div', {\r\n\t\t\t\t\t\tclassName: 'file-name',\r\n\t\t\t\t\t\tinnerHTML: file.name\r\n\t\t\t\t\t\t\t.replace(/S0*(\\w+)E0*/, 'S$1:E')\r\n\t\t\t\t\t\t\t.replace(/([0-9]*) - /, '$1 - \"')\r\n\t\t\t\t\t\t\t.replace('HASH', '#')\r\n\t\t\t\t\t\t\t.replace(/(.*)\\.+(.*)/, '$1\"'),\r\n\t\t\t\t\t}),\r\n\t\t\t\t]\r\n\t\t\t)\r\n\r\n\t\t\tlet thumbnail = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('video', {\r\n\t\t\t\tclassName: 'thumbnail',\r\n\t\t\t\tposter: `/thumbnail:${server_path_to_file}`,\r\n\t\t\t})\r\n\r\n\t\t\tfile_info.appendChild(thumbnail)\r\n\t\t\tconst current_carousel = files_area.lastChild\r\n\r\n\t\t\t// If the current carousel is full (meaning it contains 5 thumbnails)\r\n\t\t\tif (current_carousel.getElementsByTagName('video').length == 5) {\r\n\t\t\t\t// Then we have to create a new one to add the thumbnail.\r\n\t\t\t\t// This thumbnail will be the first of its carousel, so it has\r\n\t\t\t\t// to have its z-index at 1 so that the right slider of the previous\r\n\t\t\t\t// carousel is over it when this new carousel is not active.\r\n\t\t\t\tfile_info.style.zIndex = 1\r\n\r\n\t\t\t\t// We create a slider so that the previous carousel can give access\r\n\t\t\t\t// to this new one. As 'file-area' only contains carousels, it 'childCount\"\r\n\t\t\t\t// can be used to ID the carousels inside of it\r\n\t\t\t\tconst carousel_count = files_area.childElementCount\r\n\r\n\t\t\t\tlet right_slider = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('a', {\r\n\t\t\t\t\tclassName: 'slider right-slider',\r\n\t\t\t\t\tinnerHTML: '>',\r\n\t\t\t\t\tid: `to-${folder}carousel-${carousel_count}`,\r\n\t\t\t\t})\r\n\r\n\t\t\t\t// All the sliders are hidden except for the first one on the right.\r\n\t\t\t\t// They will be displayed dynamically later. So if their is only one\r\n\t\t\t\t// carousel, we have to display its slider.\r\n\t\t\t\tif (carousel_count === 1) right_slider.style.display = 'inherit'\r\n\r\n\t\t\t\t// We also need to create a slider for our new carousel so it give\r\n\t\t\t\t// us access to the previous one.\r\n\t\t\t\tlet left_slider = Object(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])('a', {\r\n\t\t\t\t\tclassName: 'slider left-slider',\r\n\t\t\t\t\tinnerHTML: '<',\r\n\t\t\t\t\tid: `to-${folder}carousel-${carousel_count - 1}`,\r\n\t\t\t\t})\r\n\r\n\t\t\t\t// We add the right slider to the current carousel\r\n\t\t\t\tcurrent_carousel.appendChild(right_slider)\r\n\r\n\t\t\t\t// And we create the new one, with the left slider\r\n\t\t\t\t// as children\r\n\t\t\t\tfiles_area.appendChild(\r\n\t\t\t\t\tObject(_utils_createElement__WEBPACK_IMPORTED_MODULE_0__[/* default */ \"a\"])(\r\n\t\t\t\t\t\t'div',\r\n\t\t\t\t\t\t{\r\n\t\t\t\t\t\t\tclassName: 'carousel',\r\n\t\t\t\t\t\t\tid: folder + 'carousel-' + files_area.childElementCount,\r\n\t\t\t\t\t\t},\r\n\t\t\t\t\t\t[left_slider]\r\n\t\t\t\t\t)\r\n\t\t\t\t)\r\n\t\t\t}\r\n\r\n\t\t\t// And finally, we add the thumbnail to the correct carousel\r\n\t\t\t// files_area.lastChild.appendChild(thumbnail)\r\n\t\t\tfiles_area.lastChild.appendChild(file_info)\r\n\t\t}\r\n\t}\r\n}\r\n\n\n//# sourceURL=webpack:///./src/view.js?");

/***/ })

/******/ });