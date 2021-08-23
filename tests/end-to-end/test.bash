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
# tests/integration/test.bash

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

echo "${INDICATOR}init SvelteKit Todos app"
yes "" | "$(npm init svelte@next "${TEST_DIR}")"
echo "${INDICATOR}Complete SvelteKit init"

cp -R "${SCRIPT_PATH}"/scaffold/* "${TEST_DIR}"
cp "${SCRIPT_PATH}/scaffold/.firebaserc" "${TEST_DIR}/.firebaserc"
cp ".tool-versions" "${TEST_DIR}/.tool-versions"

cd "${TEST_DIR}" || exit 1
echo "${INDICATOR}PWD after cd to TEST_DIR: ${PWD}"

echo "${INDICATOR}Set package.json:scripts.build to verbose mode"
sed -i -e 's/svelte-kit build/svelte-kit build --verbose/g' "${TEST_DIR}/package.json"

echo "${INDICATOR}Install kit template deps"
npm install

echo "${INDICATOR}Install svelte-adapter-firebase from ${SCRIPT_PATH}/../"
npm install "${SCRIPT_PATH}/../../"

echo "${INDICATOR}Install functions/ deps"
npm --prefix functions install

echo "${INDICATOR}Build Kit todos site"
npm run build

echo "${INDICATOR}Starting emulator"
firebase emulators:start --only functions,hosting &

sleep 8

echo "${INDICATOR}Test GET static page '/about'"
EXPECTED_SUBSTRING="The page you&#39;re looking at is purely static HTML"
RESULT="$(curl -L localhost:${PORT}/about)"

if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "Failed testing localhost:${PORT}/about"
	exit 1
fi

echo "${INDICATOR}Test GET SSR route '/'"
EXPECTED_SUBSTRING="<h2>try editing <strong>src/routes/index.svelte</strong></h2>"
RESULT="$(curl -L localhost:${PORT}/)"

if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "${INDICATOR}Failed testing localhost:${PORT}/"
	exit 1
fi

echo "${INDICATOR}Test GET SSR route '/todos'"
EXPECTED_SUBSTRING="<h1>Todos</h1>"
RESULT="$(curl -L localhost:${PORT}/todos)"

if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "${INDICATOR}Failed testing localhost:${PORT}/todos/"
	exit 1
fi

echo "${INDICATOR}Test POST to '/todos' API"
EXPECTED_SUBSTRING='"text":"asdf"'
# expected result = {"uid":"","created_at":01234,"text":"asdf","done":false}
# generated from the browser & copied with 'copy for cURL' browser context menu
RESULT="$(curl "http://localhost:${PORT}/todos.json" \
	-H "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0" \
	-H "Accept: application/json" \
	-H "Accept-Language: en-GB,en;q=0.5" \
	--compressed \
	-H "Referer: http://localhost:${PORT}/todos" \
	-H "Content-Type: multipart/form-data; boundary=---------------------------349341627025106406523834848301" \
	-H "Origin: http://localhost:${PORT}" \
	-H "Connection: keep-alive" \
	-H "Cookie: userid=0a52e7d5-25d4-4b12-b307-38756d00bbcb" \
	-H "Sec-Fetch-Dest: empty" \
	-H "Sec-Fetch-Mode: cors" \
	-H "Sec-Fetch-Site: same-origin" \
	-H 'Sec-GPC: 1' --data-binary $'-----------------------------349341627025106406523834848301\r\nContent-Disposition: form-data; name="text"\r\n\r\nasdf\r\n-----------------------------349341627025106406523834848301--\r\n')"
echo "$RESULT"
if [[ "${RESULT}" != *"${EXPECTED_SUBSTRING}"* ]]; then
	echo "${INDICATOR}Failed POSTing to localhost:${PORT}/todos.json"
	exit 1
fi

echo "${INDICATOR}Success"
