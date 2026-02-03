## 2024-07-25 - Reduce Unnecessary Database Writes (Attempted)

**Learning:** An attempt was made to reduce unnecessary disk I/O by introducing a "dirty" flag to track changes to the in-memory database (`global.db.data`). However, the implementation proved to be critically unsafe. In a plugin-based architecture where dozens of plugins can directly mutate the global database object, it is nearly impossible to manually instrument every single mutation point. This creates a high risk of silent data loss, where a plugin could modify data that is never written to disk. The manual approach is too fragile and error-prone for this codebase.

**Action:** Reverted the attempted change. For this optimization to be implemented safely, a more robust, centralized mechanism is required. The ideal solution would be to wrap `global.db.data` in a `Proxy` object. The `Proxy` would intercept all write operations (sets, deletes) and automatically set the dirty flag, ensuring that *every* change is tracked without requiring manual intervention in every plugin. This would eliminate the risk of data loss and provide a reliable way to optimize database writes. Avoid manual dirty-flag tracking in the future.

## 2024-07-25 - Hot Path Optimization in Message Handler

**Learning:** The message handler (`handler.js`) is the hottest path in the application, executing for every incoming message. Redundant operations here, such as path calculations, utility function definitions, and especially regex-based prefix matching across a large set of plugins, significantly impact throughput.

**Action:** Optimized `handler.js` by hoisting constants and utilities, pre-calculating the default prefix match once per message (reducing matching complexity from O(N) to O(1) for common plugins), and replacing dynamic imports with static ones. Always look for redundant work inside high-frequency loops.
