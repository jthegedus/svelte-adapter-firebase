const test = require("ava");
const rewire = require("rewire");
const path = require("path");

const myModule = rewire("../src/index.js");

const getFile = myModule.__get__("getFile");
const validateFirebaseConfig = myModule.__get__("validateFirebaseConfig");

// getFile
test.serial(
	"getFile which exists and is valid",
	(t) => {
		const fileContents = getFile(path.join(__dirname, "../package.json"));
		t.true(fileContents.includes("@jthegedus/svelte-adapter-firebase"));
	},
);

test.serial(
	"getFile failure on file that does not exist",
	(t) => {
		const filename = path.join(__dirname, "../some_nonexistent_file.json");
		const error = t.throws(() => getFile(filename));
		t.is(error.message, `File ${filename} does not exist.`);
	},
);

// validateFirebaseConfig: test joi schema of Firebase Configs
// valid configs
test.serial(
	"firebase config w Cloud Functions & single site",
	(t) => {
		const res = validateFirebaseConfig(
			"./tests/fixtures/successes/cf_site.json",
			undefined,
			"**",
		);
		// in validateFirebaseConfig Joi converts single items in Hosting to arrays
		t.deepEqual(
			res,
			{
				hosting: [
					{
						public: "app",
						rewrites: [
							{
								source: "**",
								function: "some_func",
							},
						],
					},
				],
				functions: {source: "functions"},
			},
		);
	},
);

test.serial(
	"firebase config w Cloud Functions & multiple sites",
	(t) => {
		const res = validateFirebaseConfig(
			"./tests/fixtures/successes/cf_sites.json",
			"app",
			"**",
		);
		t.deepEqual(
			res,
			{
				hosting: [
					{
						site: "app",
						public: "app",
						rewrites: [
							{
								source: "**",
								function: "some_func",
							},
						],
					},
					{site: "blog", public: "blog"},
				],
				functions: {source: "functions"},
			},
		);
	},
);

test.serial(
	"firebase config w Cloud Run & single site",
	(t) => {
		const res = validateFirebaseConfig(
			"./tests/fixtures/successes/cr_site.json",
			undefined,
			"**",
		);
		// in validateFirebaseConfig Joi converts single items in Hosting to arrays
		t.deepEqual(
			res,
			{
				hosting: [
					{
						public: "app",
						rewrites: [
							{
								source: "**",
								run: {serviceId: "some_service"},
							},
						],
					},
				],
			},
		);
	},
);

test.serial(
	"firebase config w Cloud Run & multiple sites",
	(t) => {
		const res = validateFirebaseConfig(
			"./tests/fixtures/successes/cr_sites.json",
			"app",
			"**",
		);
		t.deepEqual(
			res,
			{
				hosting: [
					{
						site: "app",
						public: "app",
						rewrites: [
							{
								source: "**",
								run: {serviceId: "some_service"},
							},
						],
					},
					{site: "blog", public: "blog"},
				],
			},
		);
	},
);

// invalid configs
test.serial(
	"firebase config does not exist",
	(t) => {
		const error = t.throws(() =>
			validateFirebaseConfig("./does_not_exist.json", undefined, "**")
		);
		t.is(error.message, "File ./does_not_exist.json does not exist.");
	},
);

test.serial(
	"firebase config is invalid json",
	(t) => {
		const error = t.throws(() =>
			validateFirebaseConfig(
				"./tests/fixtures/failures/invalid.json",
				undefined,
				"**",
			)
		);
		t.is(error.message, "Unexpected token } in JSON at position 28");
	},
);

test.serial(
	"firebase config w Cloud Functions & single site missing top-level functions",
	(t) => {
		const error = t.throws(() =>
			validateFirebaseConfig(
				"./tests/fixtures/failures/cf_site_missing_functions.json",
				undefined,
				"**",
			)
		);
		t.is(
			error.message,
			`"functions" is required

Error with "./tests/fixtures/failures/cf_site_missing_functions.json" config.
Expected Hosting config for site:
	"default" - did you mean to specify a specific site?
with config:
	"rewrites.*.source": "**"
for either a Function or Cloud Run service.
`,
		);
	},
);

test.serial(
	"firebase config missing rewrite",
	(t) => {
		const error = t.throws(() =>
			validateFirebaseConfig(
				"./tests/fixtures/failures/site_missing_rewrite.json",
				undefined,
				"**",
			)
		);
		t.is(
			error.message,
			`"hosting" does not contain at least one required match

Error with "./tests/fixtures/failures/site_missing_rewrite.json" config.
Expected Hosting config for site:
	"default" - did you mean to specify a specific site?
with config:
	"rewrites.*.source": "**"
for either a Function or Cloud Run service.
`,
		);
	},
);

test.serial(
	"firebase config rewrite mismatch",
	(t) => {
		const error = t.throws(() =>
			validateFirebaseConfig(
				"./tests/fixtures/failures/cf_site_rewrite_mismatch.json",
				undefined,
				"no_match",
			)
		);
		t.is(
			error.message,
			`"hosting" does not contain at least one required match

Error with "./tests/fixtures/failures/cf_site_rewrite_mismatch.json" config.
Expected Hosting config for site:
	"default" - did you mean to specify a specific site?
with config:
	"rewrites.*.source": "no_match"
for either a Function or Cloud Run service.
`,
		);
	},
);

test.serial(
	"firebase config multiple sites require a hostingSite to be specified",
	(t) => {
		const error = t.throws(() =>
			validateFirebaseConfig(
				"./tests/fixtures/failures/cf_multi_site_requires_hostingSite.json",
				undefined,
				"**",
			)
		);
		t.is(
			error.message,
			`"hosting" does not contain at least one required match

Error with "./tests/fixtures/failures/cf_multi_site_requires_hostingSite.json" config.
Expected Hosting config for site:
	"default" - did you mean to specify a specific site?
with config:
	"rewrites.*.source": "**"
for either a Function or Cloud Run service.
`,
		);
	},
);
