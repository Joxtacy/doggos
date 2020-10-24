
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const breeds = writable([
        { id: "random", name: "random" },
    ]);
    const selected = writable({
        id: "random",
        name: "random",
    });
    const animal = writable("dog");

    /* src/components/Spinner.svelte generated by Svelte v3.29.0 */

    const file = "src/components/Spinner.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let animateTransform;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			animateTransform = svg_element("animateTransform");
    			attr_dev(path0, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path0, "fill", "#000000");
    			attr_dev(path0, "fill-opacity", "1");
    			add_location(path0, file, 6, 8, 121);
    			attr_dev(path1, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path1, "fill", "#cccccc");
    			attr_dev(path1, "fill-opacity", "0.2");
    			attr_dev(path1, "transform", "rotate(30 64 64)");
    			add_location(path1, file, 7, 8, 193);
    			attr_dev(path2, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path2, "fill", "#cccccc");
    			attr_dev(path2, "fill-opacity", "0.2");
    			attr_dev(path2, "transform", "rotate(60 64 64)");
    			add_location(path2, file, 12, 8, 344);
    			attr_dev(path3, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path3, "fill", "#cccccc");
    			attr_dev(path3, "fill-opacity", "0.2");
    			attr_dev(path3, "transform", "rotate(90 64 64)");
    			add_location(path3, file, 17, 8, 495);
    			attr_dev(path4, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path4, "fill", "#cccccc");
    			attr_dev(path4, "fill-opacity", "0.2");
    			attr_dev(path4, "transform", "rotate(120 64 64)");
    			add_location(path4, file, 22, 8, 646);
    			attr_dev(path5, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path5, "fill", "#b2b2b2");
    			attr_dev(path5, "fill-opacity", "0.3");
    			attr_dev(path5, "transform", "rotate(150 64 64)");
    			add_location(path5, file, 27, 8, 798);
    			attr_dev(path6, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path6, "fill", "#999999");
    			attr_dev(path6, "fill-opacity", "0.4");
    			attr_dev(path6, "transform", "rotate(180 64 64)");
    			add_location(path6, file, 32, 8, 950);
    			attr_dev(path7, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path7, "fill", "#7f7f7f");
    			attr_dev(path7, "fill-opacity", "0.5");
    			attr_dev(path7, "transform", "rotate(210 64 64)");
    			add_location(path7, file, 37, 8, 1102);
    			attr_dev(path8, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path8, "fill", "#666666");
    			attr_dev(path8, "fill-opacity", "0.6");
    			attr_dev(path8, "transform", "rotate(240 64 64)");
    			add_location(path8, file, 42, 8, 1254);
    			attr_dev(path9, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path9, "fill", "#4c4c4c");
    			attr_dev(path9, "fill-opacity", "0.7");
    			attr_dev(path9, "transform", "rotate(270 64 64)");
    			add_location(path9, file, 47, 8, 1406);
    			attr_dev(path10, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path10, "fill", "#333333");
    			attr_dev(path10, "fill-opacity", "0.8");
    			attr_dev(path10, "transform", "rotate(300 64 64)");
    			add_location(path10, file, 52, 8, 1558);
    			attr_dev(path11, "d", "M59.6 0h8v40h-8V0z");
    			attr_dev(path11, "fill", "#191919");
    			attr_dev(path11, "fill-opacity", "0.9");
    			attr_dev(path11, "transform", "rotate(330 64 64)");
    			add_location(path11, file, 57, 8, 1710);
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "values", "0 64 64;30 64 64;60 64 64;90 64 64;120 64 64;150 64 64;180 64 64;210 64 64;240 64 64;270 64 64;300 64 64;330 64 64");
    			attr_dev(animateTransform, "calcMode", "discrete");
    			attr_dev(animateTransform, "dur", "1080ms");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			add_location(animateTransform, file, 62, 8, 1862);
    			add_location(g, file, 5, 25, 109);
    			attr_dev(svg, "version", "1.0");
    			attr_dev(svg, "width", "64px");
    			attr_dev(svg, "height", "64px");
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    			append_dev(g, path4);
    			append_dev(g, path5);
    			append_dev(g, path6);
    			append_dev(g, path7);
    			append_dev(g, path8);
    			append_dev(g, path9);
    			append_dev(g, path10);
    			append_dev(g, path11);
    			append_dev(g, animateTransform);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/DogCard.svelte generated by Svelte v3.29.0 */
    const file$1 = "src/components/DogCard.svelte";

    // (96:8) {:catch error}
    function create_catch_block(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*error*/ ctx[7].message.toLowerCase() + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("oh noes ");
    			t1 = text(t1_value);
    			add_location(div, file$1, 96, 12, 2960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*error*/ ctx[7].message.toLowerCase() + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(96:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (94:8) {:then result}
    function create_then_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*result*/ ctx[6].message)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Random Doggo");
    			attr_dev(img, "class", "svelte-6jgiyw");
    			add_location(img, file$1, 94, 12, 2877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && img.src !== (img_src_value = /*result*/ ctx[6].message)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(94:8) {:then result}",
    		ctx
    	});

    	return block;
    }

    // (92:21)              <Spinner />         {:then result}
    function create_pending_block(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(92:21)              <Spinner />         {:then result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let link;
    	let t0;
    	let div1;
    	let div0;
    	let promise;
    	let t1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 6,
    		error: 7,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*data*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			info.block.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "New\n        Doggo";
    			document.title = "Doggos";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "./favicon.png");
    			add_location(link, file$1, 86, 4, 2660);
    			attr_dev(div0, "class", "image-container svelte-6jgiyw");
    			add_location(div0, file$1, 90, 4, 2766);
    			attr_dev(button, "class", "new-doggo-button svelte-6jgiyw");
    			add_location(button, file$1, 99, 4, 3041);
    			attr_dev(div1, "class", "dog-container svelte-6jgiyw");
    			add_location(div1, file$1, 89, 0, 2734);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*renewDoggo*/ ctx[1]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*data*/ 1 && promise !== (promise = /*data*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[6] = child_ctx[7] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $selected;
    	validate_store(selected, "selected");
    	component_subscribe($$self, selected, $$value => $$invalidate(2, $selected = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DogCard", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let data;

    	const getDog = () => __awaiter(void 0, void 0, void 0, function* () {
    		return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    				const random = $selected.name === "random";

    				const url = random
    				? "https://dog.ceo/api/breeds/image/random"
    				: `https://dog.ceo/api/breed/${$selected.name}/images/random`;

    				return fetch(url).then(res => res.json()).then(json => resolve(json)).catch(() => reject({ message: "Something went wrong" }));
    			}));
    	});

    	const renewDoggo = () => {
    		$$invalidate(0, data = getDog());
    	};

    	const unsubscribe = selected.subscribe(renewDoggo);
    	onDestroy(unsubscribe);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DogCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onDestroy,
    		selected,
    		Spinner,
    		data,
    		getDog,
    		renewDoggo,
    		unsubscribe,
    		$selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, renewDoggo];
    }

    class DogCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DogCard",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/CatCard.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/components/CatCard.svelte";

    // (99:8) {:catch error}
    function create_catch_block$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*error*/ ctx[7].message.toLowerCase() + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("oh noes ");
    			t1 = text(t1_value);
    			add_location(div, file$2, 99, 12, 3095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*error*/ ctx[7].message.toLowerCase() + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(99:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (97:8) {:then result}
    function create_then_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*result*/ ctx[6].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Random Kitty");
    			attr_dev(img, "class", "svelte-1ln8yhl");
    			add_location(img, file$2, 97, 12, 3016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && img.src !== (img_src_value = /*result*/ ctx[6].url)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(97:8) {:then result}",
    		ctx
    	});

    	return block;
    }

    // (95:21)              <Spinner />         {:then result}
    function create_pending_block$1(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(95:21)              <Spinner />         {:then result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let div1;
    	let div0;
    	let promise;
    	let t1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 6,
    		error: 7,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*data*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			info.block.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "New\n        Kitty";
    			document.title = "Kitties";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "./favicon_kitty.png");
    			add_location(link, file$2, 89, 4, 2793);
    			attr_dev(div0, "class", "image-container svelte-1ln8yhl");
    			add_location(div0, file$2, 93, 4, 2905);
    			attr_dev(button, "class", "new-kitty-button svelte-1ln8yhl");
    			add_location(button, file$2, 102, 4, 3176);
    			attr_dev(div1, "class", "cat-container svelte-1ln8yhl");
    			add_location(div1, file$2, 92, 0, 2873);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*renewKitty*/ ctx[1]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*data*/ 1 && promise !== (promise = /*data*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[6] = child_ctx[7] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $selected;
    	validate_store(selected, "selected");
    	component_subscribe($$self, selected, $$value => $$invalidate(2, $selected = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CatCard", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let data;

    	const getCat = () => __awaiter(void 0, void 0, void 0, function* () {
    		return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    				const random = $selected.name === "random";

    				const url = random
    				? "https://api.thecatapi.com/v1/images/search"
    				: `https://api.thecatapi.com/v1/images/search?breed_ids=${$selected.id}`;

    				const headers = {
    					"x-api-key": "199e9233-ea1f-495c-8818-1e680ed0a4f1"
    				};

    				return fetch(url, { headers }).then(res => res.json()).then(json => resolve(json[0])).catch(() => reject({ message: "Something went wrong" }));
    			}));
    	});

    	const renewKitty = () => {
    		$$invalidate(0, data = getCat());
    	};

    	const unsubscribe = selected.subscribe(renewKitty);
    	onDestroy(unsubscribe);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CatCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onDestroy,
    		selected,
    		Spinner,
    		data,
    		getCat,
    		renewKitty,
    		unsubscribe,
    		$selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, renewKitty];
    }

    class CatCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CatCard",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/BreedPicker.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/components/BreedPicker.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (62:4) {#each $breeds as breed}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*breed*/ ctx[5].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*breed*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file$3, 62, 8, 1731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$breeds*/ 2 && t_value !== (t_value = /*breed*/ ctx[5].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$breeds*/ 2 && option_value_value !== (option_value_value = /*breed*/ ctx[5])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:4) {#each $breeds as breed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*$breeds*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-tujz10");
    			if (/*$selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$3, 60, 0, 1662);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$selected*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$breeds*/ 2) {
    				each_value = /*$breeds*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$selected, $breeds*/ 3) {
    				select_option(select, /*$selected*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selected;
    	let $breeds;
    	validate_store(selected, "selected");
    	component_subscribe($$self, selected, $$value => $$invalidate(0, $selected = $$value));
    	validate_store(breeds, "breeds");
    	component_subscribe($$self, breeds, $$value => $$invalidate(1, $breeds = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BreedPicker", slots, []);

    	const getBreedList = animal => {
    		const defaultBreed = { id: "random", name: "random" };

    		switch (animal) {
    			case "dog":
    				{
    					fetch("https://dog.ceo/api/breeds/list/all").then(res => res.json()).then(json => {
    						const keys = Object.keys(json.message);
    						const keysAndObjs = keys.map(key => ({ id: key, name: key }));
    						const dogBreeds = [defaultBreed, ...keysAndObjs];
    						breeds.set(dogBreeds);
    						selected.set(defaultBreed);
    					});

    					break;
    				}
    			case "cat":
    				{
    					fetch("https://api.thecatapi.com/v1/breeds").then(res => res.json()).then(json => {
    						const catBreeds = [
    							defaultBreed,
    							...json.map(breed => ({ id: breed.id, name: breed.name }))
    						];

    						breeds.set(catBreeds);
    						selected.set(defaultBreed);
    					});

    					break;
    				}
    		}
    	};

    	const unsubscribe = animal.subscribe(value => {
    		getBreedList(value);
    	});

    	onDestroy(unsubscribe);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BreedPicker> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$selected = select_value(this);
    		selected.set($selected);
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		breeds,
    		selected,
    		animal,
    		getBreedList,
    		unsubscribe,
    		$selected,
    		$breeds
    	});

    	return [$selected, $breeds, select_change_handler];
    }

    class BreedPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BreedPicker",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/ToggleSwitch.svelte generated by Svelte v3.29.0 */
    const file$4 = "src/components/ToggleSwitch.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let input;
    	let t2;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Cats";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Dogs";
    			attr_dev(span0, "class", "svelte-1ptkce1");
    			add_location(span0, file$4, 59, 4, 1306);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-1ptkce1");
    			add_location(input, file$4, 60, 4, 1328);
    			attr_dev(span1, "class", "svelte-1ptkce1");
    			add_location(span1, file$4, 61, 4, 1371);
    			attr_dev(div, "class", "toggle-container svelte-1ptkce1");
    			add_location(div, file$4, 58, 0, 1271);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div, t2);
    			append_dev(div, span1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ToggleSwitch", slots, []);
    	let { checked = false } = $$props;
    	const writable_props = ["checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToggleSwitch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ animal, checked });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*checked*/ 1) {
    			 {
    				checked ? animal.set("dog") : animal.set("cat");
    			}
    		}
    	};

    	return [checked, input_change_handler];
    }

    class ToggleSwitch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleSwitch",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get checked() {
    		throw new Error("<ToggleSwitch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<ToggleSwitch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */
    const file$5 = "src/App.svelte";

    // (41:32) 
    function create_if_block_3(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Kitty randomizer";
    			attr_dev(h1, "class", "svelte-vf0oep");
    			add_location(h1, file$5, 41, 8, 925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(41:32) ",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#if $animal === 'dog'}
    function create_if_block_2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Doggo randomizer";
    			attr_dev(h1, "class", "svelte-vf0oep");
    			add_location(h1, file$5, 39, 8, 858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(39:4) {#if $animal === 'dog'}",
    		ctx
    	});

    	return block;
    }

    // (49:36) 
    function create_if_block_1(ctx) {
    	let catcard;
    	let current;
    	catcard = new CatCard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(catcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(catcard, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(catcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(catcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(catcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(49:36) ",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#if $animal === 'dog'}
    function create_if_block(ctx) {
    	let dogcard;
    	let current;
    	dogcard = new DogCard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(dogcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dogcard, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dogcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dogcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dogcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(47:8) {#if $animal === 'dog'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let t0;
    	let div;
    	let toggleswitch;
    	let t1;
    	let breedpicker;
    	let t2;
    	let current_block_type_index;
    	let if_block1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*$animal*/ ctx[0] === "dog") return create_if_block_2;
    		if (/*$animal*/ ctx[0] === "cat") return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	toggleswitch = new ToggleSwitch({ props: { checked: true }, $$inline: true });
    	breedpicker = new BreedPicker({ $$inline: true });
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$animal*/ ctx[0] === "dog") return 0;
    		if (/*$animal*/ ctx[0] === "cat") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			create_component(toggleswitch.$$.fragment);
    			t1 = space();
    			create_component(breedpicker.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "doggo-container svelte-vf0oep");
    			add_location(div, file$5, 43, 4, 965);
    			attr_dev(main, "class", "svelte-vf0oep");
    			add_location(main, file$5, 37, 0, 815);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			mount_component(toggleswitch, div, null);
    			append_dev(div, t1);
    			mount_component(breedpicker, div, null);
    			append_dev(div, t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(main, t0);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggleswitch.$$.fragment, local);
    			transition_in(breedpicker.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggleswitch.$$.fragment, local);
    			transition_out(breedpicker.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (if_block0) {
    				if_block0.d();
    			}

    			destroy_component(toggleswitch);
    			destroy_component(breedpicker);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $animal;
    	validate_store(animal, "animal");
    	component_subscribe($$self, animal, $$value => $$invalidate(0, $animal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		animal,
    		DogCard,
    		CatCard,
    		BreedPicker,
    		ToggleSwitch,
    		$animal
    	});

    	return [$animal];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
