(function () {
	
	jQuery.fn.testPlugin = function(options) {
		var settings = {};
		return this.each(function() {
			if (options) { 
				$.extend(settings, options);
			}
			var html = 'plugin initialized';
			jQuery(this).html(html);
		});
	};

	describe('initPlugin',function() {

		beforeEach(function() {
			setFixtures('<div data-plugin="test-plugin"></div>');
			this.server = sinon.fakeServer.create();
		});

		
		afterEach(function () {
			this.server.restore();
		});


		describe('initializes a jquery plugin',function() {
			it(' should output "plugin initialized" in the test container', function() {
				jQuery('#jasmine-fixtures').initPlugins();
				expect(jQuery('#jasmine-fixtures div').html()).toEqual('plugin initialized');
			});
		});


		describe('loading and initialising a plugin',function() {
			it(' should load a html page and initialize the test plugin, then output "plugin initialized" in the test container', function() {
				this.server.respondWith('GET', 'load.html', [200, {'Content-Type': 'text/html' }, '<div data-plugin="test-plugin"></div>']);
				var spy = sinon.spy();
				jQuery('#jasmine-fixtures').loadAndInit('load.html', spy);
				this.server.respond();
				expect(spy).toHaveBeenCalledOnce();
				expect(jQuery('#jasmine-fixtures div').html()).toEqual('plugin initialized');
			});
		});


		describe('loading a plugin and initializing it',function() {
			it(' should load the plugin and then initializes it. the output should be "plugin initialized" in the test container', function() {
				jQuery.fn.testPlugin = null;
				this.server.respondWith(/\/*.\.js/, [
					200,
					{ 'Content-Type': 'application/x-javascript' },
					'jQuery.fn.testPlugin = function(options) {var settings = {};return this.each(function(){if (options) {$.extend(settings, options);}var html = "plugin initialized";jQuery(this).html(html);});};'
				]);
				$('#jasmine-fixtures').initPlugins({
					load: true,
					repository: ''
				});
				this.server.respond();
				expect(jQuery.isFunction($('#jasmine-fixtures').testPlugin)).toBeTruthy();
				expect($('#jasmine-fixtures div').html()).toEqual('plugin initialized');
			});
		});

	});

})();