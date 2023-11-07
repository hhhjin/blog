---
title: NPM 패키지 배포해 보기[0]
slug: NPM-패키지-배포해-보기-0
date: 2023-11-07
---

현재 개발 중인 프로젝트에서는 특정 jsx파일이 있고 이 파일을 기준으로 다른 jsx파일의 상대주소를 알아내서 `import`문을 기준이 되는 파일에 삽입해야 하는 작업을 하고 있다. 예를 들어 `pages/index.tsx`와 `components/Button.tsx`파일이 있다면 `pages/index.tsx`에 `import { Button } from "../components/Button.tsx"`과 같은 코드를 삽입해 줘야 한다.

```typescript
// pages/index.tsx
import { Button } from "../components/Button";
```

우선 상대주소를 알기 위해서는 두 파일의 절대주소를 알고 있는 상태여야 한다. 그다음 상대주소를 계산하면 되지만 라이브러리가 있을 수도 있으니 관련된 npm 패키지를 찾아봤다. `get-relative-path`라는 패키지를 찾았지만 (폴더와 파일 간 구분을 `/`로 구분해서 헷갈리고 같은 deps에 있는 파일은 `./`를 붙여주지 않는다는) 아주 조금 불편한 점에 그냥 공부할 겸 진행하는 프로젝트에 필요한 기능만 담아서 하나 만들기로 마음먹었다.

패키지 이름은 `relative-file-path`로 하고 빌드 툴로는 `tsup`을, 테스팅 툴로는 `vitest`를 이용해서 프로젝트를 구성했다.

### 인터페이스

```typescript
const path = relativeFilePath("/pages/index.tsx", "/components/Button.tsx");
console.log(path); // "../components/Button.tsx"
```

보기에는 아주 간단해 보이고 먼가 알고리즘 문제로 나올 것 같은 생김새를 지녔다. 그러나 여러 엣지 케이스가 머릿속에서 정리가 되지 않아 뚝딱 코드가 써지지는 않았다. 그래서 일단 테스트 코드를 작성하고 보자는 생각을 했다.

### 테스팅

상대경로로 나올 수 있는 케이스는 다음과 같다.

```typescript
describe("./", () => {}); // "././"는 X
describe("../", () => {});
describe("../../", () => {});
describe("../../../", () => {});
// 계속 ...
```

테스팅에 대해 잘 알지 못하지만 내 상식선에서 말해보자면,

`relativeFilePath`의 결과로 `../../../...` 무한의 경우의 수가 나올 수 있다. 그래서 실제 환경에서 발생할 수 있는 거의 모든 경우를 테스트해서 안정성을 보장할 수도 있지만 양날의 검이라고 생각하고 또 현실적으로 불가능하다고 생각한다. 이런 경우를 위해 테스트 코드를 자동화해 주는 방법도 쓸 수 있을 거라고 생각하는데 결국 테스트 코드를 위한 테스팅 툴을 위한 테스트 코드가 또 필요하고 끝이 없을 것이다. 그래서 적절한 선을 정했다.

`relativeFilePath` 함수에 대해서는 `../../../` 3번의 깊이까지 나올 수 있는 경우를 테스트 하려고 한다. 물론 `../../../../`까지 갔을 때 예상치 못한 결과가 나올 수 있지만 안일한 생각으로 내부 동작이 간단할거라 생각해서 `../../`까지만 성공해도 그 이후의 것도 일반화돼서 성공할 거라 생각했다. (복잡한 코드일 경우에는 어떻게 해야 할까)

테스트 케이스를 작성한 결과:

```typescript
import { relativeFilePath as rfp } from "./index";

describe("./", () => {
	test("./*.js", () => {
		expect(rfp("/a.js", "/b.js")).toBe("./b.js");
		expect(rfp("/a/b.js", "/a/c.js")).toBe("./c.js");
		expect(rfp("/a/b/c.js", "/a/b/d.js")).toBe("./d.js");
	});

	test("./dir1/*.js", () => {
		expect(rfp("/a.js", "/b/c.js")).toBe("./b/c.js");
		expect(rfp("/a/b.js", "/a/c/d.js")).toBe("./c/d.js");
		expect(rfp("/a/b/c.js", "/a/b/d/e.js")).toBe("./d/e.js");
	});

	test("./dir1/dir2/*.js", () => {
		expect(rfp("/a.js", "/b/c/d.js")).toBe("./b/c/d.js");
		expect(rfp("/a/b.js", "/a/c/d/e.js")).toBe("./c/d/e.js");
		expect(rfp("/a/b/c.js", "/a/b/d/e/f.js")).toBe("./d/e/f.js");
	});
});

// 이런 방식으로 ...
```

이렇게 하는 게 맞는지는 모르겠지만 그냥 무식하게 손으로 다 입력했고 마찬가지로 하위 테스트들도 일반화를 해서 다 3개씩 작성했다. 여기에 처음에 `/`를 뺀 상태로 `rfp("a.js", "b.js")`를 해도 똑같이 동작할 수 있게 추가로 작성했다.

이렇게 테스트 코드를 작성하고 보니 코드를 어떻게 구현해야 할지 슬슬 감이 왔다. 먼저 제일 간단하게 할 수 있는 `./` 케이스를 통과하기 위한 코드를 작성했다.

```typescript
function relativeFilePath(from: string, to: string) {
	// 편하게 사용하기 위해 '/' 기준으로 쪼개기
	const fromPath = from.split("/");
	const toPath = to.split("/");

	let i = 0;

	// fromPath 기준으로 toPath와 깊이별로 값을 비교하면서
	// 어디까지 값이 같은지 i에 저장
	// "a/b/c.js": ["", "a", "b", "c.js"]
	// "a/b/d.js": ["", "a", "b", "d.js"]
	// 그럼 i는 3
	while (i < fromPath.length - 1) {
		if (toPath[i] === undefined || fromPath[i] !== toPath[i]) {
			break;
		}
		++i;
	}

	if (i === fromPath.length - 1) {
		return "./" + toPath.slice(i).join("/");
	}

	return;
}
```

테스트를 실행하면 `./`는 통과를 한다! 여기까지 하고 보니 `../`의 경우도 같다고 느껴졌다. 결국 `./`와 `../`는 `fromPath`와 `toPath`간 깊이를 나타내는 i 값에 따라 정해지고 단지 뒤에 `toPath.slice(i)`같이 i 값을 이용해서 적절하게 `toPath`를 잘라내서 붙이면 된다.

```typescript
function relativeFilePath(from: string, to: string) {
	// ...

	return "../".repeat(fromPath.length - 1 - i) + toPath.slice(i).join("/");
}
```

이제 모든 테스트 케이스가 통과한다. 다음 글에서는 패키지를 빌드하고 Github Actions를 이용해 npm에 배포하는 과정을 진행해 보겠다.

### 이 외

- 그나저나 테스트 케이스를 다 작성해 놓고 코드를 짜니까 머릿속으로 코드를 돌려보는 일이 적어진다. 그냥 숫자를 계속 바꿔보면서 테스트가 통과하는지만 보게 되는데 이게 좋은 습관이라고는 생각하지 않아서 고쳐야겠다는 마음을 먹었다.
- 그 이유 중 하나로 위에서 실행 도중 특정 테스트만 실패했었는데 테스트 코드를 잘 못 짰던 거였다. 테스팅을 너무 믿으면 안 될 것 같다.
- 사소한 실수

```typescript
while (i < fromPath.length - 1) {
	// 이 부분에서 toPath[i] === undefined가 아닌 !toPath[i]를
	// 사용하면 toPath[0]이 ""일 수 있어서 !toPath[i]가 true가 된다.
	if (toPath[i] === undefined || fromPath[i] !== toPath[i]) {
		break;
	}
	++i;
}
```
