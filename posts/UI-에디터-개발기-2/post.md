---
title: UI 에디터 개발기[2]
slug: UI-에디터-개발기-2
date: 2023-10-16
---

![What I did today](/posts/UI-에디터-개발기-2/image/what_I_did_today.png)
사진 기능을 드디어 추가함

이번 작업은 어제 계획했던 대로 폴더내부를 보여주는 트리 컴포넌트를 만드는 것이다. 바로 위 사진, 왼쪽 위에 "Open a folder" 버튼을 누르면 폴더 트리가 보인다. 현재 사진 속 화면은 내 블로그 폴더를 연 상태에서 `src/pages/home.ts`를 클릭한 모습이다. 오른쪽에 있는 건 home.ts 데이터를 그냥 띄어놓은 거다.

어떤 걸 했는지 짧게 되새김해 보자면

1. pnpm 모노레포 세팅
2. Next.js, Tauri 세팅
3. FileTree UI 컴포넌트, LeftPanel 컨테이너
4. 파일 클릭하면 데이터 넘기기

### 1. pnpm 모노레포 세팅

별 거 없고 `pnpm-workspace.yaml`에 패키지 경로 `apps/web`, `apps/desktop`적어줬다.

### 2. Next.js, Tauri 세팅

`create-next-app`과 `cargo tauri dev`를 사용해서 프로젝트를 생성했다. 여기서 좀 다르게 한 점은 Tauri 튜토리얼을 보면 Next.js 레포 안 src-tauri라는 폴더에 데스크탑용 코드가 들어가는데 이걸 밖으로 뺐다.

```
// 튜토리얼
- apps
	- web
		- ...
		- src-tauri

// 변경한 방식
- apps
	- desktop
	- web
```

### 3. FileTree UI 컴포넌트, LeftPanel 컨테이너

옛날 방식이긴 하지만 components/containers 방식으로 구조를 정했다. 그리고 UI 컴포넌트 `<FileTree />`부터 작성했다.

```jsx
// components/file-tree/index.tsx
import { useTreeData } from "@react-stately/data"

function FileTree({ root }) {
	const tree = useTreeData(...)
	return <Folder folder={tree.items[0]} />
}

// components/file-tree/folder.tsx
function Folder(folder) {
	return (
		<div>
			<div>{folder.value.name}</div>
			{folder.children.map(child => 
					child.type === "file" ?
						<File file={child} /> :
						<Folder folder={child} />)}
		</div>
	)
}
```

대충 이런 식이었던 것 같다. 저 `useTreeData`는 트리 내부 데이터를 바꿀 때 유용해서 지금은 쓸모없지만 그냥 미리 넣어놨다.

이제 이 UI 컴포넌트를 불러와서 데이터를 넣어줘야 하니까 `<LeftPanel />`이라는 컴포넌트를 `containers`폴더에 만들었다. 이름을 어떻게 지을지 몰라서 그냥 이렇게 했다. 그리고 제일 왼쪽 위 "Open a folder" 버튼을 만들고 `import { open } from @tauri-apps/api/dialog`모듈을 사용해서 클릭하면 파인더가 열리게 했다. 이어서 확인을 누르면 `import { readDir } from @tauri-apps/api/fs`로 파일 정보를 읽어 `<FileTree />`에 넣어줬다.

```jsx
// 대충 이런 느낌
function LeftPanel() {
	const [root, setRoot] = useState(null);

	const handleOpenFolderClick = () => {
		// open()
		// readDir()
		// setRoot()
	};

	return (
		<div>
			<button onClick={handleOpenFolderClick}>Open a folder</button>
			<FileTree root={root} />
		</div>
	);
}
```

### 4. 파일 클릭하면 데이터 넘기기

이건 조금 고민을 했다. 어쨌든 지금 데이터는 왼쪽에서 오른쪽으로 흘러가는 데 그렇다고 데이터가 연결되는 두 컨테이너를 서로 의존시키고 싶지가 않아서 임의로 데이터를 관리하고 이어주는 manager라는 애를 하나 만들었다.

현재 보고 있는 파일의 정보를 `currentFile`이라고 하면 manager가 그 값을 가지고 있는다. `<LeftPanel />`에서 `manager.currentFile.update(data)`같은 함수를 실행해서 값을 바꿀 수 있다. 그다음에 어디에선가 `currentFile` 데이터를 사용할 애들은 `manager.currentFile.subscribe((data) => {})`를 실행해서 값이 변하면 실행될 콜백을 넣어준다. `window.addEventListener`같이 이벤트를 관찰하는 거다.

이 방식을 리액트에서 사용하려고 이것 저것 만져보면서 구현해볼까라는 생각을 잠시 했지만 zustand를 사용하기로 정했다. 방법은 zustand store에 데이터를 저장하고, 데이터에 의존하는 컴포넌트는 useStore를 사용하면 데이터가 변경될 때마다 리렌더링이 진행된다.

### 이제 다음 할 것은?

이제 파일을 클릭하면 파일 내부에 있는 컴포넌트 목록을 보여줄 차례이다. 이걸 구현하려면 코드를 파싱해야 되는데 오늘 시간이 좀 남아서 좀 알아봤다. 아무래도 Tauri가 러스트 기반이어서 SWC가 좋아 보여서 코드를 좀 살펴봤고 문서가 적어서 약간 시간이 좀 걸렸지만 구상은 해놨다. 근데 아직 러스트를 잘 모르기 때문에 구현하는데 시간이 걸릴 것 같아서 js로 할 수 있는 방법 찾아보던 중 `@swc/wasm-web`을 발견!

이제 내일 아니면 모레 중에 컴포넌트 목록 보여주는 것까지는 마칠 수 있을 것 같다. 끝.
