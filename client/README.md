# Interior Estimate — Client (React + Vite)

## 실행 환경

**Node.js >= 18** 필요. nvm으로 관리하며 기본 버전이 v20으로 설정되어 있다.

```bash
# 프로젝트 루트에서 바로 실행
npm run dev      # client(5173) + server(3001) 동시 실행
```

nvm이 설치되지 않았거나 Node 버전 에러(`EBADENGINE`)가 발생하는 경우:

```bash
# 1. nvm 설치 (미설치 시)
brew install nvm

# 2. ~/.zshrc에 nvm 초기화 코드 추가 후 재시작
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Node 20 설치 및 기본값 설정
nvm install 20
nvm alias default 20
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
