const Handlebars = require("handlebars");
const fs = require('fs-extra')
const path = require('path')

const all_species = require('./all_species.json')
const species_icons = require('./species_icons.json')
const TemplateEngine = require('../../template-engine.js')


function main() {

	const output_dir = "build"
	const template_dir = "templates"
	const templates = new TemplateEngine({
		template_dir,
		output_dir,
	})



	const sections = Object.keys(all_species).map((name) => {
		const data = all_species[name];
		const icon = species_icons[name];
		return templates.render('species_section.json.template', {
			name: data.name,
			species: data.species,
			min: data.min,
			icon: icon
		})
	})


	templates.render_to('law-protectspecies.json.template', 'law-protectspecies.json', {
		sections	
	})
}

(async () => {
	const result = await main()
})();

