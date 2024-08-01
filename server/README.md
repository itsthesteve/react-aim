# server

To install dependencies:

```bash
bun install
```

Run with deno

```
deno run --watch --allow-net --unstable index.ts
```

Run the Deno KV store locally:

```
docker run -it --init -p 4512:4512 -v ./data:/data ghcr.io/denoland/denokv --sqlite-path /data/react-chat.sqlite serve --access-token qwepoi9832745
```

The access token is the same as the one in .env
