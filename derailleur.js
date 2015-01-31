var glob = require('glob-all');
var fs = require('fs-extra');
var handlebars = require('handlebars');
var grayMatter = require('gray-matter');
var bling = require('./bling');
require('string.prototype.repeat');

module.exports = function() {

  'use strict';

  var args = require('minimist')(process.argv.slice(2));

  var src = args.src;
  var dest = args.dest;

  var htmlPath = src + '/html/';
  var destPath = dest + '/html/';

  var helpersGlob = src + '/html/_helpers/**/*.js';
  var templatesGlob = src + '/html/_templates/**/*.js';
  var htmlGlob = src + '/html/**/*.html';
  var ignoreTemplatesGlob = '!'+ src + '/html/_templates/**';

  process.env.BLING_TEMPLATES_PATH = '/' + src + '/html/_templates/';
  process.env.BLING_JSON_PATH = '/' + src + '/json/';
  handlebars.registerHelper('$', bling);

  glob.sync(helpersGlob).forEach(function(path){
    var name = path.split('/').pop().replace('.js', '');
    handlebars.registerHelper(name, require(process.cwd() + '/' + path));
  });

  glob.sync([htmlGlob, ignoreTemplatesGlob]).forEach(function(page){

    page = grayMatter.read(page);

    var dest = page.path.replace(htmlPath, destPath);

    page.data.$root = '../'.repeat(dest.split('/').length -2);
    page.data.$id = page.path.
      replace(htmlPath, '').
      replace('.html', '').
      replace(/\//g, '_').replace(/-/g, '_');

    var template = handlebars.compile(page.content);
    var html = template(page.data);
    fs.outputFileSync(dest, html);

  });

};