# Chat websocket server

> Written in Deno

#### Run the Deno KV store locally:

```sh
docker run -it --init -p 4512:4512 -v ./data:/data ghcr.io/denoland/denokv --sqlite-path /data/react-chat.sqlite serve --access-token qwepoi9832745
```

Create a `.env` file as such:

```
DENO_KV_ACCESS_TOKEN=qwepoi9832745
```

The `DENO_KV_ACCESS_TOKEN` is the same as the `--access-token` in the docker command.

#### Start the proxy

```sh
deno run -A --unstable-kv --watch index.ts
```

Proxy server is now running on port 9000. The sqlite db for Deno's KV is in
`./server/data/react-chat.sqlite` and can be opened and viewed with TablePlus or whatever SQL viewer
you have. The data is stored as binary so it's not readable off the bat, but it does work as of this
writing.

TODO

- Basic auth
- ...more
