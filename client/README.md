# Interior Estimate — Client (React + Vite)

## 실행 환경

**Node.js >= 18** 필요. 시스템 Node 버전이 낮으면 아래와 같은 에러가 발생한다:

```
npm WARN EBADENGINE Unsupported engine {
  package: 'concurrently@9.x.x',
  required: { node: '>=18' },
  current: { node: 'v16.x.x', ... }
}
```

nvm을 사용해 버전을 전환한 후 실행한다 (프로젝트 루트에 `.nvmrc`로 v20 지정됨):

```bash
# 프로젝트 루트에서
nvm use          # .nvmrc 읽어서 Node 20 자동 선택
npm run dev      # client(5173) + server(3001) 동시 실행
```

nvm이 설치되지 않은 경우 먼저 설치:
```bash
brew install nvm
source ~/.nvm/nvm.sh
nvm install 20
```

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
