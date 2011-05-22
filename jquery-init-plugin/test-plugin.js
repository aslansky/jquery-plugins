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