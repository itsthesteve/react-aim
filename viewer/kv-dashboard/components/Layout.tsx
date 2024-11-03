import { Fragment, PropsWithChildren } from "hono/jsx";
import { Style } from "jsr:@hono/hono@^4.6.8/css";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Fragment>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <Style />
        </head>
        <body>
          <main>{children}</main>
        </body>
      </html>
    </Fragment>
  );
}
