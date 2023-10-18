---
title: UI 에디터 개발기[3]
slug: UI-에디터-개발기-3
date: 2023-10-18
---

이번에는 자바스크립트 파일을 파싱해서 컴포넌트 목록을 불러와야 하는 작업이다. 오픈소스 파싱 라이브러리가 많아서 방법은 간단하다. 나는 `@swc/wasm-web`을 선택했다. 만약 나중에 성능 개선이 필요하면 rust에서 직접 사용하면 되고 웹에서도 동작을 원할 때 wasm의 성능 혜택을 볼 수 있을 것이다.

```javascript
import swcInit, { parse } from "@swc/wasm-web";

function Component() {
	const [swcInitialized, setSwcInitialized] = useState(false);

	const parseFile = () => {
		if (!swcInitialzied) return;

		parse("function a() {}", {
			syntax: "typescript",
			tsx: true,
		}).then(console.log);
	};

	useEffect(() => {
		swcInit().then(() => setState(true));
	}, []);
}
```

출력 결과물은 다음과 같다. playground 사이트: https://astexplorer.net/

```json
{
	"type": "Module",
	"span": {
		"start": 0,
		"end": 15,
		"ctxt": 0
	},
	"body": [
		{
			"type": "FunctionDeclaration",
			"identifier": {
				"type": "Identifier",
				"span": {
					"start": 9,
					"end": 10,
					"ctxt": 0
				},
				"value": "a",
				"optional": false
			},
			"declare": false,
			"params": [],
			"decorators": [],
			"span": {
				"start": 0,
				"end": 15,
				"ctxt": 0
			},
			"body": {
				"type": "BlockStatement",
				"span": {
					"start": 13,
					"end": 15,
					"ctxt": 0
				},
				"stmts": []
			},
			"generator": false,
			"async": false,
			"typeParameters": null,
			"returnType": null
		}
	],
	"interpreter": null
}
```

그럼 이 AST를 이용해 컴포넌트를 찾아야 한다. 컴포넌트를 찾는 방법은 body 최상단에서 `ExportDeclaration`, `ExportDefaultDeclaration`을 찾고 걔네 자식중에 `JSX머시기`가 있는지 확인하면 된다.(일단은 esmodule 방식만 고려함) 컴포넌트를 찾는 이 함수는 나중에도 계속 쓰일 것 같아서 테스트 코드를 좀 작성해야 하는데 어제오늘 너무 피곤해서 시간 날 때 작성해 놓으려고 한다.

이 컴포넌트 노드의 `identifier.value`값은 컴포넌트 이름이기 때문에 이 값을 이용해서 컴포넌트 목록을 만들었다. 이제 컴포넌트 항목을 드래그해서 오른쪽에 떨어뜨리면 컴포넌트 프레임이 렌더링되는 다음 작업을 위해서 어떤 데이터를 넘겨줘야 할지 생각해봐야 한다. 근데 너무 피곤해서 일단 자야겠다.
