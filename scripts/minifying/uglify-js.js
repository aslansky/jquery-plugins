function show_copyright(comments) {
	var ret = '';
	for (var i = 0; i < comments.length; ++i) {
		var c = comments[i];
		if (c.type == 'comment2' && c.value.charAt(0) === '!') {
			ret += '/*' + c.value + "*/\n";
		}
	}
	return ret;
};

//convienence function(src, [options]);
function uglify(orig_code, options){
	options || (options = {});
	var jsp = uglify.parser;
	var pro = uglify.uglify;
	
	var tok = jsp.tokenizer(orig_code), c;
	c = tok();
	var comment = show_copyright(c.comments_before);
  var ast = jsp.parse(orig_code, options.strict_semicolons); // parse code and get the initial AST
  ast = pro.ast_mangle(ast, options.mangle_options); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast, options.squeeze_options); // get an AST with compression optimizations
  var final_code = pro.gen_code(ast, options.gen_options); // compressed code here
  return comment + final_code;
};

uglify.parser = require("./parse-js");
uglify.uglify = require("./process");

module.exports = uglify;