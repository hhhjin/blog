---
title: NPM 패키지 배포해 보기[1]
slug: NPM-패키지-배포해-보기-1
date: 2023-11-10
---

이제 NPM에 배포할 코드를 작성했고 어떤 식으로 배포해야 할지 생각을 해봐야 한다.

NPM에 배포를 할 때는 `package.json`을 작성하고 `npm publish`를 실행하는 것이 가장 기본적인 방법이다.

```json
// package.json
{
	"name": "relative-file-path",
	"version": "1.0.0",
	"description": "Return a file path relative to a given file",
	"files": [
		"dist"
	],
	"exports": {
		".": {
			"require": {
				"types": "./dist/index.d.ts",
				"default": "./dist/index.js"
			},
			"import": {
				"types": "./dist/index.d.mts",
				"default": "./dist/index.mjs"
			}
		}
	},
	"scripts": {
		"build": "tsup",
		"test": "vitest --watch",
		"test:run": "vitest run"
	},
	"license": "MIT",
	"devDependencies": {
		"tsup": "^7.2.0",
		"typescript": "^5.2.2",
		"vitest": "^0.34.6"
	},
	"repository": {
		"type": "git",
		"url": "https://github.com/hhhjin/relative-file-path.git"
	}
}
```

기본적으로 `name`, `version`은 필수이고 그 밖에 패키지를 사용할 때 cjs, esm인지를 구분해서 import 할 수 있도록 `exports`를 선언해줬다.

commonjs, esmodule등 자바스크립트 모듈 생태계는 너무 복잡하고 트랜스파일러, 번들러까지 얽혀있어서 나는 이 부분을 잘 모른다. 차근차근 알아갈 필요가 있지만 지금 당장 일일이 다 알려고 하다가는 평생 공부만 하게 되는 상황이어서 일단 개념이 모호한 상태로 진행했다.

### 빌드

빌드 툴은 tsup을 사용했다. `pnpm build`를 실행하면 `dist`폴더에 파일이 생성된다.

```javascript
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["index.ts"],
	clean: true,
	format: ["cjs", "esm"],
	dts: true,
});
```

패키지를 빌드하기 전 제일 먼저 해야 하는 생각은 이 패키지를 사용할 대상을 정해야 한다는 것이다. 나는 NPM을 대상으로 했으니 아무래도 Node.js를 타겟으로 했고 cjs, esm 모듈을 생성하도록 설정했다. 그리고 dts 파일도 생성되게.

그 이외에 고민했던 부분은 minify를 해야 할지에 대한 결정이었다. 인터넷에 minify를 해야 하네 말아야 하네 이런 의견이 많아서 헷갈리는 부분이었다. 사실 이런 조그마한 라이브러리는 파일 크기 측면에서 별 상관도 없겠지마는 추후에 크기가 큰 라이브러리를 만들 때를 대비해서 약간 알아보기는 했다.

### minify

minify는 공백을 없앤다든가 변수명을 간단히 해서 파일 크기를 줄이는 걸 말한다.

우선 minify를 하면 당연히 파일 내용을 이해하기 어려워지기 때문에 디버그가 어려워진다는 단점이 생긴다. 이는 sourcemap 파일을 같이 생성해서 원본 파일에 대한 정보를 매핑하는 것으로 보완할 수 있다. 근데 사람들이 말하는 디버그가 어떤 의미인지와 어떤 상황에 필요한지 아직은 잘 모르겠어서 이 관점에서는 패스.

다른 방법으로는 내가 사용하고 있는 라이브러리를 살펴보는 것이다. node_modules 디렉토리를 열어서 확인해보면 거의 모든 라이브러리가 minify가 안 돼 있다. 그럼 나도 하지 않는 선택을 하는 게 좋을 것 같다.

내 생각엔 인터넷 대역폭에 민감한 브라우저 환경으로 배포할 때는 minify를 하고 Node.js같은 서버 사이드 런타임 환경에서는 안 해도 될 것 같다.

그럼 테스팅은 vitest, 빌드는 tsup과 typescript의 힘을 빌려서 준비를 마쳤고 배포를 하면 된다.

### 배포

`npm publish`하면 `package.json`에서 `files`필드에 작성한 `dist`폴더가 함께 업로드 될 것이다.

근데 나는 github에 패키지 소스를 올릴 생각이고 그럼 원본 코드는 내 로컬 저장소가 아닌 git 저장소라고 할 수 있다. 그럼 github 소스 코드를 기반으로 배포하려면 소스 코드와 가장 근접한 github actions로 하는 게 맞다고 생각해서 github actions 사용법을 익혔다.

github actions를 사용하기 전에! 생각해볼게 하나 있다.

내가 어떤 행동을 했을 때 배포가 되는지. 예를 들어 Github에 Release를 publish했을 때 build, test, publish가 자동으로 돌아가게 할지 같은 내용이다. 나는 최소한의 행동으로 배포하고 싶어서 pull request의 제목을 특정 이름으로 하면 배포가 되는 방법보다는 package.json의 버전을 변경한 커밋이 푸시되면 npm에 업로드가 되게 하고 싶었다.

목적을 명확히 했으니 github actions를 사용할 차례이다. 이전에 설정한 목표를 수행하려면 다음의 과정을 거쳐야 한다.

1. push 했을 때 감지
2. package.json 버전 확인
3. 이전 버전과 다르면 tag만들고 build -> test -> publish

다행이도 이런 과정을 해주는 https://github.com/JS-DevTools/npm-publish 가 있어서 이걸 사용했다.

```yaml
name: Publish Package to npmjs

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8
          run_install: false

      - uses: actions/setup-node@v3
        with:
          node-version: "20.x"
          registry-url: "https://registry.npmjs.org"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Test code
        run: pnpm test:code

      - name: Test cjs output
        run: pnpm test:cjs

      - name: Test esm output
        run: pnpm test:esm

      - uses: JS-DevTools/npm-publish@v3
        with:
          token: ${{ secrets.NPM_TOKEN }}
```

오늘 안에 허겁지겁 작성하려다 보니 빼먹은 부분이 많고 급하게 마친다. 앞으로 시간은 많으니 다시 패키지를 만들어볼 때 좀 더 자세히 적어봐야겠다.
