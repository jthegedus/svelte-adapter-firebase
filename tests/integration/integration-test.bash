#!/usr/bin/env bash

# undefined vars are errors
set -u
IFS=$'\n\t'

# Execute integration test for provided dir. Inits SvelteKit Todo app template
# and adds Firebase Adapter with configuration from provided dir.
# Assert build assets for static and compute are in expected locations
# Requires deps in .tool-versions at repo root
#
# Usage:
#
# tests/integration/integration-test.bash "functions_single_site" "public/about/index.html" "functions/sveltekit/index.js" "."
# tests/integration/integration-test.bash "nested_app_dirs" "public/about/index.html" "functions/sveltekit/index.js" "app"
# tests/integration/integration-test.bash "run_custom_build_dir" "public/about/index.html" "custom-cloud-run-build-dir/index.js" "."
# tests/integration/integration-test.bash "run_single_site" "public/about/index.html" ".cloudrun/index.js" "."

SOURCE_DIR="$1"
PUBLIC_FILENAME="$2"
KIT_FILENAME="$3"
NESTED_APP_DIR="${4}"

INDICATOR="====> "
SCRIPT_PATH=$(dirname "$(realpath -s "$0")")
TEST_DIR="$(mktemp -dt "svelte-adapter-firebase-test-${SOURCE_DIR}-XXXX")"

# Cleanup files on exit
trap 'echo "${INDICATOR}Exiting, removing ${TEST_DIR}" && rm -rf -- "$TEST_DIR"' EXIT

echo "${INDICATOR}TEST_DIR: ${TEST_DIR}"
echo "${INDICATOR}PWD: ${PWD}"

echo "${INDICATOR}Install svelte-adapter-firebase ${SCRIPT_PATH}/../../ deps"
npm install 

echo "${INDICATOR}init SvelteKit Todos app"
yes "" | "$(npm init svelte@next "${TEST_DIR}/${NESTED_APP_DIR}")"
echo "${INDICATOR}Complete SvelteKit init"

cp -R "${SCRIPT_PATH}"/"${SOURCE_DIR}"/* "${TEST_DIR}"
cp "${SCRIPT_PATH}/${SOURCE_DIR}/.firebaserc" "${TEST_DIR}/.firebaserc"
cp ".tool-versions" "${TEST_DIR}/.tool-versions"

cd "${TEST_DIR}/${NESTED_APP_DIR}" || exit 1
echo "${INDICATOR}PWD after cd to TEST_DIR: ${PWD}"

echo "${INDICATOR}Set package.json:scripts.build to verbose mode"
sed -i -e 's/svelte-kit build/svelte-kit build --verbose/g' "${TEST_DIR}/${NESTED_APP_DIR}/package.json"

echo "${INDICATOR}Install kit template deps"
npm install

echo "${INDICATOR}Install svelte-adapter-firebase from ${SCRIPT_PATH}/../../"
npm install "${SCRIPT_PATH}/../../"

echo "${INDICATOR}Build Kit todos site"
npm run build

# Check ${PUBLIC_FILENAME} exists
if [ ! -f "${TEST_DIR}/${NESTED_APP_DIR}/${PUBLIC_FILENAME}" ]; then
	echo "${INDICATOR}FAILED to find ${TEST_DIR}/${NESTED_APP_DIR}/${PUBLIC_FILENAME}"
	exit 1
fi

# Check ${KIT_FILENAME}
if [ ! -f "${TEST_DIR}/${KIT_FILENAME}" ]; then
	echo "${INDICATOR}FAILED to find ${TEST_DIR}/${KIT_FILENAME}"
	exit 1
fi

echo "${INDICATOR}Success"


