
const Handlebars = require("handlebars");
const fs = require('fs-extra')
const path = require('path')


const Collections = require('./collections.js')


	/* Sitemap
		/index.html  
			"mockups/collections.html"
			list of all collections and their sets

 		/collections/{collection.name}/{set.name}.html
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
	const output_path = "build"
	const template_dir = "templates"

	const site_title = "Eco Law Archive"

	const collections = await Collections.scan_directory(archive_path)

	console.log("collections",collections)


	await render_template(
		path.join(template_dir, 'index.html'),
		path.join(output_path, 'index.html'), 
		{
			page_title: `Collections | ${site_title}`,
			collections: collections,
		}
	)

	await render_template(
		path.join(template_dir, 'electedtitle-list.html'),
		path.join(output_path, 'electedtitles.html'), 
		{
			page_title: `Elected Titles | ${site_title}`,
			collections: collections,
		}
	)

	collections.forEach(async (collection) => {
		collection.sets.forEach(async (set) => {


	 		// /collections/{collection.name}/{set.name}.html
			await render_template(
				path.join(template_dir, 'set-detail.html'),
				path.join(output_path, 'collections', collection.name, set.name+'.html'), 
				{
					page_title: `${set.name} - ${collection.name} | ${site_title}`,
					collection,
					set,
				}
			)

			set.ElectedTitle.forEach(async (title) => {
		 		// /collections/{collection.name}/{set.name}/electedtitle-16826530.json.html
				await render_template(
					path.join(template_dir, 'electedtitle-detail.html'),
					path.join(output_path, 
						'collections', collection.name, set.name, set.filename+'.html'), 
					{
						page_title: `${title.name} - ${set.name} | ${site_title}`,
						collection,
						set,
						title,
					}
				)
			})


		})

	})
}

async function render_template(template_path, output_path, context) {
	const template_txt = (await fs.promises.readFile(template_path)).toString()

	const template = await Handlebars.compile(template_txt)
	const rendered = template(context)

	console.log("Writing output", output_path)
	await fs.ensureDir(path.dirname(output_path))
	await fs.promises.writeFile(output_path, rendered.toString())
}

(async () => {
	const result = await main()
})();

