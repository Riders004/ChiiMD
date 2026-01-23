/**
 * Creates a recursive Proxy that wraps a target object and all its nested properties.
 * When any property is set or deleted, the `onDirty` callback is invoked.
 *
 * @param {object} target - The object to wrap.
 * @param {Function} onDirty - The callback to execute when a change is detected.
 * @returns {Proxy} - A Proxy-wrapped version of the target object.
 */
export function createRecursiveProxy(target, onDirty) {
	const handler = {
		get(target, property, receiver) {
			const value = Reflect.get(target, property, receiver);
			// If the retrieved value is an object, wrap it in a Proxy as well.
			if (typeof value === 'object' && value !== null) {
				return new Proxy(value, handler);
			}
			return value;
		},
		set(target, property, value, receiver) {
			// A property is being set, so the object is dirty.
			onDirty();
			return Reflect.set(target, property, value, receiver);
		},
		deleteProperty(target, property) {
			// A property is being deleted, so the object is dirty.
			onDirty();
			return Reflect.deleteProperty(target, property);
		},
	};
	return new Proxy(target, handler);
}
