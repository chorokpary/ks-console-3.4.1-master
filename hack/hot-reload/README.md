# Hot-Reload Dev Environment

Patch for running hot-reload dev server on Node.js 24 inside a k8s pod.

The production image uses Node.js 18 (`build/Dockerfile`), so this patch must not be committed — apply locally only.

## Why

- HappyPack crashes on Node.js 24 (`util.isRegExp` removed)
- K8s Service exposes only port 8000, but the original code redirects the browser to port 8001 (webpack-dev-server)

## Usage

Run the stop commands before re-running `yarn start` to avoid orphan processes holding the ports.

```sh
# Apply
git apply hack/hot-reload/hot-reload.patch

# Stop
fuser -k 8000/tcp 8001/tcp 2>/dev/null
pkill -f 'webpack-dev-server|nodemon.*server\.js' 2>/dev/null

# Run
yarn && yarn start

# Revert (before committing)
git apply -R hack/hot-reload/hot-reload.patch
```
