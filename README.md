# React AIM

This is a little AOL instant messenger inspired chat application to practice React and API design.

## The idea

It's nostalgic looking back on the days of coming home from high school and firing up AIM to see who
was on and what they were doing. Luckily, someone created
[xp.css](https://botoxparty.github.io/XP.css/) which does a mighty fine job emulating the look of a
Windows XP application.

This is an exercise in React (as I rarely use it) and Deno (as I've never used it).

This started with "will it work?" and I've been chiseling away at areas that need fixing.

## Development

One major caveat is this uses a fork of the `oak-rate-limit` package on github. I've merged a basic
update that adds the Deno KV store, which can be found
[here](https://github.com/itsthesteve/oak-rate-limit).

> Note: I'm using an import map to change the destination to the remote fork. Not sure if this will
> work forever or for everyone, so once I test the forked code I'll need to publish to denoland for
> a proper import.

As mentioned before, you'll need to have
[Deno](https://docs.deno.com/runtime/manual/getting_started/installation/) installed. This is using
`v1.45.5`.

I'm also using the [denokv](https://github.com/denoland/denokv) library as the local KV server. This
uses Docker so that needs to be running.

Once all that's installed, open 3 terminals windows. In two, `cd` into `./server` and run the
following:

Start the `denokv` server on `4512`. This is needed for Deno's key/value store. Kinda like a redis
server:

- `docker run -it --init -p 4512:4512 -v ./data:/data ghcr.io/denoland/denokv --sqlite-path /data/react-chat.sqlite serve --access-token qwepoi9832745` -

Start the API server on port 9000

- `deno task start`

Finally, `cd ./client`, run `npm install` and run the dev server:

- `npm run dev`

> Note: I haven't tested a fresh install as of yet, so more steps might be needed

## KV Viewer

A simple admin dashboard has been started in `viewer` to display info from the KV store in a more
readable manner than browsing SQLite.

Similar deal as before:

- `cd viewer/server; deno task start` starts the server on :8000
- `cd viewer/client; npm run dev` starts the viewer on :5173 (can't run at the same time as the app
  client )

### Misc

e2e testing has been set up but isn't fully fleshed out. I'm using playwright and it can be run via
`npm run test` in the client dir. Tests for the server, especially rate limiting and payload
validation is todo.
