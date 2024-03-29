---
title: dev.log[2]
slug: dev-log-2
date: 2023-07-20
---

이전에 작업하던 라우터 라이브러리 개발은 블로그에 최소한으로 사용가능한 기능을 완성하는 데 초점을 맞췄다. 속도는 koa-trie-router보다 2.5배 느리다고 나온다.([참고한 벤치마크](https://github.com/delvedor/router-benchmark)) 테스트 코드는 거의 처음 짜본 거라 Hono의 테스트 코드를 참고했지만 사실 먼지도 모르고 대충 작성했다.

## 라우팅

```typescript
// src/routes.ts
import { router } from "@hyeongjin/router/mod.ts";

export const forward = router({
	"/": {
		GET: () => () => {},
	},
	"/robots.txt": {
		GET: () => () => {},
	},
	"/post/:slug": {
		GET: () => () => {},
	},
});
```

이런 식으로 라우팅 경로를 정의하고 app.ts에서 forward를 이용한다.

```typescript
// src/app.ts
import { serve } from "std/http/server.ts";
import { forward } from "./routes.ts";

await serve(
	(req) => {
		try {
			const res = forward(new URL(req.url).pathname, req.method);

			if (res.notFound || res.methodNotAllowed) {
				// 404 페이지 리턴
			}

			return res.handler();
		} catch (e) {
			// 에러 처리할 영역
			return new Response("Internal Server Error", { status: 500 });
		}
	},
	{ port: 8000 },
);
```

res.handler에 Context도 넣을 수 있다. 이거랑 에러 처리 부분을 밖에서 처리하는 거는 trpc에서 영감을 받았다. 이걸 래핑하는 라이브러리도 만들어 봐야겠다.

## 라우팅 라이브러리 개발 끝

이 아니고 아직 보완해야 할 게 많다. 테스팅 코드도 추가로 작성해야 하고 wildcard 기능, 성능 개선, 리팩토링 등등. 할 게 많아도 재밌어서 할 맛은 있다.
