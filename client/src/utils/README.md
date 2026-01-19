## Regular Functions in React

When writing regular functions (utils, helpers) in a React project, there are some important guidelines:

---

### 1. Keep utils React-free
- No React-specific code: no `useState`, `useEffect`, `setX`, JSX, or context.
- Strict input → output: the same input should always produce the same output.

---

### 2. Handle asynchronous code clearly
- If the function is asynchronous, always return a Promise and handle errors via `throw` or `reject`.
- Utils should not concern themselves with UI, spinners, or alert boxes.

---

### 3. Make functions reusable
- No hard-coded dependency on components, state, or props.
- Parameters should make the function flexible and general.

