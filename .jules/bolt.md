## 2024-07-25 - Reduce Unnecessary Database Writes (Attempted)

**Learning:** An attempt was made to reduce unnecessary disk I/O by introducing a "dirty" flag to track changes to the in-memory database (`global.db.data`). However, the implementation proved to be critically unsafe. In a plugin-based architecture where dozens of plugins can directly mutate the global database object, it is nearly impossible to manually instrument every single mutation point. This creates a high risk of silent data loss, where a plugin could modify data that is never written to disk. The manual approach is too fragile and error-prone for this codebase.

**Action:** Reverted the attempted change. For this optimization to be implemented safely, a more robust, centralized mechanism is required. The ideal solution would be to wrap `global.db.data` in a `Proxy` object. The `Proxy` would intercept all write operations (sets, deletes) and automatically set the dirty flag, ensuring that *every* change is tracked without requiring manual intervention in every plugin. This would eliminate the risk of data loss and provide a reliable way to optimize database writes. Avoid manual dirty-flag tracking in the future.

## 2025-01-30 - Optimize Hot Paths (Message Handling)

**Learning:** Dynamic `await import()` in hot code paths like the message handler (`handler.js`) adds unnecessary overhead (promise microtasks, module resolution) on every message. Similarly, large object literals defined inside a function called on every message (like `lib/database.js`) lead to high garbage collection pressure.

**Action:** Replaced dynamic imports with static ones where possible and moved large default object templates to the top level. Used a simple `sync` function to merge defaults instead of re-allocating and re-assigning the entire object.
