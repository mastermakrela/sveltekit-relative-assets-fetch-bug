# sveltekit relative assets fetch bug

## Tests

### `dev` mode

run with: `pnpm dev`

```
fetch       url
----------+-----
global    + rel: error per definition
global    + abs: true
sveltekit + rel: true
sveltekit + abs: true
read      + rel: true
read      + abs: doesn't make sense
----------------
other     +server: true
```

### node adapter

first swich to adapter node
then run with: `pnpm build && pnpm preview`

```
fetch       url
----------+-----
global    + rel: error per definition
global    + abs: true
sveltekit + rel: false
sveltekit + abs: false
read      + rel: true
read      + abs: doesn't make sense
----------------
other     +server: true
```

- probably should use [`read`](https://kit.svelte.dev/docs/modules#$app-server-read) anyways

### cloudflare adapter

first swich to adapter cloudflare
then run with: `pnpm build && wrangler pages dev .svelte-kit/cloudflare`

```
fetch       url
----------+-----
global    + rel: error per definition
global    + abs: true
sveltekit + rel: false
sveltekit + abs: false
read      + rel: undefined
read      + abs: doesn't make sense
----------------
other     +server: true
```

## Fixes

### async `read`

- con: breaking change
- pro: can work with cloudflare

  - both `env.Assests.fetch` and `fetch` (might not work) provide response but asynchroniously
  - would be drop-in implementation

    ```js
    read: (filename) => {
    	// needed because cloudflare worker does not support relative paths
    	const abs_asset = new URL(req.url);
    	abs_asset.pathname = filename;
    	return env.ASSETS.fetch(abs_asset.pathname).then((res) => res.body);
    };
    ```

- vibe check: not passed
  - `read` (right now) feels like it should be synchronous

### add `server_assets` to `is_asset` check in server fetch

- pro: no breaking changes
- pro: works with cloudflare & node (probably more)
- pro: feature parity between dev and production

  - right now we end up in `kit/src/runtime/server/respond.js:119` and return 404

  - possibly a bug

    - docs say:

      > It also allows you to make relative requests, whereas server-side fetch normally requires a fully qualified URL.
      > https://kit.svelte.dev/docs/web-standards#fetch-apis

    - but it doesn't work

- AFICT `server_assets` is currently only used by `read`,
  so using it in server fetch is _kind of_ an `async read` implementation

- in this case if the static asset is requested "from outside" it is served by the platform (that's why global fetch works?),
  the problem is when we request from "inside" of sveltekit

---

might be connected:

- https://github.com/sveltejs/kit/issues/3850
- https://github.com/sveltejs/kit/issues/8167

tangentially related:

- https://github.com/sveltejs/kit/issues/11128
- https://github.com/sveltejs/kit/issues/11078
