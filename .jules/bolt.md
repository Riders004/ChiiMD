## 2024-07-25 - Reduce Unnecessary Database Writes (Attempted)

**Learning:** An attempt was made to reduce unnecessary disk I/O by introducing a "dirty" flag to track changes to the in-memory database (`global.db.data`). However, the implementation proved to be critically unsafe. In a plugin-based architecture where dozens of plugins can directly mutate the global database object, it is nearly impossible to manually instrument every single mutation point. This creates a high risk of silent data loss, where a plugin could modify data that is never written to disk. The manual approach is too fragile and error-prone for this codebase.

**Action:** Reverted the attempted change. For this optimization to be implemented safely, a more robust, centralized mechanism is required. The ideal solution would be to wrap `global.db.data` in a `Proxy` object. The `Proxy` would intercept all write operations (sets, deletes) and automatically set the dirty flag, ensuring that *every* change is tracked without requiring manual intervention in every plugin. This would eliminate the risk of data loss and provide a reliable way to optimize database writes. Avoid manual dirty-flag tracking in the future.

## 2025-05-14 - Optimize Database Initialization and Allocation
**Learning:** Frequent object allocations (especially large objects with 100+ properties) and full object replacements in a Proxy-wrapped database can cause significant memory pressure and unnecessary disk writes.
**Action:** Move default data structures to the module's top level and use in-place mutations (e.g., `if (!(key in obj)) obj[key] = val`) to avoid redundant allocations and minimize Proxy "dirtying".
