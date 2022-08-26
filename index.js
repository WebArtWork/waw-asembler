const path = require('path');
module.exports = async function(waw) {
	const template_router = waw.router('/api/assembler/template');
	const load_files = (req, res, next) => {
		if(waw.template_files) return next();
		waw.template_files = waw.getFilesRecursively(waw.project_root);
		for (let i = waw.template_files.length-1; i >= 0; i--) {
			if (path.basename(waw.template_files[i]) !== 'template.json'){
				waw.template_files.splice(i, 1);
			}
		}
		for (let i = 0; i < waw.template_files.length; i++) {
			let pages = waw.getDirectories(path.join(path.dirname(waw.template_files[i]), 'pages'));
			for (let j = 0; j < pages.length; j++) {
				pages[j] = {
					name: path.basename(pages[j]),
					path: path.dirname(path.normalize(pages[j]).replace(path.normalize(waw.project_root), '')),
					config: waw.readJson(path.join(pages[j], 'page.json'))
				}
			}
			waw.template_files[i] = {
				name: path.basename(path.dirname(waw.template_files[i])),
				path: path.dirname(path.normalize(waw.template_files[i]).replace(path.normalize(waw.project_root), '')),
				config: waw.readJson(waw.template_files[i]),
				pages
			};
			if (waw.template_files[i].config.name) {
				waw.template_files[i].name = waw.template_files[i].config.name;
			}
			if (!waw.template_files[i].config.pages) {
				waw.template_files[i].config.pages = [];
			}
		}
		next();
	};
	const select_template = (req, res, next) => {
		req.body.path = path.normalize(req.body.path);
		for (var i = 0; i < waw.template_files.length; i++) {
			if (waw.template_files[i].path === req.body.path) {
				res.locals.template = waw.template_files[i];
				return next();
			}
		}
		res.send(false);
	}
	template_router.get('/', load_files, (req, res) => {
		res.json(waw.template_files);
	});
	template_router.post('/create', load_files, select_template, (req, res) => {
		res.locals.template.pages.push(req.body.name);
		const root = 'cd '+waw.project_root + res.locals.template.path;
		waw.exe(root + path.sep + ' && waw page ' + req.body.name, ()=>{
			console.log(waw.readJson(path.join(waw.project_root, res.locals.template.path, 'pages', req.body.name, 'page.json')));
		});
		res.send(true);
	});
};
