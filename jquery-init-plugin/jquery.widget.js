/*global jQuery: false */

/*!
 * jQuery Widgets
 * 
 * Copyright 2011, Alexander Slansky
 * Licensed under the MIT License (LICENSE).
 */ 

/**
 * @author Alexander Slansky
 *
 * @description
 * a wrapper for initiation of jquery plugins width html5 data attributes
 *
 * @param {object} context jQuery object
 *
 * @example
 * jQuery(element).initWidgets({
 *   'load': true, // enable loading of plugin files (default: false)
 *   'repository': '/widgets' // url or relative path to directory with plugin files
 * });
 *
 *  to use a plugin within the html-source:
 *  <div data-plugin="plugin-function" data-pluginOption1="..." data-pluginOption2="..."></div>
 *
 *  usage of multiple plugin is possible:
 *  <div data-plugin="plugin-function plugin-function" data-option1="..." data-option2="..."></div>
 *
 */
(function(context) {
	var settings = {
		'load': false, // try loading plugins
		'repository': '' // url to plugin repository
	};
	
	var isLoading = [];
	var initLater = [];
	
	/*
	 * toCamel
	 *
	 * @description camelcase a string (foo-bar -> fooBar)
	 */
	var toCamel = function (value) {
		return value.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
	};
	
	/*
	 * deferredInit
	 *
	 * @description initializes the plugin after js file was loaded
	 */
	var deferredInit = function (plugin) {
		jQuery.each(initLater, function (index, item) {
			if (item[2] === plugin) {
				initPlugin.apply(this, item);
			}
		});
		isLoading.splice(jQuery.inArray(plugin, isLoading), 1);
	};
	
	/*
	 * initPlugin
	 *
	 * @description calls plugin function for the widget or tries loading plugin js file
	 */
	var initPlugin = function (ele, data, plugin, cPlugin) {
		// if widget function is alread in jquery namespace, init widget
		if (context.isFunction(ele[cPlugin])) {
			ele[cPlugin](data);
		}
		// try loading widget file
		else if (settings.load) {
			// if plugin file is already loading, defer initialization
			if (jQuery.inArray(plugin, isLoading) > -1) {
				initLater.push([ele, data, plugin, cPlugin]);
			}
			else {
				isLoading.push(plugin);
				jQuery.getScript(settings.repository + plugin + '.js', function () {
					initLater.push([ele, data, plugin, cPlugin]);
					deferredInit(plugin);
				});
			}
		}
	};
	
	/*
	 * getDataAttributes
	 *
	 * @description get data attributes and inits the plugins
	 */
	var getDataAttributes = function () {
		var ele = jQuery(this);
		var data = ele.data();
		var plugins = data.plugin.split(' ');
		delete data.plugin;
		jQuery.each(plugins, function (index, plugin) {
			initPlugin(ele, data, plugin, toCamel(plugin));
		});
	};

	/*
	 * initWidgets
	 *
	 * @description iterates over all elements with 'data-widget' attribute
	 */
	context.fn.initPlugins = function (options) {
		if (options) {
			jQuery.extend(settings, options);
		}
		return this.each(function() {
			jQuery('[data-plugin]', this).each(getDataAttributes);
		});
	};
	
	/*
	 * loadAndInit
	 *
	 * @description reinitializes widgets after loading / extends jQuery.load function
	 */
	context.fn.loadAndInit = function(url, params, callback) {
		if (context.isFunction(params)) {
			callback = params;
			params = null;
		}
		var fn = function (responseText, status, res) {
			context(this).initPlugins();
			if (context.isFunction(callback)) {
			    callback.apply(this, [responseText, status, res]);
			}
		};
		this.load(url, params, fn);
	};
	
}(jQuery));