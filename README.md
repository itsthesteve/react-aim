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

<div style="padding: .6rem 1rem; margin: 1rem 0; color: brick; border: 1px solid red">
I'm using an import map to change the destination to the remote fork. Not sure if this will work
forever or for everyone, so once I test the forked code I'll need to publish to denoland for a
proper import.
</div>

As mentioned before, you'll need to have
[Deno](https://docs.deno.com/runtime/manual/getting_started/installation/) installed. This is using
v1.45.5.

I'm also using the [denokv](https://github.com/denoland/denokv) library as the local KV server. This
uses Docker so that needs to be running.

Once all that's installed, open 3 terminals windows. In two, `cd` into `./server` and run the
following:

Starts the `denokv` server on `4512`. This is needed for Deno's key/value store. Kinda like a redis
server:

- `docker run -it --init -p 4512:4512 -v ./data:/data ghcr.io/denoland/denokv --sqlite-path /data/react-chat.sqlite serve --access-token qwepoi9832745` -

Starts the API server on port 9000

- `deno task start`

Finally, `cd ./client` and run the dev server:

- `npm run dev`

> I haven't tested a fresh install as of yet, so more steps might be needed
