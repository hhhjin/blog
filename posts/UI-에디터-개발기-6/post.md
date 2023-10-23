---
title: UI 에디터 개발기[6]
slug: UI-에디터-개발기-6
date: 2023-10-23
---

오늘은 쓸데없는 삽질을 좀 했다. 그리고 알게 된 것도 있다.

오늘 계획은 워크스페이스 목록과 생성 기능 구현이었다. 그러기 위해서는 다음 작업을 해야 했다.

- Trpc 세팅
- cors 설정
- 클라이언트에서 api 요청

### Trpc 세팅

어제 진행한 인증 코드는 Hono라는 라이브러리를 이용해서 `/auth`경로에 대한 라우팅을 했다. 근데 이외에 데이터를 주고 받을때는 hono가 아닌 trpc를 사용하려 한다. 사실 애초에 프로젝트를 진행할 때 선택할 기술 1순위는 trpc였다. 지금까지 경험해 본 기술 중 가장 생산성 측면에서 좋다. 근데 trpc는 데이터를 주고받는 용이기 때문에 OAuth에 필요한 redirect(302 status) 기능이 없어서 Hono를 대안으로 선택했었다.

trpc 관련 코드를 세팅하고 단순한 workspace api 코드를 작성했다.

```typescript
const workspaceRouter = router({
	list: userProcedure.query(async ({ ctx }) => {
		return ctx.db.select()
			.from(Workspace)
			.where(eq(Workspace.userId, ctx.user.user_id));
	}),

	get: userProcedure.input(workspaceFormSchema).query(
		async ({ ctx, input }) => {
			const id = nanoid();
			await ctx.db.insert(Workspace).values({ id, ...input });

			return id;
		},
	),
});
```

클라이언트 코드는 아직 trpc가 next.js app router를 공식 지원하지 않아 pages router로 변경 후 적용했다.

### cors 설정

여기서 오늘 시간을 거의 다 썼다. 두 가지 이슈가 있었는데 하나는 Set-Cookie로 설정한 쿠키가 브라우저에 저장이 안 돼서 session 값을 계속 받아오지 못하는 상황, 다른 하나는 redirect 후 next.js에서 cors 오류를 내서 메인페이지로 이동하지 못하는 상황이었다.

첫 번째 상황은 알고 보니 signup api를 실행할 때 fetch 설정값에 `credentials: "include"`를 빼먹어서 발생했었다. 계속 세션 검증하는 쪽이랑 서버 cors 설정만 계속 바꾸면서 바보짓을 좀 했다. 두번째는 `fetch()`로 서버에 요청을 하고 메인페이지로 이동하는 redirect를 받으면 cors 오류가 나는 경우였다. `<a>`태그로 서버에 갔다가 redirect 하면 정상 작동되는 것과 다르게 fetch 결과로 redirect가 발생하면 next 서버에 preflight 요청이 가서 cors 오류가 난다. 왜 그런지 알아볼 수도 있었지만, 그냥 클라이언트에서 결과를 받고 `router.replace("/")` 해주는 걸로 해결했다.

### 클라이언트에서 api 요청

이 부분은 trpc를 사용하면 react-query와 결합해서 쓸 수 있기 때문에 정말 편하다.

```tsx
export function WorkspaceList() {
	const { data: workspaces } = trpc.workspace.list.useQuery();
	const { mutate: createWorkspace } = trpc.workspace.create.useMutation();

	// ...
}
```

### 이 외

사실 오늘 시간이 좀 남아서 어제 조금 만져봤던 서버 통합 테스팅 환경을 개선하려고 했지만 아쉽게 다른 할 일이 생겼다. 앞으로 정해진 계획을 다 완료하면 그동안 지나쳤던 작업을 조금씩 해보려고 한다.
