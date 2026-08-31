# Project Execution Flow

This document explains the execution flow of the application, starting from the `index.html` file and moving through the React entry point, application component, and authentication context.

## 1. `index.html`

- When the application is run, the `index.html` file serves as the initial entry point loaded by the browser.

- It contains a `<div>` element with the ID `root`. This is the DOM element into which the React application is mounted.

  ```html
  <div id="root"></div>
  ```

- The React application's entry-point JavaScript/TypeScript file is loaded using a `<script>` tag. In a typical Vite + React + TypeScript project, this is `main.tsx`.

  ```html
  <script type="module" src="/src/main.tsx"></script>
  ```

---

## 2. `main.tsx`

- `main.tsx` is the entry point of the React application.
- It obtains the DOM element with the ID `root` from `index.html`.
- A React root is then created using `createRoot()`.
- The `App` component is rendered inside `React.StrictMode`.

## 3. `App.tsx`

- `App.tsx` is the main component of the React application.
- It defines the application's overall component structure.
- It returns the application's routes/pages.
- The routes are wrapped inside providers such as `AuthProvider` and `AppProvider`.

These providers make shared data and functionality available to the components rendered inside them.

---

## 4. `AuthContext.tsx`

`AuthContext.tsx` is responsible for managing and providing authentication-related information throughout the application.

### Information provided by `AuthContext`

The context can provide information such as:

- The currently authenticated user's details
- Authentication/loading state and functions
- Access-token refresh status

### State variables

Two main pieces of state are maintained:

- `user`- contains the currently authenticated user's public information (id, email and full name).

```tsx
user: PublicUserDetails | null;
```

-  `isLoading` - indicates whether the authentication information is currently being loaded or initialized

```tsx
isLoading: boolean;
```

### refreshPromise

```tsx
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
```

The purpose of storing the promise in a `ref` is to keep the same promise available across renders without causing the component to re-render when the value changes.

#### Why is same promise required?

Suppose the access token has a short lifetime, such as **15 minutes**.
When the access token expires, the application needs to obtain a new access token using the refresh mechanism.
We do **not** want the entire application to reload every time the access token needs to be refreshed. Instead, the token should be refreshed in the background while the application continues running normally. And also, we do not want different refresh token to be generated for every api request in queue.

The `refreshPromiseRef` helps coordinate this process.

```text
Request 1 ──┐
Request 2 ──┼──> Existing refreshPromiseRef ──> Token refreshed
Request 3 ──┘
```

All requests can wait for the same refresh operation and use the resulting token once it is available.

The `refreshPromise` **does not contain the refresh token itself**.
It stores the **Promise representing the token-refresh operation**.

In other words:

```text
Refresh token
     ↓
Used to request a new access token
     ↓
Refresh operation
     ↓
Promise
     ↓
Stored in refreshPromise.current
```

The purpose of the ref is therefore to keep track of an ongoing refresh operation and allow multiple parts of the application to wait for the same operation instead of starting multiple refresh requests.

#### Why are functions in AuthContext useCallback?
`useCallback` keeps stable function references across re-renders so consumers don't re-run effects on every mount. These functions close over state setters, so they can't live outside the component like **applySession**.

---

## 5. `unwrapApiResult`
Wraps every API response and throws when `success` is false. `ApiResult` is either `ApiSuccess` or `ApiError`, so TypeScript forces you to handle both shapes — without it, reading `result.data` on an error response can throw **cannot access properties of undefined**.

## Overall Application Flow

- `index.html` provides the DOM container
- `main.tsx` initializes React
- `App.tsx` defines the application's structure
- `AuthContext.tsx` manages authentication-related state and makes it available throughout the application.
