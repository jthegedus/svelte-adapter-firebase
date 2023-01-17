#!/usr/bin/env bash

# undefined vars are errors
set -u
IFS=$'\n\t'

# Execute end-to-end tests of the SvelteKit Todo template app built with
# the svelte-adapter-firebase adapter hosted on the Cloud Function using
# the Firebase Emulator in CI
#
# Curl API and assert response payload
#
# Usage:
#
# tests/end-to-end/test.bash

SCRIPT_PATH=$(dirname "$(realpath -s "$0")")
TEST_DIR="$(mktemp -dt svelte-adapter-firebase-XXXX)"
PORT="8685" # from test-firebase.json
INDICATOR="====> "

# Cleanup files on exit
trap 'echo "${INDICATOR}Exiting, removing ${TEST_DIR} & killing all processes matching _firebase_" && rm -rf -- "$TEST_DIR" && pkill -f firebase' EXIT

echo "TEST_DIR: ${TEST_DIR}"
echo "PWD: ${PWD}"

echo "${INDICATOR}Install svelte-adapter-firebase ${SCRIPT_PATH}/../../ deps"
npm install

echo "${INDICATOR}init SvelteKit Sverdle app"
yes "" | "$(npm create svelte@latest "${TEST_DIR}")"
echo "${INDICATOR}Complete SvelteKit create"

cp -R "${SCRIPT_PATH}"/scaffold/. "${TEST_DIR}"
cp ".tool-versions" "${TEST_DIR}/.tool-versions"

cd "${TEST_DIR}" || exit 1
echo "${INDICATOR}PWD after cd to TEST_DIR: ${PWD}"

echo "${INDICATOR}Install kit template deps"
npm install

echo "${INDICATOR}Install svelte-adapter-firebase from ${SCRIPT_PATH}/../"
npm install "${SCRIPT_PATH}/../../"

echo "${INDICATOR}Install functions/ deps"
npm --prefix functions install

echo "${INDICATOR}Build Kit todos site"
npm run build

echo "${INDICATOR}Install firebase-tools"
npm install firebase-tools

echo "${INDICATOR}Starting emulator"
npx firebase emulators:start --only functions,hosting &

sleep 8

echo "${INDICATOR}Test GET static page '/about'"
EXPECTED_SUBSTRING="The page you&#39;re looking at is purely static HTML"
RESULT="$(curl -sL localhost:${PORT}/about)"

if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "Failed testing localhost:${PORT}/about"
	echo -e "Expect --> ${EXPECTED_SUBSTRING}\nGot -->\n${RESULT}"
	exit 1
fi

echo "${INDICATOR}Test GET SSR route '/'"
EXPECTED_SUBSTRING="<h2>try editing <strong"
RESULT="$(curl -sL localhost:${PORT}/)"

if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "${INDICATOR}Failed testing localhost:${PORT}/"
	echo -e "Expect --> ${EXPECTED_SUBSTRING}\nGot -->\n${RESULT}"
	exit 1
fi

echo "${INDICATOR}Test GET SSR route '/sverdle'"
EXPECTED_SUBSTRING='>Sverdle</h1>'
RESULT="$(curl -sL localhost:${PORT}/sverdle)"

if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "${INDICATOR}Failed testing localhost:${PORT}/sverdle/"
	echo -e "Expect --> ${EXPECTED_SUBSTRING}\nGot -->\n${RESULT}"
	exit 1
fi

echo "${INDICATOR}Test POST to '/sverdle' API"
EXPECTED_SUBSTRING='{"type":"success","status":204,"data":"-1"}'
# expected result = {"uid":"","created_at":01234,"text":"asdf","done":false}
# generated from the browser & copied with 'copy for cURL' browser context menu
RESULT="$(curl -sL -X POST "http://localhost:${PORT}/sverdle?/enter" \
	-H 'Accept-Language: en-US,en;q=0.9,vi;q=0.8' \
	-H 'Content-Type: multipart/form-data; boundary=----wwkFyd1Rd5w6wAB4' \
	-H "Origin: http://localhost:${PORT}" \
	-H "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0" \
	-H 'accept: application/json' \
	-H 'x-sveltekit-action: true' \
	--data-raw $'------wwkFyd1Rd5w6wAB4\r\nContent-Disposition: form-data; name="guess"\r\n\r\np\r\n------wwkFyd1Rd5w6wAB4\r\nContent-Disposition: form-data; name="guess"\r\n\r\na\r\n------wwkFyd1Rd5w6wAB4\r\nContent-Disposition: form-data; name="guess"\r\n\r\nr\r\n------wwkFyd1Rd5w6wAB4\r\nContent-Disposition: form-data; name="guess"\r\n\r\nt\r\n------wwkFyd1Rd5w6wAB4\r\nContent-Disposition: form-data; name="guess"\r\n\r\ny\r\n------wwkFyd1Rd5w6wAB4--\r\n')"
if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "${INDICATOR}Failed POSTing to localhost:${PORT}/todos"
	echo -e "Expect --> ${EXPECTED_SUBSTRING}\nGot -->\n${RESULT}"
	exit 1
fi
echo "${INDICATOR}Success"
