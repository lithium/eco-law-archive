
const Handlebars = require("handlebars");
const fs = require('fs-extra')
const path = require('path')


const Collections = require('./collections.js')
const TemplateEngine = require('./template-engine.js')


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
	const archive_path = "archive"
	const output_dir = "build"
	const template_dir = "templates"

	const site_title = "Eco Law Archive"

	const collections = await Collections.scan_directory(archive_path)

	console.log("collections",collections)

	const templates = new TemplateEngine({
		template_dir,
		output_dir,
	})

	templates.render('index.html', 'index.html', {
		page_title: `${site_title}`,
		collections: collections,
	})


/*
	templates.render('titles.html', 'titles.html', {
		page_title: `Titles | ${site_title}`,
		collections: collections,
	})
*/


	collections.forEach(async (collection) => {
		collection.sets.forEach(async (set) => {

	 		// /collections/{collection.name}/{set.name}.html
			templates.render(
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
				templates.render(
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


		})

	})
}

(async () => {
	const result = await main()
})();

