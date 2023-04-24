const Handlebars = require("handlebars");
const fs = require('fs-extra')
const path = require('path')


class TemplateEngine {
	constructor(options) {
		this.template_dir = options.template_dir;
		this.output_dir = options.output_dir;
	}

	async render(template_name, context) {
		const template_path = path.join(this.template_dir, template_name)
		const template_txt = (await fs.promises.readFile(template_path)).toString()

		const template = await Handlebars.compile(template_txt)
		const rendered = template(context)
		return rendered
	}	
	async render_to(template_name, output_name, context) {
		const rendered = await this.render(template_name, context)

		const output_path = path.join(this.output_dir, output_name)
		console.log("Writing output", output_path)
		await fs.ensureDir(path.dirname(output_path))
		await fs.promises.writeFile(output_path, rendered.toString())
	}

}

module.exports = TemplateEngine