// lib/proxy.js

/**
 * Creates a recursive proxy that triggers a callback on any change.
 * This is used to set a "dirty" flag when the database is modified.
 * @param {object} target The object to watch for changes.
 * @param {function} onChange The callback to execute when a change is detected.
 * @returns {Proxy} A recursive proxy wrapping the target object.
 */
function watch(target, onChange) {
  const proxied = new WeakMap();

  function createProxy(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    // Return existing proxy if we've already wrapped this object
    if (proxied.has(obj)) {
      return proxied.get(obj);
    }

    const proxy = new Proxy(obj, {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);
        // ⚡ Bolt: Recursively create a proxy for nested objects on access.
        // This ensures that modifications to any part of the data structure are tracked, preventing data loss.
        if (typeof value === 'object' && value !== null) {
          return createProxy(value);
        }
        return value;
      },
      set(target, property, value, receiver) {
        const oldValue = Reflect.get(target, property, receiver);
        // Only trigger onChange if the value has actually changed.
        if (oldValue !== value) {
          Reflect.set(target, property, value, receiver);
          onChange();
        }
        return true;
      },
      deleteProperty(target, property) {
        if (property in target) {
          Reflect.deleteProperty(target, property);
          onChange();
        }
        return true;
      },
    });

    // Cache the proxy for this object
    proxied.set(obj, proxy);
    return proxy;
  }

  return createProxy(target);
}

module.exports = {
  watch,
};
