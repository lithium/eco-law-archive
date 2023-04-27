
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


function active_set(collections, set) {
	collections.forEach(c => {
		c.sets.forEach(s => {
			if (s.name == set.name) {
				s.is_active = true;
			}
			else {
				s.is_active = false;
			}
		})
	})
	return collections;
}

function index_of_type(collections, key_name) {
	const ret = collections.map(c => c.sets.map(s => s[key_name])).flat(2).filter(x => x)
	ret.sort((a,b) => a.name.localeCompare(b.name))
	return ret
}

async function main() {


	const collections = await Collections.scan_directory(archive_path)

	templates.render_to('index.html', 'index.html', {
		page_title: `${site_title}`,
		collections: collections,
	})

/*
	templates.render_to('all-constitutions.html', 'constitutions.html', {
		page_title: `Constitutions | ${site_title}`,
		collections,
		constitutions: index_of_type(collections, 'Constitution')
		amendments: index_of_type(collections, 'ConstitutionalAmendment')
	})
	*/

	templates.render_to('all-electionprocesses.html', 'electionprocesses.html', {
		page_title: `Election Processes | ${site_title}`,
		collections,
		electionprocesses: index_of_type(collections, 'ElectionProcess')
	})

	templates.render_to('all-titles.html', 'titles.html', {
		page_title: `Titles | ${site_title}`,
		collections: collections,
		elected_titles: index_of_type(collections, 'ElectedTitle'),
		appointed_titles: index_of_type(collections, 'AppointedTitle')
	})

	templates.render_to('all-demographics.html', 'demographics.html', {
		page_title: `Demographics | ${site_title}`,
		collections,
		demographics: index_of_type(collections, 'Demographic')
	})

	templates.render_to('all-laws.html', 'laws.html', {
		page_title: `Laws | ${site_title}`,
		collections,
		laws: index_of_type(collections, 'Law')
	})


	collections.forEach(async (collection) => {
		collection.sets.forEach(async (set) => {

	 		// /collections/{collection.name}/{set.name}.html
			templates.render_to(
				'set-detail.html',
				path.join('collections', collection.name, set.name, 'index.html'), 
				{
					page_title: `${set.name} - ${collection.name} | ${site_title}`,
					collections: active_set(collections, set),
					collection,
					set,
				}
			)

			// /collections/{{collection.name}}/{set.name}/constitution.html
			if (set.Constitution) {
				templates.render_to(
					'constitution-detail.html',
					path.join('collections', collection.name, set.name, 'constitution.html'),
					{
						page_title: `${set.Constitution[0].name} - ${set.name} | ${site_title}`,
						collection,
						set,
						constitution: set.Constitution[0],
						constitutions: set.Constitution,
						amendments: set.ConstitutionalAmendment
					}
				)
			}

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

			if (set.ElectedTitle) {
				set.ElectedTitle.forEach(async (title) => {
			 		// /collections/{collection.name}/{set.name}/electedtitle-16826530.json.html
					templates.render_to(
						'electedtitle-detail.html',
						path.join('collections', collection.name, set.name, title.filename+'.html'),
						{
							page_title: `${title.name} - ${set.name} | ${site_title}`,
							collection,
							set,
							title,
						}
					)
				})
			}


			if (set.Demographic) {
				set.Demographic.forEach(async (demographic) => {
			 		// /collections/{collection.name}/{set.name}/demographic-16826530.json.html
					templates.render_to(
						'demographic-detail.html',
						path.join('collections', collection.name, set.name, demographic.filename+'.html'),
						{
							page_title: `${demographic.name} - ${set.name} | ${site_title}`,
							collection,
							set,
							demographic,
						}
					)
				})
			}


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
	'Eco.Gameplay.Civics.Titles.ElectedTitle': "fa-person-burst",
	'Eco.Gameplay.Civics.Demographics.Demographic': "fa-people-line",
	'Eco.Gameplay.Economy.Currency': "fa-coins",
}
function helper_ecoref(context) {
	if (!context) {
		return context
	}

	if (context.type === 'Type') {
		return lastdot(context.value);
	}

	const icon = ecoref_icons[context.type];
	const refname = context.type.split('.').pop()
	const val =  
	`<span>${refname}:</span> <span class="icon-text">`+
  		`<span class="icon"><i class="fas ${icon}"></i></span>`+
        `<span class="reference">${context.name}</span>`+
    `</span>`
    return new Handlebars.SafeString(val)
}
Handlebars.registerHelper('ecoref', helper_ecoref);


Handlebars.registerHelper('checkbox', (is_checked) => {
	const icon = is_checked ? 'fa-square-check' : 'fa-square-full'
	return `<span class="icon-text">`+
  		`<span class="icon"><i class="fa-regular ${icon}"></i></span>`+
    `</span>`

});

const lastdot = (s) => {
	if (!s) return s;

	const ret = s.split('.').pop();
	if (/\+.*Species$/.test(ret)) {
		return ret.replace(/\+.*/,'')
	}
	return ret
}
Handlebars.registerHelper('index1', (idx) => idx+1 );
Handlebars.registerHelper('lastdot',  lastdot);


Handlebars.registerHelper('include', (template_name, context) => {
	template_name = path.join('includes', `${template_name}.html`)

	try {
		const rendered = templates.render(template_name, context)
		return new Handlebars.SafeString(rendered)
	} catch (err) {
		console.log("Error processing include: ", template_name)
		console.log(err)
		process.exit(1);
	}
})

Handlebars.registerHelper('partial', (context, label) => {
	if (!context) {
		return ""
	}

	let template_name;
	let type;
	
	try {
		type = context.type;
		template_name = path.join('partials', `${type}.html`)
	} catch (err) {
		console.log("missing type!", context, label, err)
		process.exit(1);
	}

	try {
		const rendered = templates.render(template_name, context)
		return new Handlebars.SafeString(rendered)
	} catch (err) {
		if (err.code == 'ENOENT') {
			console.log("  partial template missing:", template_name)
			return new Handlebars.SafeString(`<pre class="json-preview">${JSON.stringify(context,undefined,2)}}</pre>`)
		} else {
			console.log("Error processing partial: ", template_name)
			console.log(err)
			process.exit(1);
		}
	}
});

Handlebars.registerHelper('json_toggle', (obj, obj_type, ident, idx) => {

	const scrubbed = (ident || "default").replace(/[^a-zA-Z0-9_]/g,'')
	const id = `${obj_type}-${scrubbed}-${idx}`
	return new Handlebars.SafeString(
		`<a class="button is-text is-small" data-targetId="${id}" onclick="return json_toggle(event)">JSON</a>`+
		`<pre class="json-preview" id="${id}" style="display: none"><code>${JSON.stringify(obj, undefined, 2)}</code></pre>`
	);

});



(async () => {
	const result = await main()
})();

