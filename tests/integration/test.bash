#!/usr/bin/env bash

# undefined vars are errors
set -u
# Check ${PUBLIC_FILENAME} exists
if [ ! -f "/var/folders/md/03z_d30d0fg22h2hjmyxkz3h0000gn/T/svelte-adapter-firebase-test-functions_single_site-XXXX.9K6uZgbe/public/_app/manifest.json" ]; then
	echo 'not found'
    exit 1
fi
