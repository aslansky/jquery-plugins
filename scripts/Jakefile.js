/*
* Jquery-Plugins
* Copyright 2011 Alexander Slansky (alexander@slansky.net)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
require("./node-libs/plugins/fs-node");
var async = require('./node-libs/async'),
		colours = require('./node-libs/colours'),
		exec = require('child_process').exec,
		fs = require('fs'),
		path = require('path'),
		JSLINT = require('./node-libs/jslint.js'),
		uglify = require('./minifying/uglify-js'),
		lintOpts = {
			bitwise: true,
			browser: true,
			newcap: true,
			nomen: true,
			undef: true,
			white: true,
			indent: 4
		};


desc('Minimizes jquery.*.js files in all subdirectories.');
task('default', function() {
	console.log('Minimizing files ...');
	async.walkfiles('.')
		.filter(function(file) {
			return (file.name.search(/jquery\..*\.js/) === -1 || file.name.indexOf('.min') > -1 || file.name.indexOf('.xml') > -1) ? false : true;
		})
		.readFile("utf8")
		.each(function(file) {
			fs.writeFileSync(file.path.replace(/js/, 'min.js'), uglify(file.data), 'utf8');
		})
		.end(complete);
}, true);


desc('Runs js lint for all jquery.*.js files.');
task('lint', function(params) {
	console.log('Running jslint ...');
	async.walkfiles('.')
		.filter(function(file) {
			return (file.name.search(/jquery\..*\.js/) === -1 || file.name.indexOf('.min') > -1 || file.name.indexOf('.xml') > -1) ? false : true;
		})
		.readFile("utf8")
		.each(function(file) {
			if (!JSLINT(file.data)) {
				console.log(showErrors(file.name, JSLINT.errors) + '\n');
				if (params) {
					fs.writeFileSync(__dirname + '/testing/reports/' + file.name + '.jslint.xml', generateLintErrorXML(file.name, JSLINT.errors), 'utf8');
				}
			}
			else {
				console.log(colours.bold.green + '[Ok]' + colours.reset + ' ' + file.name);
				if (params) {
					fs.writeFileSync(__dirname + '/testing/reports/' + file.name + '.jslint.xml', generateLintSuccessXML(file.name), 'utf8');
				}
			}
		})
		.end(complete);
}, true);


desc('Runs test specs.');
task('test', ['lint'], function(params) {
	console.log('Running test ...');
	var cmd = 'java -jar scripts/testing/JsTestDriver-1.3.2.jar --port 4224 --browser open --tests all --basePath . --config scripts/testing/jsTestDriver.conf';
	if (params) {
		cmd = 'java -jar scripts/testing/JsTestDriver-1.3.2.jar --port 4224 --browser open --tests all --basePath . --config scripts/testing/jsTestDriver.conf --testOutput scripts/testing/report';
	}
	exec(cmd, function (error, stdout, stderr) {
		console.log(stdout);
		complete();
	});
}, true);


desc('Runs tests for continuous integration.');
task('ci', function() {
	exec('mkdir -p scripts/testing/reports', function () {
		var lint = jake.Task['lint'];
		var test = jake.Task['test'];
		lint.execute.apply(lint, [true]);
		test.execute.apply(test, [true]);
		complete();
	});
}, true);


// helper functions
var showErrors = function(filename, errors) {
	var output = [];
	for (var i = 0; i < errors.length; i += 1) {
		var e = errors[i];
		if (!e) continue;
		output.push(' (' + e.line + ':' + e.character + ') ' + e.reason + '\n' + e.evidence);
	}
	return colours.bold.red + '[Error]' + colours.reset + ' in ' + filename + ':\n' + output.join('\n');
};


var generateLintSuccessXML = function(filename) {
	var output = [];
	output.push('<testsuite name="JSHint tests" tests="1" timestamp="' + new Date().toString() + '" errors="0" failures="0" skipped="0" time="0">');
	output.push('<testcase classname="' + filename + '" name="testJSHint"></testcase>');
	output.push('</testsuite>');
	return output.join('\n');
};


var generateLintErrorXML = function(filename, errors) {
	var output = [];
	output.push('<testsuite name="JSHint tests" tests="' + errors.length + '" timestamp="' + new Date().toString() + '" errors="0" failures="' + errors.length + '" skipped="0" time="0">');
	for (var i = 0; i < errors.length; i += 1) {
		var e = errors[i];
		if (!e) continue;
		output.push('<testcase classname="' + filename + '" name="testJSHint">');
		output.push('<failure message="' + filename + ' failed JSHint">');
		output.push('<![CDATA[');
		output.push(e.evidence);
    output.push(e.reason);
    output.push('//' + filename + ':' + e.line + ':' + e.character);
		output.push(']]>');
		output.push('</failure>');
		output.push('</testcase>');
	}
	output.push('</testsuite>');
	return output.join('\n');
};

