
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.25.1' }, detail)));
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

    /* src\components\Header.svelte generated by Svelte v3.25.1 */
    const file = "src\\components\\Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (28:12) {#each mainNav as navItem}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0_value = /*navItem*/ ctx[5] + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*navItem*/ ctx[5], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[4](/*navItem*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = "#" + /*navItem*/ ctx[5]);
    			attr_dev(a, "class", "svelte-qh5ibk");
    			toggle_class(a, "active", /*navItem*/ ctx[5] === /*currentPage*/ ctx[0]);
    			add_location(a, file, 29, 16, 842);
    			attr_dev(li, "class", "svelte-qh5ibk");
    			add_location(li, file, 28, 12, 769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", click_handler, false, false, false),
    					listen_dev(li, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*mainNav*/ 2 && t0_value !== (t0_value = /*navItem*/ ctx[5] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*mainNav*/ 2 && a_href_value !== (a_href_value = "#" + /*navItem*/ ctx[5])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*mainNav, currentPage*/ 3) {
    				toggle_class(a, "active", /*navItem*/ ctx[5] === /*currentPage*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(28:12) {#each mainNav as navItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let nav;
    	let ul;
    	let each_value = /*mainNav*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Svelte Camp";
    			t1 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-qh5ibk");
    			add_location(h1, file, 23, 4, 643);
    			attr_dev(ul, "class", "svelte-qh5ibk");
    			add_location(ul, file, 26, 8, 711);
    			attr_dev(nav, "class", "main-nav svelte-qh5ibk");
    			add_location(nav, file, 24, 4, 669);
    			attr_dev(header, "class", "svelte-qh5ibk");
    			add_location(header, file, 22, 0, 629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, nav);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, mainNav, currentPage*/ 7) {
    				each_value = /*mainNav*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const dispatch = createEventDispatcher();
    	let { mainNav } = $$props;
    	let { currentPage } = $$props;
    	const writable_props = ["mainNav", "currentPage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = navItem => $$invalidate(0, currentPage = navItem);
    	const click_handler_1 = navItem => dispatch("activatePage", navItem);

    	$$self.$$set = $$props => {
    		if ("mainNav" in $$props) $$invalidate(1, mainNav = $$props.mainNav);
    		if ("currentPage" in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		mainNav,
    		currentPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("mainNav" in $$props) $$invalidate(1, mainNav = $$props.mainNav);
    		if ("currentPage" in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentPage, mainNav, dispatch, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { mainNav: 1, currentPage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mainNav*/ ctx[1] === undefined && !("mainNav" in props)) {
    			console.warn("<Header> was created without expected prop 'mainNav'");
    		}

    		if (/*currentPage*/ ctx[0] === undefined && !("currentPage" in props)) {
    			console.warn("<Header> was created without expected prop 'currentPage'");
    		}
    	}

    	get mainNav() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mainNav(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentPage() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPage(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.25.1 */

    const file$1 = "src\\components\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "Svelte Camp 2020";
    			attr_dev(div, "class", "copyright svelte-us9o5i");
    			add_location(div, file$1, 13, 4, 259);
    			attr_dev(footer, "class", "svelte-us9o5i");
    			add_location(footer, file$1, 12, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\shared\Button.svelte generated by Svelte v3.25.1 */

    const file$2 = "src\\shared\\Button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*btnColor*/ ctx[0]) + " svelte-10qcvzp"));
    			toggle_class(button, "shadow", /*shadow*/ ctx[1]);
    			toggle_class(button, "ghost", /*ghost*/ ctx[2]);
    			add_location(button, file$2, 23, 0, 898);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*btnColor*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*btnColor*/ ctx[0]) + " svelte-10qcvzp"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*btnColor, shadow*/ 3) {
    				toggle_class(button, "shadow", /*shadow*/ ctx[1]);
    			}

    			if (dirty & /*btnColor, ghost*/ 5) {
    				toggle_class(button, "ghost", /*ghost*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { btnColor = "pink" } = $$props;
    	let { shadow = false } = $$props;
    	let { ghost = false } = $$props;
    	const writable_props = ["btnColor", "shadow", "ghost"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("btnColor" in $$props) $$invalidate(0, btnColor = $$props.btnColor);
    		if ("shadow" in $$props) $$invalidate(1, shadow = $$props.shadow);
    		if ("ghost" in $$props) $$invalidate(2, ghost = $$props.ghost);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ btnColor, shadow, ghost });

    	$$self.$inject_state = $$props => {
    		if ("btnColor" in $$props) $$invalidate(0, btnColor = $$props.btnColor);
    		if ("shadow" in $$props) $$invalidate(1, shadow = $$props.shadow);
    		if ("ghost" in $$props) $$invalidate(2, ghost = $$props.ghost);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [btnColor, shadow, ghost, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { btnColor: 0, shadow: 1, ghost: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get btnColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btnColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shadow() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shadow(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ghost() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ghost(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CreatePollForm.svelte generated by Svelte v3.25.1 */
    const file$3 = "src\\components\\CreatePollForm.svelte";

    // (72:8) <Button btnColor="pink">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Poll");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(72:8) <Button btnColor=\\\"pink\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div0;
    	let t3_value = /*errors*/ ctx[1].question + "";
    	let t3;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let t8_value = /*errors*/ ctx[1].optionA + "";
    	let t8;
    	let t9;
    	let div5;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let div4;
    	let t13_value = /*errors*/ ctx[1].optionB + "";
    	let t13;
    	let t14;
    	let div6;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				btnColor: "pink",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Poll Question:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Option A:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "Option B:";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			div4 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			div6 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(label0, "for", "question");
    			attr_dev(label0, "class", "svelte-h7v05p");
    			add_location(label0, file$3, 56, 8, 1784);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "question");
    			attr_dev(input0, "class", "svelte-h7v05p");
    			add_location(input0, file$3, 57, 8, 1838);
    			attr_dev(div0, "class", "error svelte-h7v05p");
    			add_location(div0, file$3, 58, 8, 1910);
    			attr_dev(div1, "class", "form-field svelte-h7v05p");
    			add_location(div1, file$3, 55, 4, 1750);
    			attr_dev(label1, "for", "option-a");
    			attr_dev(label1, "class", "svelte-h7v05p");
    			add_location(label1, file$3, 61, 8, 2004);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "option-a");
    			attr_dev(input1, "class", "svelte-h7v05p");
    			add_location(input1, file$3, 62, 8, 2053);
    			attr_dev(div2, "class", "error svelte-h7v05p");
    			add_location(div2, file$3, 63, 8, 2124);
    			attr_dev(div3, "class", "form-field svelte-h7v05p");
    			add_location(div3, file$3, 60, 4, 1970);
    			attr_dev(label2, "for", "option-b");
    			attr_dev(label2, "class", "svelte-h7v05p");
    			add_location(label2, file$3, 66, 8, 2217);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "option-b");
    			attr_dev(input2, "class", "svelte-h7v05p");
    			add_location(input2, file$3, 67, 8, 2266);
    			attr_dev(div4, "class", "error svelte-h7v05p");
    			add_location(div4, file$3, 68, 8, 2337);
    			attr_dev(div5, "class", "form-field svelte-h7v05p");
    			add_location(div5, file$3, 65, 4, 2183);
    			attr_dev(div6, "class", "submit svelte-h7v05p");
    			add_location(div6, file$3, 70, 4, 2396);
    			attr_dev(form, "class", "svelte-h7v05p");
    			add_location(form, file$3, 54, 0, 1697);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*fields*/ ctx[0].question);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*fields*/ ctx[0].optionA);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(form, t9);
    			append_dev(form, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t11);
    			append_dev(div5, input2);
    			set_input_value(input2, /*fields*/ ctx[0].optionB);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, t13);
    			append_dev(form, t14);
    			append_dev(form, div6);
    			mount_component(button, div6, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*submitHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fields*/ 1 && input0.value !== /*fields*/ ctx[0].question) {
    				set_input_value(input0, /*fields*/ ctx[0].question);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t3_value !== (t3_value = /*errors*/ ctx[1].question + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*fields*/ 1 && input1.value !== /*fields*/ ctx[0].optionA) {
    				set_input_value(input1, /*fields*/ ctx[0].optionA);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t8_value !== (t8_value = /*errors*/ ctx[1].optionA + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*fields*/ 1 && input2.value !== /*fields*/ ctx[0].optionB) {
    				set_input_value(input2, /*fields*/ ctx[0].optionB);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t13_value !== (t13_value = /*errors*/ ctx[1].optionB + "")) set_data_dev(t13, t13_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreatePollForm", slots, []);
    	let dispatch = createEventDispatcher();
    	let fields = { question: "", optionA: "", optionB: "" };
    	let errors = { question: "", optionA: "", optionB: "" };
    	let valid = false;

    	const submitHandler = () => {
    		valid = true;

    		//validate question
    		if (fields.question.trim().length < 5) {
    			valid = false;
    			$$invalidate(1, errors.question = "Question Must be at least 5 characters long", errors);
    		} else {
    			$$invalidate(1, errors.question = "", errors);
    		}

    		//validate optionA
    		if (fields.optionA.trim().length < 1) {
    			valid = false;
    			$$invalidate(1, errors.optionA = "Option cannot be empty", errors);
    		} else {
    			$$invalidate(1, errors.optionA = "", errors);
    		}

    		//validate optionB
    		if (fields.optionB.trim().length < 1) {
    			valid = false;
    			$$invalidate(1, errors.optionB = "Option cannot be empty", errors);
    		} else {
    			$$invalidate(1, errors.optionB = "", errors);
    		}

    		if (valid) {
    			let poll = {
    				...fields,
    				votesA: 0,
    				votesB: 0,
    				id: Math.floor(Math.random() * 10000)
    			};

    			dispatch("add", poll);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CreatePollForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		fields.question = this.value;
    		$$invalidate(0, fields);
    	}

    	function input1_input_handler() {
    		fields.optionA = this.value;
    		$$invalidate(0, fields);
    	}

    	function input2_input_handler() {
    		fields.optionB = this.value;
    		$$invalidate(0, fields);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Button,
    		dispatch,
    		fields,
    		errors,
    		valid,
    		submitHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("errors" in $$props) $$invalidate(1, errors = $$props.errors);
    		if ("valid" in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fields,
    		errors,
    		submitHandler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class CreatePollForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePollForm",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\shared\Card.svelte generated by Svelte v3.25.1 */

    const file$4 = "src\\shared\\Card.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-948d11");
    			add_location(div, file$4, 4, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots("Card", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\PollDetails.svelte generated by Svelte v3.25.1 */

    const file$5 = "src\\components\\PollDetails.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let h3;
    	let t0_value = /*poll*/ ctx[0].question + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let div0;
    	let t6;
    	let span1;
    	let t7_value = /*poll*/ ctx[0].optionA + "";
    	let t7;
    	let t8;
    	let t9_value = /*poll*/ ctx[0].votesA + "";
    	let t9;
    	let t10;
    	let t11;
    	let div3;
    	let div2;
    	let t12;
    	let span2;
    	let t13_value = /*poll*/ ctx[0].optionB + "";
    	let t13;
    	let t14;
    	let t15_value = /*poll*/ ctx[0].votesB + "";
    	let t15;
    	let t16;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text("(total: ");
    			t3 = text(/*totalVotes*/ ctx[1]);
    			t4 = text(")");
    			t5 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t6 = space();
    			span1 = element("span");
    			t7 = text(t7_value);
    			t8 = text(" (");
    			t9 = text(t9_value);
    			t10 = text(")");
    			t11 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t12 = space();
    			span2 = element("span");
    			t13 = text(t13_value);
    			t14 = text(" (");
    			t15 = text(t15_value);
    			t16 = text(")");
    			attr_dev(h3, "class", "svelte-1v29bw9");
    			add_location(h3, file$5, 17, 4, 482);
    			attr_dev(span0, "class", "totalVotes svelte-1v29bw9");
    			add_location(span0, file$5, 18, 4, 512);
    			attr_dev(div0, "class", "percent percent-a");
    			add_location(div0, file$5, 20, 8, 601);
    			add_location(span1, file$5, 21, 8, 648);
    			attr_dev(div1, "class", "option svelte-1v29bw9");
    			add_location(div1, file$5, 19, 4, 571);
    			attr_dev(div2, "class", "percent percent-b");
    			add_location(div2, file$5, 24, 8, 739);
    			add_location(span2, file$5, 25, 8, 786);
    			attr_dev(div3, "class", "option svelte-1v29bw9");
    			add_location(div3, file$5, 23, 4, 709);
    			attr_dev(div4, "class", "poll svelte-1v29bw9");
    			add_location(div4, file$5, 16, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h3);
    			append_dev(h3, t0);
    			append_dev(div4, t1);
    			append_dev(div4, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(span0, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t6);
    			append_dev(div1, span1);
    			append_dev(span1, t7);
    			append_dev(span1, t8);
    			append_dev(span1, t9);
    			append_dev(span1, t10);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t12);
    			append_dev(div3, span2);
    			append_dev(span2, t13);
    			append_dev(span2, t14);
    			append_dev(span2, t15);
    			append_dev(span2, t16);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*poll*/ 1 && t0_value !== (t0_value = /*poll*/ ctx[0].question + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*totalVotes*/ 2) set_data_dev(t3, /*totalVotes*/ ctx[1]);
    			if (dirty & /*poll*/ 1 && t7_value !== (t7_value = /*poll*/ ctx[0].optionA + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*poll*/ 1 && t9_value !== (t9_value = /*poll*/ ctx[0].votesA + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*poll*/ 1 && t13_value !== (t13_value = /*poll*/ ctx[0].optionB + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*poll*/ 1 && t15_value !== (t15_value = /*poll*/ ctx[0].votesB + "")) set_data_dev(t15, t15_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PollDetails", slots, []);
    	let { poll } = $$props;
    	const writable_props = ["poll"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PollDetails> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("poll" in $$props) $$invalidate(0, poll = $$props.poll);
    	};

    	$$self.$capture_state = () => ({ poll, totalVotes });

    	$$self.$inject_state = $$props => {
    		if ("poll" in $$props) $$invalidate(0, poll = $$props.poll);
    		if ("totalVotes" in $$props) $$invalidate(1, totalVotes = $$props.totalVotes);
    	};

    	let totalVotes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*poll*/ 1) {
    			//reactive values
    			 $$invalidate(1, totalVotes = poll.votesA + poll.votesB);
    		}
    	};

    	return [poll, totalVotes];
    }

    class PollDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { poll: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PollDetails",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*poll*/ ctx[0] === undefined && !("poll" in props)) {
    			console.warn("<PollDetails> was created without expected prop 'poll'");
    		}
    	}

    	get poll() {
    		throw new Error("<PollDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set poll(value) {
    		throw new Error("<PollDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\PollList.svelte generated by Svelte v3.25.1 */
    const file$6 = "src\\components\\PollList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (14:8) <Card>
    function create_default_slot$1(ctx) {
    	let polldetails;
    	let t;
    	let current;

    	polldetails = new PollDetails({
    			props: { poll: /*poll*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(polldetails.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(polldetails, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const polldetails_changes = {};
    			if (dirty & /*polls*/ 1) polldetails_changes.poll = /*poll*/ ctx[1];
    			polldetails.$set(polldetails_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(polldetails.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(polldetails.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(polldetails, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(14:8) <Card>",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#each polls as poll(poll.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(card.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope, polls*/ 17) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(13:4) {#each polls as poll(poll.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*polls*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*poll*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "poll-list svelte-1o9gl3i");
    			add_location(div, file$6, 11, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*polls*/ 1) {
    				const each_value = /*polls*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PollList", slots, []);
    	let { polls = [] } = $$props;
    	const writable_props = ["polls"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PollList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("polls" in $$props) $$invalidate(0, polls = $$props.polls);
    	};

    	$$self.$capture_state = () => ({ Card, PollDetails, polls });

    	$$self.$inject_state = $$props => {
    		if ("polls" in $$props) $$invalidate(0, polls = $$props.polls);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [polls];
    }

    class PollList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { polls: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PollList",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get polls() {
    		throw new Error("<PollList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set polls(value) {
    		throw new Error("<PollList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\shared\Tabs.svelte generated by Svelte v3.25.1 */
    const file$7 = "src\\shared\\Tabs.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:8) {#each items as item}
    function create_each_block$2(ctx) {
    	let li;
    	let div;
    	let t0_value = /*item*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-nmdgfk");
    			toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			add_location(div, file$7, 19, 12, 729);
    			attr_dev(li, "class", "svelte-nmdgfk");
    			add_location(li, file$7, 18, 8, 576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(18:8) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-nmdgfk");
    			add_location(ul, file$7, 16, 4, 531);
    			attr_dev(div, "class", "tabs svelte-nmdgfk");
    			add_location(div, file$7, 15, 0, 507);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, items, activeItem*/ 7) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, []);
    	const dispatch = createEventDispatcher();
    	let { items } = $$props;
    	let { activeItem } = $$props;
    	const writable_props = ["items", "activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => dispatch("tabChange", item);

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem, dispatch, click_handler];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !("items" in props)) {
    			console.warn("<Tabs> was created without expected prop 'items'");
    		}

    		if (/*activeItem*/ ctx[1] === undefined && !("activeItem" in props)) {
    			console.warn("<Tabs> was created without expected prop 'activeItem'");
    		}
    	}

    	get items() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\PollsContent.svelte generated by Svelte v3.25.1 */

    const { console: console_1 } = globals;
    const file$8 = "src\\PollsContent.svelte";

    // (74:41) 
    function create_if_block_1(ctx) {
    	let createpollform;
    	let current;
    	createpollform = new CreatePollForm({ $$inline: true });
    	createpollform.$on("add", /*handleAdd*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(createpollform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(createpollform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(createpollform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(createpollform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(createpollform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(74:41) ",
    		ctx
    	});

    	return block;
    }

    // (72:1) {#if activeItem === 'Current Polls'}
    function create_if_block(ctx) {
    	let polllist;
    	let current;

    	polllist = new PollList({
    			props: { polls: /*polls*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(polllist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(polllist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const polllist_changes = {};
    			if (dirty & /*polls*/ 2) polllist_changes.polls = /*polls*/ ctx[1];
    			polllist.$set(polllist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(polllist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(polllist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(polllist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(72:1) {#if activeItem === 'Current Polls'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let tabs;
    	let t4;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	tabs = new Tabs({
    			props: {
    				items: /*items*/ ctx[2],
    				activeItem: /*activeItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	tabs.$on("tabChange", /*changeTab*/ ctx[3]);
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === "Current Polls") return 0;
    		if (/*activeItem*/ ctx[0] === "Add New Poll") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Polls";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget quam velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc convallis egestas purus. Cras non mi sit amet lacus blandit sagittis sit amet sit amet nulla. Quisque varius, quam a pharetra vestibulum, lorem magna commodo metus, a convallis odio justo eu mi.";
    			t3 = space();
    			create_component(tabs.$$.fragment);
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$8, 67, 0, 1643);
    			add_location(p, file$8, 68, 1, 1660);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t4, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*activeItem*/ 1) tabs_changes.activeItem = /*activeItem*/ ctx[0];
    			tabs.$set(tabs_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t4);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PollsContent", slots, []);
    	let items = ["Current Polls", "Add New Poll"];
    	let activeItem = "Current Polls";

    	const changeTab = e => {
    		$$invalidate(0, activeItem = e.detail);
    	};

    	//polls
    	let polls = [
    		{
    			id: 1,
    			question: "What should I order for breakfast?",
    			optionA: "Waffles",
    			optionB: "Pancakes",
    			votesA: 17,
    			votesB: 2
    		},
    		{
    			id: 2,
    			question: "What should I order for lunch?",
    			optionA: "Sushi",
    			optionB: "Tteokbokki",
    			votesA: 10,
    			votesB: 15
    		},
    		{
    			id: 3,
    			question: "What should I order for dinner?",
    			optionA: "Pizza",
    			optionB: "Tacos",
    			votesA: 12,
    			votesB: 12
    		}
    	];

    	const handleAdd = e => {
    		const poll = e.detail;
    		$$invalidate(1, polls = [poll, ...polls]);
    		console.log(polls);
    		$$invalidate(0, activeItem = "Current Polls");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<PollsContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		CreatePollForm,
    		PollList,
    		Tabs,
    		items,
    		activeItem,
    		changeTab,
    		polls,
    		handleAdd
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(2, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ("polls" in $$props) $$invalidate(1, polls = $$props.polls);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, polls, items, changeTab, handleAdd];
    }

    class PollsContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PollsContent",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\GistContent.svelte generated by Svelte v3.25.1 */

    const file$9 = "src\\GistContent.svelte";

    function create_fragment$9(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "GIST Boards";
    			t1 = space();
    			p = element("p");
    			p.textContent = "I'll eventually get around to making the GIST boards.";
    			add_location(h1, file$9, 0, 0, 0);
    			add_location(p, file$9, 1, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GistContent", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GistContent> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class GistContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GistContent",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.25.1 */
    const file$a = "src\\App.svelte";

    // (27:41) 
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "This page intentionally left blank";
    			set_style(p, "text-align", "center");
    			add_location(p, file$a, 27, 2, 650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(27:41) ",
    		ctx
    	});

    	return block;
    }

    // (25:34) 
    function create_if_block_1$1(ctx) {
    	let gistcontent;
    	let current;
    	gistcontent = new GistContent({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gistcontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gistcontent, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gistcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gistcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gistcontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(25:34) ",
    		ctx
    	});

    	return block;
    }

    // (23:1) {#if currentPage === 'Polls'}
    function create_if_block$1(ctx) {
    	let pollscontent;
    	let current;
    	pollscontent = new PollsContent({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pollscontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pollscontent, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pollscontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pollscontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pollscontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(23:1) {#if currentPage === 'Polls'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let header;
    	let t0;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				mainNav: /*mainNav*/ ctx[1],
    				currentPage: /*currentPage*/ ctx[0]
    			},
    			$$inline: true
    		});

    	header.$on("activatePage", /*activePage*/ ctx[2]);
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentPage*/ ctx[0] === "Polls") return 0;
    		if (/*currentPage*/ ctx[0] === "GIST") return 1;
    		if (/*currentPage*/ ctx[0] === "Placeholder") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1fvi0rd");
    			add_location(main, file$a, 21, 0, 496);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*currentPage*/ 1) header_changes.currentPage = /*currentPage*/ ctx[0];
    			header.$set(header_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let mainNav = ["Polls", "GIST", "Placeholder"];
    	let currentPage = "Polls";

    	const activePage = e => {
    		$$invalidate(0, currentPage = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		PollsContent,
    		GistContent,
    		mainNav,
    		currentPage,
    		activePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("mainNav" in $$props) $$invalidate(1, mainNav = $$props.mainNav);
    		if ("currentPage" in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentPage, mainNav, activePage];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
