---
title: UI 에디터 개발기[8]
slug: UI-에디터-개발기-8
date: 2023-10-28
---

저번 편에서는 UI 컴포넌트 렌더링을 위한 서버를 실행한 후 생긴 문제를 해결했었다. 오늘은 실행 중인 렌더링 서버의 코드를 조작해서 iframe 캔버스 화면에 컴포넌트를 추가하거나 다른 캔버스를 보여줄 수 있게 할 생각이다.

![App Design](/posts/UI-에디터-개발기-8/image/design.png)

앱 화면이라고 가정하면 지금은 제일 왼쪽 `Repository`칸에서 `Button.tsx` 파일을 클릭한 후 `frame1`이라는 프레임을 클릭한 상태이다.

파일 클릭 -> 파일 내 컴포넌트 표시, 추가된 컴포넌트는 가로세로 길이를 지정한 프레임과 함께 캔버스에 렌더링 -> 오른쪽 칸에서는 컴포넌트 props 수정 가능

이렇게만 보면 조금 복잡한 것 같으니 가장 핵심이 되는 컴포넌트를 렌더링하는 기능을 먼저 생각해보자. 컴포넌트는 프레임에 감싸져 `<Frame width="300px" height="auto"><Button bg="red" color="green">Click!</Button></Frame>`이런 모습이 될 것이다. 이런 코드를 렌더링 서버 속 메인 페이지 코드에 삽입해서 컴포넌트 UI를 보여줄 생각이다.

코드 삽입을 위해 알아야 할 값은 무엇이 있을까?

- 복제한 디렉토리 경로
- 메인 페이지 경로(예: `pages/index.tsx`)
- `Button.tsx` 파일명과 상대 경로, `<Button />` 컴포넌트 이름과 props 정보

### 복제한 디렉토리 경로

앱 데이터 폴더에 복제하기 때문에 복제된 디렉토리 경로인 `${appDataDir}${workspaceId}`가 필요하다.

### 메인 페이지 경로

메인 페이지에 내가 작성한 `<Canvas />`컴포넌트 안에 사용자 컴포넌트를 넣고 `<iframe src="http://localhost:3005" />`와 같은 식으로 페이지를 확인하면 내가 의도하는 결과가 나온다. 이 메인 페이지의 경로는 next.js의 경우 `app/page.tsx`나 `pages/index.tsx`이고 이건 사용하는 프레임워크나 개인 설정마다 달라진다. 그렇기 때문에 워크스페이스를 생성할 때 사용자로부터 입력받아야 하는 값이기도 하다.

### `Button.tsx` 파일명과 상대 경로, `<Button />` 컴포넌트 이름과 props 정보

결론부터 보자면 이런 텍스트 데이터를 만들어 메인 페이지에 삽입하게 된다.

```jsx
import { Button } from "../components/Button";

function Canvas({ children }) {
	return <div>{children}</div>;
}

function Frame({ name, width, height, children }) {
	return (
		<div style={{ width, height }}>
			<div>{name}</div>
			{children}
		</div>
	);
}

export default function Page() {
	return (
		<Canvas>
			<Frame name="Frame1" width="300px" height="auto">
				<Button bg="red" color="green">Click!</Button>
			</Frame>
			// ... Frame2
		</Canvas>
	);
}
```

파일명과 그 상대 경로가 필요한 이유는 코드 첫째 줄에 `import`를 할 때 필요하다. 참고로 `Button.tsx`파일을 읽어 텍스트를 여기에 같이 첨부해버리면 편할 수도 있지만 `Button.tsx`의 `import`에 상대 경로가 있다면 결국 상대 경로를 다시 구해야 된다.

그럼 구현 코드를 작성해보자.

```typescript
// 사용법
const canvas = new Canvas(workspaceId, mainFilePath);

await canvas.render(
	{
		name: "Button",
		isExportDefault: false,
		relativePath: "../components/Button",
	},
	{
		name: "Frame1",
		width: "300px",
		height: "auto",
		component: {
			name: "Button",
			props: { bg: "red", color: "green", children: "Click1" },
		},
	},
);
```

```typescript
class Canvas {
	constructor(private workspaceId: string, private mainFilePath: string) {}

	async render(component, frames) {
		const mainFile = await generateMainFile(component, frames);
		overwriteMainFile(mainFile);
	}

	async overwriteMainFile(textData: string) {
		const clonePath = await getCloneDirPath();
		await writeTextFile(
			getClonePath + this.mainFilePath,
			textData,
			{ append: false }
		);
	}

	async getCloneDirPath() {
		const appDataDirPath = await appDataDir();
		return appDataDirPath + this.workspaceId + "/";
	}

	async generateMainFile(component, frames) {
		return `
import ${component.isExportDefault ? `${component.name}` : `{${component.name}}`} from "${component.relativePath}";

function Canvas({ children }) {
	return <div>{children}</div>;
}

function Frame({ name, width, height, children }) {
	return (
		<div style={{ width, height }}>
			<div>{name}</div>
			{children}
		</div>
	);
}

export default function Page() {
	return (
		<Canvas>
			${frames.map(frame => (
				<Frame name={frame.name} width={frame.width} height={frame.height}>
					<${component.name}
						${Object.entries(frame.component.props)
							.filter(([prop]) => prop !== "children")
							.map(([key, val]) => (
								`${key}=${val}`
							)).join(" ")}
					>{frame.component.props.children}</${component.name}>
				</Frame>
			))}
		</Canvas>
	);
}
		`;
	}
}
```

오늘은 여기까지 작성해봤고 앞으로 인터페이스나 구현은 계속 바뀔 것 같다. 내일 이어서..
