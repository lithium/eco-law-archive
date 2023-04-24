
const Handlebars = require("handlebars");
const fs = require('fs-extra')
const path = require('path')


const Collections = require('./collections.js')
const TemplateEngine = require('./template-engine.js')

const site_title = "Eco Law Archive"


const archive_path = "archive"
const output_dir = "build"
const template_dir = "templates"
const templates = new TemplateEngine({
	template_dir,
	output_dir,
})


Handlebars.registerHelper('json', x => JSON.stringify(x, undefined, 2));
Handlebars.registerHelper('index1', (idx) => idx+1 );

	/* Sitemap
		/index.html  
			"mockups/collections.html"
			list of all collections and their sets

 		/collections/{collection.name}/{set.name}/index.html
 			"mockups/set-detail.html"
 			list of all definitions in a set

 		/collections/{collection.name}/{set.name}/electedtitle-16826530.html
 			"mockups/title-detail.html"
 			human readable version of the specific .json

 		/titles.html
 			"mockups/titles.html"
 			index of all titles across all collections

 		/demographics.html "mockups/titles.html"
 		/electionprocess.html "mockups/titles.html"
 		/laws.html "mockups/titles.html"
	*/



async function main() {


	const collections = await Collections.scan_directory(archive_path)



	templates.render_to('index.html', 'index.html', {
		page_title: `${site_title}`,
		collections: collections,
	})


/*
	templates.render_to('titles.html', 'titles.html', {
		page_title: `Titles | ${site_title}`,
		collections: collections,
	})
*/


	collections.forEach(async (collection) => {
		collection.sets.forEach(async (set) => {

	 		// /collections/{collection.name}/{set.name}.html
			templates.render_to(
				'set-detail.html',
				path.join('collections', collection.name, set.name, 'index.html'), 
				{
					page_title: `${set.name} - ${collection.name} | ${site_title}`,
					collection,
					set,
				}
			)


			/*
			set.ElectedTitle.forEach(async (title) => {
		 		// /collections/{collection.name}/{set.name}/electedtitle-16826530.json.html
				templates.render_to(
					'electedtitle-detail.html',
					path.join('collections', collection.name, set.name, set.filename+'.html'),
					{
						page_title: `${title.name} - ${set.name} | ${site_title}`,
						collection,
						set,
						title,
					}
				)
			})
			*/

			set.ElectionProcess.forEach(async (electionprocess) => {
		 		// /collections/{collection.name}/{set.name}/electionprocess-16826530.json.html
				templates.render_to(
					'electionprocess-detail.html',
					path.join('collections', collection.name, set.name, electionprocess.filename+'.html'),
					{
						page_title: `${electionprocess.name} - ${set.name} | ${site_title}`,
						collection,
						set,
						electionprocess,
					}
				)
			})


			set.Law.forEach(async (law) => {
		 		// /collections/{collection.name}/{set.name}/law-16826530.json.html
				templates.render_to(
					'law-detail.html',
					path.join('collections', collection.name, set.name, law.filename+'.html'),
					{
						page_title: `${law.name} - ${set.name} | ${site_title}`,
						collection,
						set,
						law,
					}
				)
			})


		})

	})
}


const ecoref_icons = {
	'Eco.Gameplay.Civics.Titles.ElectedTitle': "fa-person-burst"
}
function helper_ecoref(context) {
	const icon = ecoref_icons[context.type];
	const val =  
	`<span class="icon-text">`+
  		`<span class="icon"><i class="fas ${icon}"></i></span>`+
        `<span class="reference">${context.name}</span>`+
    `</span>`
    return val
}
Handlebars.registerHelper('ecoref', helper_ecoref);


Handlebars.registerHelper('checkbox', (is_checked) => {
	const icon = is_checked ? 'fa-square-check' : 'fa-square-full'
	return `<span class="icon-text">`+
  		`<span class="icon"><i class="fa-regular ${icon}"></i></span>`+
    `</span>`

});

Handlebars.registerHelper('index1', (idx) => idx+1 );


Handlebars.registerHelper('ecotrigger', async (context) => {

	//context.properties.Trigger.value
	const template_name = path.join('triggers', `${context.properties.Trigger.value}.html`)
	try {

		const foo = await templates.render(template_name, {
			trigger: context
		})
		console.log("got foo", foo)

		return foo
	} catch (err) {
		console.log("wha?", err)
		return `<pre><code>${JSON.stringify(context,undefined,2)}}</code></pre>`
	}
});

(async () => {
	const result = await main()
})();

