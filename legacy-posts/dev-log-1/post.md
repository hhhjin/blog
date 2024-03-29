---
title: dev.log[1]
slug: dev-log-1
date: 2023-07-17
---

글을 한 번 안쓰기 시작하니 방치해둔 상태가 된 것처럼 보여서 머라도 써보려고 다시 왔다. 그동안은 사실 논 건 아니고 몇 가지 자질구레 한 것들을 해왔다.

## 라우터 라이브러리

```typescript
const forward = router({
	"/": {
		GET: () => () => "GET /",
		POST: () => () => "POST /",
	},
	"/posts": {
		GET: () => () => "GET /posts",
		POST: () => () => "POST /posts",
	},
	"/post/:slug": {
		GET: ({ params }) => () => `GET /post/${params.slug}`,
	},
});

// "GET /"
console.log(forward("/", "GET")());

// "GET /posts/dev-log-1"
console.log(forward("/posts/dev-log-1", "GET")());
```

블로그에 쓸 라이브러인데 기본적인 인터페이스는 이렇다. 타입스크립트를 제대로 활용하려다 보니까 배우고 적용하는 시간때문에 시간이 배로 걸린다. 알고리즘은 트리를 이용했고 기능은 블로그에 필요한 ‘*’, ‘:param’ 까지 추가해 보려고 한다. 이후에는 의존성 주입과 라우터 병합이 가능하도록 만들어야 하는 데 이건 생각보다 쉽게 할 수 있을 듯?

그나저나 이번 주 안으로 마무리를 지었으면 좋겠다.!

## 롤 내기 판정 시스템

방학이 될 때면 일주일에 한 번꼴로 친구들이랑 피시방에서 롤 딜량 내기를 하는데 매 판이 끝나면 메모장을 켜서 수기로 점수를 추가한다. 이런 반복적인 작업을 자동화해보면 어떨까 하는 생각으로 Riot API를 이용해서 매 판 딜량 등수를 조합해 꼴찌를 골라주는 웹앱을 만들고 있다.

이번 주 금요일까지 프로토타입을 만들고 주말에 친구들하고 테스트해 보려면 열심히 달려야겠다!
