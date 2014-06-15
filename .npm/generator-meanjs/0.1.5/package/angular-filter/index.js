'use strict';

var util = require('util'),
	fs = require('fs'),
	yeoman = require('yeoman-generator');


var FilterGenerator = yeoman.generators.NamedBase.extend({
	askForModuleName: function() {
		var modulesFolder = process.cwd() + '/public/modules/';
		var done = this.async();

		var prompts = [{
			type: 'list',
			name: 'moduleName',
			default: 'core',
			message: 'Which module does this filter belongs to?',
			choices: []
		}];

		// Add module choices
		fs.readdirSync(modulesFolder).forEach(function(folder) {
			var stat = fs.statSync(modulesFolder + '/' + folder);

			if (stat.isDirectory()) {
				prompts[0].choices.push({
					value: folder,
					name: folder
				});
			}
		});

		this.prompt(prompts, function(props) {
			this.moduleName = props.moduleName;
			this.slugifiedModuleName = this._.slugify(this.moduleName);

			this.slugifiedName = this._.slugify(this._.humanize(this.name));
			this.camelizedName = this._.camelize(this.slugifiedName);
			this.humanizedName = this._.humanize(this.slugifiedName);

			done();
		}.bind(this));
	},

	renderFilterFile: function() {
		this.template('_.client.filter.js', 'public/modules/' + this.slugifiedModuleName + '/filters/' + this.slugifiedName + '.client.filter.js')
	}
});

module.exports = FilterGenerator;