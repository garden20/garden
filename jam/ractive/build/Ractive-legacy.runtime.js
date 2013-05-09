(function ( doc ) {

	'use strict';

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( !doc.createElementNS ) {
		doc.createElementNS = function ( ns, type ) {
			if ( ns !== null && ns !== 'http://www.w3.org/1999/xhtml' ) {
				throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml';
			}

			return doc.createElement( type );
		};
	}

	if ( !Element.prototype.contains ) {
		Element.prototype.contains = function ( el ) {
			while ( el.parentNode ) {
				if ( el.parentNode === this ) {
					return true;
				}

				el = el.parentNode;
			}

			return false;
		};
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

	// https://gist.github.com/jonathantneal/3748027
	if ( !window.addEventListener ) {
		(function ( WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry ) {
			WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
				var target = this;

				registry.unshift([target, type, listener, function (event) {
					event.currentTarget = target;
					event.preventDefault = function () { event.returnValue = false; };
					event.stopPropagation = function () { event.cancelBubble = true; };
					event.target = event.srcElement || target;

					listener.call(target, event);
				}]);

				this.attachEvent("on" + type, registry[0][3]);
			};

			WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
				var index, register;

				for ( index = 0, register; register = registry[index]; ++index ) {
					if ( register[0] === this && register[1] === type && register[2] === listener ) {
						return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
					}
				}
			};

			WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
				return this.fireEvent("on" + eventObject.type, eventObject);
			};
		}( Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", [] ));
	}


	// Array extras
	if ( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = function ( needle, i ) {
			var len;

			if ( i === undefined ) {
				i = 0;
			}

			if ( i < 0 ) {
				i+= this.length;
			}

			if ( i < 0 ) {
				i = 0;
			}

			for ( len = this.length; i<len; i++ ) {
				if ( this.hasOwnProperty( i ) && this[i] === needle ) {
					return i;
				}
			}

			return -1;
		};
	}

	if ( !Array.prototype.forEach ) {
		Array.prototype.forEach = function ( callback, context ) {
			var i, len;

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					callback.call( context, this[i], i, this );
				}
			}
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( mapper, context ) {
			var i, len, mapped = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					mapped[i] = mapper.call( context, this[i], i, this );
				}
			}

			return mapped;
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( filter, context ) {
			var i, len, filtered = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) && filter.call( context, this[i], i, this ) ) {
					filtered[ filtered.length ] = this[i];
				}
			}

			return filtered;
		};
	}

}( document ));

/*! Ractive - v0.2.2 - 2013-05-07
* Faster, easier, better interactive web development

* http://rich-harris.github.com/Ractive/
* Copyright (c) 2013 Rich Harris; Licensed MIT */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */


(function ( global ) {

'use strict';

var Ractive, _internal;

(function () {

	'use strict';

	var getEl;

	Ractive = function ( options ) {

		var defaults, key, partial;

		// Options
		// -------

		if ( options ) {
			for ( key in options ) {
				if ( options.hasOwnProperty( key ) ) {
					this[ key ] = options[ key ];
				}
			}
		}

		defaults = {
			preserveWhitespace: false,
			append: false,
			twoway: true,
			modifiers: {},
			modifyArrays: true,
			data: {}
		};

		for ( key in defaults ) {
			if ( defaults.hasOwnProperty( key ) && this[ key ] === undefined ) {
				this[ key ] = defaults[ key ];
			}
		}

		// 'formatters' is deprecated, but support it for the time being
		if ( options && options.formatters ) {
			this.modifiers = options.formatters;
			if ( typeof console !== 'undefined' ) {
				console.warn( 'The \'formatters\' option is deprecated as of v0.2.2 and will be removed in a future version - use \'modifiers\' instead (same thing, more accurate name)' );
			}
		}


		// Initialization
		// --------------

		if ( this.el !== undefined ) {
			this.el = getEl( this.el ); // turn ID string into DOM element
		}

		// Set up event bus
		this._subs = {};

		// Set up cache
		this._cache = {};
		this._cacheMap = {};

		// Set up observers
		this._observers = {};
		this._pendingResolution = [];

		// Create an array for deferred attributes
		this._defAttrs = [];

		// If we were given uncompiled partials, compile them
		if ( this.partials ) {
			for ( key in this.partials ) {
				if ( this.partials.hasOwnProperty( key ) ) {
					partial = this.partials[ key ];

					if ( typeof partial === 'string' ) {
						if ( !Ractive.compile ) {
							throw new Error( 'Missing Ractive.compile - cannot compile partial "' + key + '". Either precompile or use the version that includes the compiler' );
						}

						partial = Ractive.compile( partial, this ); // all compiler options are present on `this`, so just passing `this`
					}

					// If the partial was an array with a single string member, that means
					// we can use innerHTML - we just need to unpack it
					if ( partial.length === 1 && typeof partial[0] === 'string' ) {
						partial = partial[0];
					}
					this.partials[ key ] = partial;
				}
			}
		}

		// Compile template, if it hasn't been compiled already
		if ( typeof this.template === 'string' ) {
			if ( !Ractive.compile ) {
				throw new Error( 'Missing Ractive.compile - cannot compile template. Either precompile or use the version that includes the compiler' );
			}

			this.template = Ractive.compile( this.template, this );
		}

		// If the template was an array with a single string member, that means
		// we can use innerHTML - we just need to unpack it
		if ( this.template && ( this.template.length === 1 ) && ( typeof this.template[0] === 'string' ) ) {
			this.template = this.template[0];
		}

		// If passed an element, render immediately
		if ( this.el ) {
			this.render({ el: this.el, append: this.append });
		}
	};



	// Prototype methods
	// =================
	Ractive.prototype = {

		// Render instance to element specified here or at initialization
		render: function ( options ) {
			var el = ( options.el ? getEl( options.el ) : this.el );

			if ( !el ) {
				throw new Error( 'You must specify a DOM element to render to' );
			}

			// Clear the element, unless `append` is `true`
			if ( !options.append ) {
				el.innerHTML = '';
			}

			if ( options.callback ) {
				this.callback = options.callback;
			}

			// Render our *root fragment*
			this.rendered = new _internal.DomFragment({
				descriptor: this.template,
				root: this,
				parentNode: el
			});

			el.appendChild( this.rendered.docFrag );
		},

		// Teardown. This goes through the root fragment and all its children, removing observers
		// and generally cleaning up after itself
		teardown: function () {
			var keypath;

			this.rendered.teardown();

			// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
			// Once with keypaths that have dependents...
			for ( keypath in this._cacheMap ) {
				if ( this._cacheMap.hasOwnProperty( keypath ) ) {
					this._clearCache( keypath );
				}
			}

			// Then a second time to mop up the rest
			for ( keypath in this._cache ) {
				if ( this._cache.hasOwnProperty( keypath ) ) {
					this._clearCache( keypath );
				}
			}
		},

		set: function ( keypath, value ) {
			if ( _internal.isObject( keypath ) ) {
				this._setMultiple( keypath );
			} else {
				this._setSingle( keypath, value );
			}

			// Attributes don't reflect changes automatically if there is a possibility
			// that they will need to change again before the .set() cycle is complete
			// - they defer their updates until all values have been set
			while ( this._defAttrs.length ) {
				// Update the attribute, then deflag it
				this._defAttrs.pop().update().deferred = false;
			}
		},

		_setSingle: function ( keypath, value ) {
			var keys, key, obj, normalised, i, unresolved;

			if ( _internal.isArray( keypath ) ) {
				keys = keypath.slice();
			} else {
				keys = _internal.splitKeypath( keypath );
			}

			normalised = keys.join( '.' );

			// Clear cache
			this._clearCache( normalised );

			// update data
			obj = this.data;
			while ( keys.length > 1 ) {
				key = keys.shift();

				// If this branch doesn't exist yet, create a new one - if the next
				// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
				// than an object
				if ( !obj[ key ] ) {
					obj[ key ] = ( /^\s*[0-9]+\s*$/.test( keys[0] ) ? [] : {} );
				}

				obj = obj[ key ];
			}

			key = keys[0];

			obj[ key ] = value;

			// Fire set event
			if ( !this.setting ) {
				this.setting = true; // short-circuit any potential infinite loops
				this.fire( 'set', normalised, value );
				this.fire( 'set:' + normalised, value );
				this.setting = false;
			}

			// Trigger updates of mustaches that observe `keypaths` or its descendants
			this._notifyObservers( normalised );

			// See if we can resolve any of the unresolved keypaths (if such there be)
			i = this._pendingResolution.length;
			while ( i-- ) { // Work backwards, so we don't go in circles!
				unresolved = this._pendingResolution.splice( i, 1 )[0];

				// If we can't resolve the reference, add to the back of
				// the queue (this is why we're working backwards)
				if ( !this._resolveRef( unresolved ) ) {
					this._pendingResolution[ this._pendingResolution.length ] = unresolved;
				}
			}
		},

		_setMultiple: function ( map ) {
			var keypath;

			for ( keypath in map ) {
				if ( map.hasOwnProperty( keypath ) ) {
					this._setSingle( keypath, map[ keypath ] );
				}
			}
		},

		_clearCache: function ( keypath ) {
			var value, children = this._cacheMap[ keypath ];

			// is this a modified array, which shouldn't fire set events on this keypath anymore?
			if ( this.modifyArrays ) {
				value = this._cache[ keypath ];
				if ( _internal.isArray( value ) && !value._ractive.setting ) {
					_internal.removeKeypath( value, keypath, this );
				}
			}
			

			delete this._cache[ keypath ];

			if ( !children ) {
				return;
			}

			while ( children.length ) {
				this._clearCache( children.pop() );
			}
		},

		get: function ( keypath ) {
			var keys, normalised, key, match, parentKeypath, parentValue, value, modifiers;

			if ( _internal.isArray( keypath ) ) {
				keys = keypath.slice(); // clone
				normalised = keys.join( '.' );
			}

			else {
				// cache hit? great
				if ( this._cache.hasOwnProperty( keypath ) ) {
					return this._cache[ keypath ];
				}

				keys = _internal.splitKeypath( keypath );
				normalised = keys.join( '.' );
			}

			// we may have a cache hit now that it's been normalised
			if ( this._cache.hasOwnProperty( normalised ) ) {
				return this._cache[ normalised ];
			}

			// otherwise it looks like we need to do some work
			key = keys.pop();
			parentValue = ( keys.length ? this.get( keys ) : this.data );

			// is this a set of modifiers?
			if ( match = /^⭆(.+)⭅$/.exec( key ) ) {
				modifiers = _internal.getModifiersFromString( match[1] );
				value = this._modify( parentValue, modifiers );
			}

			else {
				if ( typeof parentValue !== 'object' || !parentValue.hasOwnProperty( key ) ) {
					return;
				}

				value = parentValue[ key ];
			}

			// update cacheMap
			if ( keys.length ) {
				parentKeypath = keys.join( '.' );

				if ( !this._cacheMap[ parentKeypath ] ) {
					this._cacheMap[ parentKeypath ] = [];
				}
				this._cacheMap[ parentKeypath ].push( normalised );
			}

			// Allow functions as values
			if ( typeof value === 'function' ) {
				value = value();
			}

			// Is this an array that needs to be wrapped?
			else if ( this.modifyArrays ) {
				if ( _internal.isArray( value ) && ( !value.ractive || !value._ractive.setting ) ) {
					_internal.addKeypath( value, normalised, this );
				}
			}

			// Update cache
			this._cache[ normalised ] = value;
			
			return value;
		},

		update: function ( keypath ) {
			this._clearCache( keypath );
			this._notifyObservers( keypath );

			this.fire( 'update:' + keypath );
			this.fire( 'update', keypath );

			return this;
		},

		link: function ( keypath ) {
			var self = this;

			return function ( value ) {
				self.set( keypath, value );
			};
		},

		_registerMustache: function ( mustache ) {
			var resolved, value, index;

			if ( mustache.parentFragment && ( mustache.parentFragment.indexRefs.hasOwnProperty( mustache.descriptor.r ) ) ) {
				// This isn't a real keypath, it's an index reference
				index = mustache.parentFragment.indexRefs[ mustache.descriptor.r ];

				value = ( mustache.descriptor.m ? this._modify( index, mustache.descriptor.m ) : index );
				mustache.update( value );

				return; // This value will never change, and doesn't have a keypath
			}

			// See if we can resolve a keypath from this mustache's reference (e.g.
			// does 'bar' in {{#foo}}{{bar}}{{/foo}} mean 'bar' or 'foo.bar'?)
			resolved = this._resolveRef( mustache );

			if ( !resolved ) {
				// We may still need to do an update, event with unresolved
				// references, if the mustache has modifiers that (for example)
				// provide a fallback value from undefined
				if ( mustache.descriptor.m ) {
					mustache.update( this._modify( undefined, mustache.descriptor.m ) );
				}

				this._pendingResolution[ this._pendingResolution.length ] = mustache;
			}
		},

		// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
		// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
		_resolveRef: function ( mustache ) {

			var ref, contextStack, keys, lastKey, innerMostContext, contextKeys, parentValue, keypath;

			ref = mustache.descriptor.r;
			contextStack = mustache.contextStack;

			// Implicit iterators - i.e. {{.}} - are a special case
			if ( ref === '.' ) {
				keypath = contextStack[ contextStack.length - 1 ];
			}

			else {
				keys = _internal.splitKeypath( ref );
				lastKey = keys.pop();

				// Clone the context stack, so we don't mutate the original
				contextStack = contextStack.concat();

				// Take each context from the stack, working backwards from the innermost context
				while ( contextStack.length ) {

					innerMostContext = contextStack.pop();
					contextKeys = _internal.splitKeypath( innerMostContext );

					parentValue = this.get( contextKeys.concat( keys ) );

					if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
						keypath = innerMostContext + '.' + ref;
						break;
					}
				}

				if ( !keypath && this.get( ref ) !== undefined ) {
					keypath = ref;
				}
			}

			// If we have any modifiers, we need to append them to the keypath
			if ( keypath ) {
				mustache.keypath = ( mustache.descriptor.m ? keypath + '.' + _internal.stringifyModifiers( mustache.descriptor.m ) : keypath );
				mustache.keys = _internal.splitKeypath( mustache.keypath );

				mustache.observerRefs = this._observe( mustache );
				mustache.update( this.get( mustache.keypath ) );

				return true; // indicate success
			}

			return false; // failure
		},

		_cancelKeypathResolution: function ( mustache ) {
			var index = this._pendingResolution.indexOf( mustache );

			if ( index !== -1 ) {
				this._pendingResolution.splice( index, 1 );
			}
		},

		// Internal method to modify a value, using modifiers passed in at initialization
		_modify: function ( value, modifiers ) {
			var i, numModifiers, modifier, name, args, fn;

			// If there are no modifiers, groovy - just return the value unchanged
			if ( !modifiers ) {
				return value;
			}

			// Otherwise go through each in turn, applying sequentially
			numModifiers = modifiers.length;
			for ( i=0; i<numModifiers; i+=1 ) {
				modifier = modifiers[i];
				name = modifier.d;
				args = modifier.g || [];

				// If a modifier was passed in, use it, otherwise see if there's a default
				// one with this name
				fn = this.modifiers[ name ] || Ractive.modifiers[ name ];

				if ( fn ) {
					value = fn.apply( this, [ value ].concat( args ) );
				}
			}

			return value;
		},

		_notifyObservers: function ( keypath ) {
			var self = this, observersGroupedByPriority = this._observers[ keypath ] || [], i, j, priorityGroup, observer;

			for ( i=0; i<observersGroupedByPriority.length; i+=1 ) {
				priorityGroup = observersGroupedByPriority[i];

				if ( priorityGroup ) {
					for ( j=0; j<priorityGroup.length; j+=1 ) {
						observer = priorityGroup[j];
						observer.update( self.get( observer.keys ) );
					}
				}
			}
		},

		_observe: function ( mustache ) {

			var self = this, observerRefs = [], observe, keys, priority = mustache.descriptor.p || 0;

			observe = function ( keypath ) {
				var observers;

				observers = self._observers[ keypath ] = self._observers[ keypath ] || [];
				observers = observers[ priority ] = observers[ priority ] || [];

				observers[ observers.length ] = mustache;
				observerRefs[ observerRefs.length ] = {
					keypath: keypath,
					priority: priority,
					mustache: mustache
				};
			};

			keys = _internal.splitKeypath( mustache.keypath );
			while ( keys.length > 1 ) {
				observe( keys.join( '.' ) );

				// remove the last item in the keypath, so that `data.set( 'parent', { child: 'newValue' } )`
				// affects mustaches dependent on `parent.child`
				keys.pop();
			}

			observe( keys[0] );

			return observerRefs;
		},

		_unobserve: function ( observerRef ) {
			var priorityGroups, observers, index, i, len;

			priorityGroups = this._observers[ observerRef.keypath ];
			if ( !priorityGroups ) {
				// nothing to unobserve
				return;
			}

			observers = priorityGroups[ observerRef.priority ];
			if ( !observers ) {
				// nothing to unobserve
				return;
			}

			if ( observers.indexOf ) {
				index = observers.indexOf( observerRef.observer );
			} else {
				// fuck you IE
				for ( i=0, len=observers.length; i<len; i+=1 ) {
					if ( observers[i] === observerRef.mustache ) {
						index = i;
						break;
					}
				}
			}


			if ( index === -1 ) {
				// nothing to unobserve
				return;
			}

			// remove the observer from the list...
			observers.splice( index, 1 );

			// ...then tidy up if necessary
			if ( observers.length === 0 ) {
				delete priorityGroups[ observerRef.priority ];
			}

			if ( priorityGroups.length === 0 ) {
				delete this._observers[ observerRef.keypath ];
			}
		},

		_unobserveAll: function ( observerRefs ) {
			while ( observerRefs.length ) {
				this._unobserve( observerRefs.shift() );
			}
		}
	};


	// helper functions
	getEl = function ( input ) {
		var output, doc;

		if ( typeof window === 'undefined' ) {
			return;
		}

		doc = window.document;

		if ( !input ) {
			throw new Error( 'No container element specified' );
		}

		// We already have a DOM node - no work to do
		if ( input.tagName ) {
			return input;
		}

		// Get node from string
		if ( typeof input === 'string' ) {
			// try ID first
			output = doc.getElementById( input );

			// then as selector, if possible
			if ( !output && doc.querySelector ) {
				output = doc.querySelector( input );
			}

			// did it work?
			if ( output.tagName ) {
				return output;
			}
		}

		// If we've been given a collection (jQuery, Zepto etc), extract the first item
		if ( input[0] && input[0].tagName ) {
			return input[0];
		}

		throw new Error( 'Could not find container element' );
	};

	return Ractive;

}());
(function () {

	'use strict';

	var modifiersCache = {}, keypathCache = {};

	_internal = {
		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},

		// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		isNumeric: function ( n ) {
			return !isNaN( parseFloat( n ) ) && isFinite( n );
		},

		splitKeypath: function ( keypath ) {
			var hasModifiers, modifiers, i, index, startIndex, keys, remaining, part;

			// We should only have to do all the heavy regex stuff once... caching FTW
			if ( keypathCache[ keypath ] ) {
				return keypathCache[ keypath ].concat();
			}

			// If this string contains no escaped dots or modifiers,
			// we can just split on dots, after converting from array notation
			hasModifiers = /⭆.+⭅/.test( keypath );
			if ( !( /\\\./.test( keypath ) ) && !hasModifiers ) {
				keypathCache[ keypath ] = keypath.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ).split( '.' );
				return keypathCache[ keypath ].concat();
			}

			keys = [];
			remaining = keypath;
			
			// first, blank modifiers in case they contain dots, but store them
			// so we can reinstate them later
			if ( hasModifiers ) {
				modifiers = [];
				remaining = remaining.replace( /⭆(.+)⭅/g, function ( match, $1 ) {
					modifiers[ modifiers.length ] = $1;
					return '⭆x⭅';
				});
			}
			

			startIndex = 0;

			// Split into keys
			while ( remaining.length ) {
				// Find next dot
				index = remaining.indexOf( '.', startIndex );

				// Final part?
				if ( index === -1 ) {
					part = remaining;
					remaining = '';
				}

				else {
					// If this dot is preceded by a backslash, which isn't
					// itself preceded by a backslash, we consider it escaped
					if ( remaining.charAt( index - 1) === '\\' && remaining.charAt( index - 2 ) !== '\\' ) {
						// we don't want to keep this part, we want to keep looking
						// for the separator
						startIndex = index + 1;
						continue;
					}

					// Otherwise, we have our next part
					part = remaining.substr( 0, index );
					startIndex = 0;
				}

				if ( /\[/.test( part ) ) {
					keys = keys.concat( part.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ).split( '.' ) );
				} else {
					keys[ keys.length ] = part;
				}
				
				remaining = remaining.substring( index + 1 );
			}

			
			// Then, reinstate modifiers
			if ( hasModifiers ) {
				i = keys.length;
				while ( i-- ) {
					if ( keys[i] === '⭆x⭅' ) {
						keys[i] = '⭆' + modifiers.pop() + '⭅';
					}
				}
			}

			keypathCache[ keypath ] = keys;
			return keys.concat();
		},

		getModifiersFromString: function ( str ) {
			var modifiers, raw;

			if ( modifiersCache[ str ] ) {
				return modifiersCache[ str ];
			}

			raw = str.split( '⤋' );

			modifiers = raw.map( function ( str ) {
				var index;

				index = str.indexOf( '[' );

				if ( index === -1 ) {
					return {
						d: str,
						g: []
					};
				}

				return {
					d: str.substr( 0, index ),
					g: JSON.parse( str.substring( index ) )
				};
			});

			modifiersCache[ str ] = modifiers;
			return modifiers;
		},

		stringifyModifiers: function ( modifiers ) {
			var stringified = modifiers.map( function ( modifier ) {
				if ( modifier.g && modifier.g.length ) {
					return modifier.d + JSON.stringify( modifier.g );
				}

				return modifier.d;
			});

			return '⭆' + stringified.join( '⤋' ) + '⭅';
		},

		eventDefns: {}
	};

}());
_internal.types = {
	TEXT:             1,
	INTERPOLATOR:     2,
	TRIPLE:           3,
	SECTION:          4,
	INVERTED:         5,
	CLOSING:          6,
	ELEMENT:          7,
	PARTIAL:          8,
	COMMENT:          9,
	DELIMCHANGE:      10,
	MUSTACHE:         11,
	TAG:              12,
	ATTR_VALUE_TOKEN: 13
};
(function ( _internal ) {

	'use strict';

	_internal.Mustache = function ( options ) {

		this.root           = options.root;
		this.descriptor          = options.descriptor;
		this.parent         = options.parent;
		this.parentFragment = options.parentFragment;
		this.contextStack   = options.contextStack || [];
		this.index          = options.index || 0;

		// DOM only
		if ( options.parentNode || options.anchor ) {
			this.parentNode = options.parentNode;
			this.anchor = options.anchor;
		}

		this.type = options.descriptor.t;

		this.root._registerMustache( this );

		// if we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.descriptor.n ) { // test both section-hood and inverticity in one go
			this.update( this.descriptor.m ? this.root._modify( false, this.descriptor.m ) : false );
		}

	};


	_internal.Fragment = function ( options ) {

		var numItems, i, itemOptions, parentRefs, ref;

		this.parent = options.parent;
		this.index = options.index;
		this.items = [];

		this.indexRefs = {};
		if ( this.parent && this.parent.parentFragment ) {
			parentRefs = this.parent.parentFragment.indexRefs;
			for ( ref in parentRefs ) {
				if ( parentRefs.hasOwnProperty( ref ) ) {
					this.indexRefs[ ref ] = parentRefs[ ref ];
				}
			}
		}

		if ( options.indexRef ) {
			this.indexRefs[ options.indexRef ] = options.index;
		}

		itemOptions = {
			root: options.root,
			parentFragment: this,
			parent: this,
			parentNode:     options.parentNode,
			contextStack: options.contextStack
		};

		numItems = ( options.descriptor ? options.descriptor.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.descriptor = options.descriptor[i];
			itemOptions.index = i;
			// this.items[ this.items.length ] = createView( itemOptions );

			this.items[ this.items.length ] = this.createItem( itemOptions );
		}

	};


	_internal.sectionUpdate = function ( value ) {
		var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

		fragmentOptions = {
			descriptor: this.descriptor.f,
			root: this.root,
			parentNode: this.parentNode,
			parent: this
		};

		// TODO if DOM type, need to know anchor
		if ( this.parentNode ) {
			fragmentOptions.anchor = this.parentFragment.findNextNode( this );
		}

		valueIsArray = _internal.isArray( value );

		// treat empty arrays as false values
		if ( valueIsArray && value.length === 0 ) {
			emptyArray = true;
		}



		// if section is inverted, only check for truthiness/falsiness
		if ( this.descriptor.n ) {
			if ( value && !emptyArray ) {
				if ( this.length ) {
					this.unrender();
					this.length = 0;
				}
			}

			else {
				if ( !this.length ) {
					// no change to context stack in this situation
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.fragments[0] = this.createFragment( fragmentOptions );
					this.length = 1;
					return;
				}
			}

			return;
		}


		// otherwise we need to work out what sort of section we're dealing with

		// if value is an array, iterate through
		if ( valueIsArray ) {

			// if the array is shorter than it was previously, remove items
			if ( value.length < this.length ) {
				itemsToRemove = this.fragments.splice( value.length, this.length - value.length );

				while ( itemsToRemove.length ) {
					itemsToRemove.pop().teardown();
				}
			}

			// otherwise...
			else {

				if ( value.length > this.length ) {
					// add any new ones
					for ( i=this.length; i<value.length; i+=1 ) {
						// append list item to context stack
						fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
						fragmentOptions.index = i;

						if ( this.descriptor.i ) {
							fragmentOptions.indexRef = this.descriptor.i;
						}

						this.fragments[i] = this.createFragment( fragmentOptions );
					}
				}
			}

			this.length = value.length;
		}


		// if value is a hash...
		else if ( _internal.isObject( value ) ) {
			// ...then if it isn't rendered, render it, adding this.keypath to the context stack
			// (if it is already rendered, then any children dependent on the context stack
			// will update themselves without any prompting)
			if ( !this.length ) {
				// append this section to the context stack
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
				fragmentOptions.index = 0;

				this.fragments[0] = this.createFragment( fragmentOptions );
				this.length = 1;
			}
		}


		// otherwise render if value is truthy, unrender if falsy
		else {

			if ( value && !emptyArray ) {
				if ( !this.length ) {
					// no change to context stack
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.fragments[0] = this.createFragment( fragmentOptions );
					this.length = 1;
				}
			}

			else {
				if ( this.length ) {
					this.unrender();
					this.length = 0;
				}
			}
		}
	};


}( _internal ));
(function ( proto ) {

	'use strict';

	proto.on = function ( eventName, callback ) {
		var self = this, listeners, n;

		// allow mutliple listeners to be bound in one go
		if ( typeof eventName === 'object' ) {
			listeners = [];

			for ( n in eventName ) {
				if ( eventName.hasOwnProperty( n ) ) {
					listeners[ listeners.length ] = this.on( n, eventName[ n ] );
				}
			}

			return {
				cancel: function () {
					while ( listeners.length ) {
						listeners.pop().cancel();
					}
				}
			};
		}

		if ( !this._subs[ eventName ] ) {
			this._subs[ eventName ] = [ callback ];
		} else {
			this._subs[ eventName ].push( callback );
		}

		return {
			cancel: function () {
				self.off( eventName, callback );
			}
		};
	};

	proto.off = function ( eventName, callback ) {
		var subscribers, index;

		// if no callback specified, remove all callbacks
		if ( !callback ) {
			// if no event name specified, remove all callbacks for all events
			if ( !eventName ) {
				this._subs = {};
			} else {
				this._subs[ eventName ] = [];
			}
		}

		subscribers = this._subs[ eventName ];

		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

	proto.fire = function ( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];

		if ( !subscribers ) {
			return;
		}

		args = Array.prototype.slice.call( arguments, 1 );

		for ( i=0, len=subscribers.length; i<len; i+=1 ) {
			subscribers[i].apply( this, args );
		}
	};

}( Ractive.prototype ));
(function ( Ractive, _internal ) {

	'use strict';

	Ractive.defineEvent = function ( eventName, definition ) {
		_internal.eventDefns[ eventName ] = definition;
	};

	Ractive.defineEvent( 'tap', function ( el, fire ) {
		var mousedown, touchstart, distanceThreshold, timeThreshold;

		distanceThreshold = 5; // maximum pixels pointer can move before cancel
		timeThreshold = 400;   // maximum milliseconds between down and up before cancel

		mousedown = function ( event ) {
			var x, y, up, move, cancel;

			x = event.clientX;
			y = event.clientY;

			up = function ( event ) {
				fire( event );
				cancel();
			};

			move = function ( event ) {
				if ( ( Math.abs( event.clientX - x ) >= distanceThreshold ) || ( Math.abs( event.clientY - y ) >= distanceThreshold ) ) {
					cancel();
				}
			};

			cancel = function () {
				window.removeEventListener( 'mousemove', move );
				window.removeEventListener( 'mouseup', up );
			};

			window.addEventListener( 'mousemove', move );
			window.addEventListener( 'mouseup', up );

			setTimeout( cancel, timeThreshold );
		};

		el.addEventListener( 'mousedown', mousedown );


		touchstart = function ( event ) {
			var x, y, touch, finger, move, up, cancel;

			if ( event.touches.length !== 1 ) {
				return;
			}

			touch = event.touches[0];
			finger = touch.identifier;

			up = function ( event ) {
				if ( event.changedTouches.length !== 1 || event.touches[0].identifier !== finger ) {
					cancel();
				} else {
					fire( event );
				}
			};

			move = function ( event ) {
				var touch;

				if ( event.touches.length !== 1 || event.touches[0].identifier !== finger ) {
					cancel();
				}

				touch = event.touches[0];
				if ( ( Math.abs( touch.clientX - x ) >= distanceThreshold ) || ( Math.abs( touch.clientY - y ) >= distanceThreshold ) ) {
					cancel();
				}
			};

			cancel = function ( event ) {
				window.removeEventListener( 'touchmove', move );
				window.removeEventListener( 'touchend', up );
				window.removeEventListener( 'touchcancel', cancel );
			};

			window.addEventListener( 'touchmove', move );
			window.addEventListener( 'touchend', up );
			window.addEventListener( 'touchcancel', cancel );

			setTimeout( cancel, timeThreshold );
		};


		return {
			teardown: function () {
				el.removeEventListener( 'mousedown', mousedown );
				el.removeEventListener( 'touchstart', touchstart );
			}
		};
	});

}( Ractive, _internal ));
(function ( _internal ) {

	'use strict';

	var types, insertHtml, doc, propertyNames,
		Text, Element, Partial, Attribute, Interpolator, Triple, Section;

	types = _internal.types;

	// the property name equivalents for element attributes, where they differ
	// from the lowercased attribute name
	propertyNames = {
		'accept-charset': 'acceptCharset',
		accesskey: 'accessKey',
		bgcolor: 'bgColor',
		'class': 'className',
		codebase: 'codeBase',
		colspan: 'colSpan',
		contenteditable: 'contentEditable',
		datetime: 'dateTime',
		dirname: 'dirName',
		'for': 'htmlFor',
		'http-equiv': 'httpEquiv',
		ismap: 'isMap',
		maxlength: 'maxLength',
		novalidate: 'noValidate',
		pubdate: 'pubDate',
		readonly: 'readOnly',
		rowspan: 'rowSpan',
		tabindex: 'tabIndex',
		usemap: 'useMap'
	};

	doc = ( typeof window !== 'undefined' ? window.document : null );

	insertHtml = function ( html, docFrag ) {
		var div, nodes = [];

		div = doc.createElement( 'div' );
		div.innerHTML = html;

		while ( div.firstChild ) {
			nodes[ nodes.length ] = div.firstChild;
			docFrag.appendChild( div.firstChild );
		}

		return nodes;
	};

	_internal.DomFragment = function ( options ) {
		this.docFrag = doc.createDocumentFragment();

		// if we have an HTML string, our job is easy.
		if ( typeof options.descriptor === 'string' ) {
			this.nodes = insertHtml( options.descriptor, this.docFrag );
			return; // prevent the rest of the init sequence
		}

		// otherwise we need to make a proper fragment
		_internal.Fragment.call( this, options );
	};

	_internal.DomFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options, this.docFrag );
			}

			switch ( options.descriptor.t ) {
				case types.INTERPOLATOR: return new Interpolator( options, this.docFrag );
				case types.SECTION: return new Section( options, this.docFrag );
				case types.TRIPLE: return new Triple( options, this.docFrag );

				case types.ELEMENT: return new Element( options, this.docFrag );
				case types.PARTIAL: return new Partial( options, this.docFrag );

				default: throw 'WTF? not sure what happened here...';
			}
		},

		teardown: function () {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				return;
			}

			// otherwise we need to do a proper teardown
			while ( this.items.length ) {
				this.items.pop().teardown();
			}
		},

		firstNode: function () {
			if ( this.items[0] ) {
				return this.items[0].firstNode();
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			}

			return null;
		}
	};


	// Partials
	Partial = function ( options, docFrag ) {
		this.fragment = new _internal.DomFragment({
			descriptor:        options.root.partials[ options.descriptor.r ] || [],
			root:         options.root,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			parent:        this
		});

		docFrag.appendChild( this.fragment.docFrag );
	};

	Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	Text = function ( options, docFrag ) {
		this.node = doc.createTextNode( options.descriptor );
		this.root = options.root;
		this.parentNode = options.parentNode;

		docFrag.appendChild( this.node );
	};

	Text.prototype = {
		teardown: function () {
			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options, docFrag ) {

		var descriptor,
			namespace,
			eventName,
			attr,
			attrName,
			attrValue,
			bindable,
			twowayNameAttr;

		// stuff we'll need later
		descriptor = this.descriptor = options.descriptor;
		this.root = options.root;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		this.eventListeners = [];
		this.customEventListeners = [];

		// get namespace
		if ( descriptor.a && descriptor.a.xmlns ) {
			namespace = descriptor.a.xmlns;

			// check it's a string!
			if ( typeof namespace !== 'string' ) {
				throw new Error( 'Namespace attribute cannot contain mustaches' );
			}
		} else {
			namespace = this.parentNode.namespaceURI;
		}
		

		// create the DOM node
		this.node = doc.createElementNS( namespace, descriptor.e );


		

		// append children, if there are any
		if ( descriptor.f ) {
			if ( typeof descriptor.f === 'string' && this.node.namespaceURI === _internal.namespaces.html ) {
				// great! we can use innerHTML
				this.node.innerHTML = descriptor.f;
			}

			else {
				this.children = new _internal.DomFragment({
					descriptor:   descriptor.f,
					root:         options.root,
					parentNode:   this.node,
					contextStack: options.contextStack,
					parent:       this
				});

				this.node.appendChild( this.children.docFrag );
			}
		}


		// create event proxies
		if ( descriptor.x ) {
			for ( eventName in descriptor.x ) {
				if ( descriptor.x.hasOwnProperty( eventName ) ) {
					this.addEventProxy( eventName, descriptor.x[ eventName ], options.contextStack );
				}
			}
		}


		// set attributes
		this.attributes = [];
		bindable = []; // save these till the end

		for ( attrName in descriptor.a ) {
			if ( descriptor.a.hasOwnProperty( attrName ) ) {
				attrValue = descriptor.a[ attrName ];

				attr = new Attribute({
					parent: this,
					name: attrName,
					value: ( attrValue === undefined ? null : attrValue ),
					root: options.root,
					parentNode: this.node,
					contextStack: options.contextStack
				});

				this.attributes[ this.attributes.length ] = attr;

				if ( attr.isBindable ) {
					bindable.push( attr );
				}

				if ( attr.isTwowayNameAttr ) {
					twowayNameAttr = attr;
				} else {
					attr.update();
				}
			}
		}

		while ( bindable.length ) {
			bindable.pop().bind( this.root.lazy );
		}

		if ( twowayNameAttr ) {
			twowayNameAttr.updateViewModel();
			twowayNameAttr.update();
		}

		docFrag.appendChild( this.node );
	};

	Element.prototype = {
		addEventProxy: function ( eventName, proxy, contextStack ) {
			var self = this, definition, listener, fragment, handler;

			if ( typeof proxy === 'string' ) {
				handler = function ( event ) {
					self.root.fire( proxy, event, self.node );
				};
			} else {
				fragment = new _internal.TextFragment({
					descriptor: proxy,
					root: this.root,
					parent: this,
					contextStack: contextStack
				});

				handler = function ( event ) {
					self.root.fire( fragment.getValue(), event, self.node );
				};
			}

			if ( definition = _internal.eventDefns[ eventName ] ) {
				// Use custom event. Apply definition to this node
				listener = definition( this.node, handler );
				this.customEventListeners[ this.customEventListeners.length ] = listener;
			}

			else {
				// use standard event, if it is valid
				if ( this.node[ 'on' + eventName ] !== undefined ) {
					this.eventListeners[ this.eventListeners.length ] = {
						n: eventName,
						h: handler
					};

					this.node.addEventListener( eventName, handler );
				}
			}
		},

		teardown: function () {
			var listener;

			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			if ( this.children ) {
				this.children.teardown();
			}

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}

			while ( this.eventListeners.length ) {
				listener = this.eventListeners.pop();
				this.node.removeEventListener( listener.n, listener.h );
			}

			while ( this.customEventListeners.length ) {
				this.customEventListeners.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		},

		bubble: function () {
			// noop - just so event proxy fragments have something to call
		}
	};


	// Attribute
	Attribute = function ( options ) {

		var name, value, colonIndex, namespacePrefix, tagName, bindingCandidate, lowerCaseName, propertyName;

		name = options.name;
		value = options.value;

		this.parent = options.parent; // the element this belongs to

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*
			if ( namespacePrefix !== 'xmlns' ) {
				name = name.substring( colonIndex + 1 );
				this.namespace = _internal.namespaces[ namespacePrefix ];

				if ( !this.namespace ) {
					throw 'Unknown namespace ("' + namespacePrefix + '")';
				}
			}
		}

		// if it's an empty attribute, or just a straight key-value pair, with no
		// mustache shenanigans, set the attribute accordingly
		if ( value === null || typeof value === 'string' ) {
			
			if ( this.namespace ) {
				options.parentNode.setAttributeNS( this.namespace, name, value );
			} else {
				options.parentNode.setAttribute( name, value );
			}
			
			return;
		}

		// otherwise we need to do some work
		this.root = options.root;
		this.parentNode = options.parentNode;
		this.name = name;

		this.children = [];

		// can we establish this attribute's property name equivalent?
		if ( !this.namespace && options.parentNode.namespaceURI === _internal.namespaces.html ) {
			lowerCaseName = this.name.toLowerCase();
			propertyName = propertyNames[ lowerCaseName ] || lowerCaseName;

			if ( options.parentNode[ propertyName ] !== undefined ) {
				this.propertyName = propertyName;
			}

			// is this a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( typeof options.parentNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
				this.useProperty = true;
			}
		}

		// share parentFragment with parent element
		this.parentFragment = this.parent.parentFragment;

		this.fragment = new _internal.TextFragment({
			descriptor: value,
			root: this.root,
			parent: this,
			contextStack: options.contextStack
		});

		if ( this.fragment.items.length === 1 ) {
			this.selfUpdating = true;
		}


		// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
		if ( this.root.twoway ) {
			tagName = this.parent.descriptor.e.toLowerCase();
			bindingCandidate = ( ( propertyName === 'name' || propertyName === 'value' || propertyName === 'checked' ) && ( tagName === 'input' || tagName === 'textarea' || tagName === 'select' ) );
		}

		if ( bindingCandidate ) {
			this.isBindable = true;

			// name attribute is a special case - it is the only two-way attribute that updates
			// the viewmodel based on the value of another attribute. For that reason it must wait
			// until the node has been initialised, and the viewmodel has had its first two-way
			// update, before updating itself (otherwise it may disable a checkbox or radio that
			// was enabled in the template)
			if ( propertyName === 'name' ) {
				this.isTwowayNameAttr = true;
			}
		}


		// manually trigger first update
		this.ready = true;
		if ( !this.isTwowayNameAttr ) {
			this.update();
		}
	};

	Attribute.prototype = {
		bind: function ( lazy ) {
			// two-way binding logic should go here
			var self = this, node = this.parentNode, keypath, index;

			if ( !this.fragment ) {
				return false; // report failure
			}

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no modifiers
			if (
				this.fragment.items.length !== 1 ||
				this.fragment.items[0].type !== _internal.types.INTERPOLATOR
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator';
			}

			this.interpolator = this.fragment.items[0];

			// Hmmm. Not sure if this is the best way to handle this ambiguity...
			//
			// Let's say we were given `value="{{bar}}"`. If the context stack was
			// context stack was `["foo"]`, and `foo.bar` *wasn't* `undefined`, the
			// keypath would be `foo.bar`. Then, any user input would result in
			// `foo.bar` being updated.
			//
			// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
			// left with an unresolved partial keypath - so we are forced to make an
			// assumption. That assumption is that the input in question should
			// be forced to resolve to `bar`, and any user input would affect `bar`
			// and not `foo.bar`.
			//
			// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
			// be explicit when using two-way data-binding about what keypath you're
			// updating. Using it in lists is probably a recipe for confusion...
			keypath = this.interpolator.keypath || this.interpolator.descriptor.r;

			// if there are any modifiers, we want to disregard them when setting
			if ( ( index = keypath.indexOf( '.⭆' ) ) !== -1 ) {
				keypath = keypath.substr( 0, index );
			}
			
			// checkboxes and radio buttons
			if ( node.type === 'checkbox' || node.type === 'radio' ) {
				// We might have a situation like this: 
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//     <input type='radio' name='{{colour}}' value='blue'>
				//     <input type='radio' name='{{colour}}' value='green'>
				//
				// In this case we want to set `colour` to the value of whichever option
				// is checked. (We assume that a value attribute has been supplied.)

				if ( this.propertyName === 'name' ) {
					// replace actual name attribute
					node.name = '{{' + keypath + '}}';

					this.updateViewModel = function () {
						if ( node.checked ) {
							self.root.set( keypath, node.value );
						}
					};
				}


				// Or, we might have a situation like this:
				//
				//     <input type='checkbox' checked='{{active}}'>
				//
				// Here, we want to set `active` to true or false depending on whether
				// the input is checked.

				else if ( this.propertyName === 'checked' ) {
					this.updateViewModel = function () {
						self.root.set( keypath, node.checked );
					};
				}
			}

			else {
				// Otherwise we've probably got a situation like this:
				//
				//     <input value='{{name}}'>
				//
				// in which case we just want to set `name` whenever the user enters text.
				// The same applies to selects and textareas 
				this.updateViewModel = function () {
					var value;

					if ( self.interpolator.descriptor.m ) {
						value = self.root._modify( node.value, self.interpolator.descriptor.m );
					} else {
						value = node.value;
					}

					// special cases
					if ( value === '0' ) {
						value = 0;
					}

					else if ( value !== '' ) {
						value = +value || value;
					}

					// Note: we're counting on `this.root.set` recognising that `value` is
					// already what it wants it to be, and short circuiting the process.
					// Rather than triggering an infinite loop...
					self.root.set( keypath, value );
				};
			}
			

			// if we figured out how to bind changes to the viewmodel, add the event listeners
			if ( this.updateViewModel ) {
				this.twoway = true;

				node.addEventListener( 'change', this.updateViewModel );
				node.addEventListener( 'click',  this.updateViewModel );
				node.addEventListener( 'blur',   this.updateViewModel );

				if ( !lazy ) {
					node.addEventListener( 'keyup',    this.updateViewModel );
					node.addEventListener( 'keydown',  this.updateViewModel );
					node.addEventListener( 'keypress', this.updateViewModel );
					node.addEventListener( 'input',    this.updateViewModel );
				}
			}
		},

		teardown: function () {
			// remove the event listeners we added, if we added them
			if ( this.updateViewModel ) {
				this.parentNode.removeEventListener( 'change', this.updateViewModel );
				this.parentNode.removeEventListener( 'click', this.updateViewModel );
				this.parentNode.removeEventListener( 'blur', this.updateViewModel );
				this.parentNode.removeEventListener( 'keyup', this.updateViewModel );
				this.parentNode.removeEventListener( 'keydown', this.updateViewModel );
				this.parentNode.removeEventListener( 'keypress', this.updateViewModel );
				this.parentNode.removeEventListener( 'input', this.updateViewModel );
			}

			// ignore non-dynamic attributes
			if ( !this.children ) {
				return;
			}

			while ( this.children.length ) {
				this.children.pop().teardown();
			}
		},

		bubble: function () {
			// If an attribute's text fragment contains a single item, we can
			// update the DOM immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// otherwise we want to register it as a deferred attribute, to be
			// updated once all the information is in, to prevent unnecessary
			// DOM manipulation
			else if ( !this.deferred ) {
				this.root._defAttrs[ this.root._defAttrs.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value, lowerCaseName;

			if ( !this.ready ) {
				return this; // avoid items bubbling to the surface when we're still initialising
			}

			if ( this.twoway ) {
				// TODO compare against previous?
				
				lowerCaseName = this.name.toLowerCase();
				this.value = this.interpolator.value;

				// special case - if we have an element like this:
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//
				// and `colour` has been set to 'red', we don't want to change the name attribute
				// to red, we want to indicate that this is the selected option, by setting
				// input.checked = true
				if ( lowerCaseName === 'name' && ( this.parentNode.type === 'checkbox' || this.parentNode.type === 'radio' ) ) {
					if ( this.value === this.parentNode.value ) {
						this.parentNode.checked = true;
					} else {
						this.parentNode.checked = false;
					}

					return this; 
				}

				// don't programmatically update focused element
				if ( doc.activeElement === this.parentNode ) {
					return this;
				}
			}
			
			value = this.fragment.getValue();

			if ( value === undefined ) {
				value = '';
			}

			if ( this.useProperty ) {
				this.parentNode[ this.propertyName ] = value;
				return this;
			}

			if ( this.namespace ) {
				this.parentNode.setAttributeNS( this.namespace, this.name, value );
				return this;
			}

			this.parentNode.setAttribute( this.name, value );

			return this;
		}
	};





	// Interpolator
	Interpolator = function ( options, docFrag ) {
		this.node = doc.createTextNode( '' );
		docFrag.appendChild( this.node );

		// extend Mustache
		_internal.Mustache.call( this, options );
	};

	Interpolator.prototype = {
		teardown: function () {
			if ( !this.observerRefs ) {
				this.root._cancelKeypathResolution( this );
			} else {
				this.root._unobserveAll( this.observerRefs );
			}

			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		update: function ( text ) {
			if ( text !== this.text ) {
				this.text = text;
				this.node.data = text;
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Triple
	Triple = function ( options, docFrag ) {
		this.nodes = [];
		this.docFrag = doc.createDocumentFragment();

		this.initialising = true;
		_internal.Mustache.call( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Triple.prototype = {
		teardown: function () {

			// remove child nodes from DOM
			if ( this.root.el.contains( this.parentNode ) ) {
				while ( this.nodes.length ) {
					this.parentNode.removeChild( this.nodes.pop() );
				}
			}

			// kill observer(s)
			if ( !this.observerRefs ) {
				this.root._cancelKeypathResolution( this );
			} else {
				this.root._unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		update: function ( html ) {
			if ( html === this.html ) {
				return;
			}

			this.html = html;
			
			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			// get new nodes
			this.nodes = insertHtml( html, this.docFrag );

			if ( !this.initialising ) {
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
		}
	};



	// Section
	Section = function ( options, docFrag ) {
		this.fragments = [];
		this.length = 0; // number of times this section is rendered

		this.docFrag = doc.createDocumentFragment();
		
		this.initialising = true;
		_internal.Mustache.call( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Section.prototype = {
		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.root._cancelKeypathResolution( this );
			} else {
				this.root._unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.fragments[0] ) {
				return this.fragments[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.fragments[ fragment.index + 1 ] ) {
				return this.fragments[ fragment.index + 1 ].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
		},

		update: function ( value ) {
			
			_internal.sectionUpdate.call( this, value );

			if ( !this.initialising ) {
				// we need to insert the contents of our document fragment into the correct place
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
			
		},

		createFragment: function ( options ) {
			var fragment = new _internal.DomFragment( options );
			
			this.docFrag.appendChild( fragment.docFrag );
			return fragment;
		}
	};

}( _internal ));

(function ( _internal ) {

	'use strict';

	var types,
		Text, Interpolator, Triple, Section;

	types = _internal.types;

	_internal.TextFragment = function ( options ) {
		_internal.Fragment.call( this, options );
	};

	_internal.TextFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options.descriptor );
			}

			switch ( options.descriptor.t ) {
				case types.INTERPOLATOR: return new Interpolator( options );
				case types.TRIPLE: return new Triple( options );
				case types.SECTION: return new Section( options );

				default: throw 'Something went wrong in a rather interesting way';
			}
		},


		bubble: function () {
			this.value = this.getValue();
			this.parent.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		getValue: function () {
			var value;

			if ( this.items.length === 1 ) {
				value = this.items[0].value;
				if ( value !== undefined ) {
					return value;
				}
			}

			return this.toString();
		},

		toString: function () {
			// TODO refactor this... value should already have been calculated? or maybe not. Top-level items skip the fragment and bubble straight to the attribute...
			// argh, it's confusing me
			return this.items.join( '' );
		}
	};



	// Plain text
	Text = function ( text ) {
		this.text = text;
	};

	Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	Interpolator = function ( options ) {
		_internal.Mustache.call( this, options );
	};

	Interpolator.prototype = {
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.root._cancelKeypathResolution( this );
			} else {
				this.root._unobserveAll( this.observerRefs );
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

	// Triples are the same as Interpolators in this context
	Triple = Interpolator;


	// Section
	Section = function ( options ) {
		this.fragments = [];
		this.length = 0;

		_internal.Mustache.call( this, options );
	};

	Section.prototype = {
		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.root._cancelKeypathResolution( this );
			} else {
				this.root._unobserveAll( this.observerRefs );
			}
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.fragments.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			_internal.sectionUpdate.call( this, value );

			this.value = this.fragments.join( '' );
			this.parent.bubble();
		},

		createFragment: function ( options ) {
			return new _internal.TextFragment( options );
		},

		toString: function () {
			return this.fragments.join( '' );
			//return ( this.value === undefined ? '' : this.value );
		}
	};

}( _internal ));
Ractive.extend = function ( childProps ) {

	var Parent, Child, key;

	Parent = this;

	Child = function () {
		Ractive.apply( this, arguments );

		if ( this.init ) {
			this.init.apply( this, arguments );
		}
	};

	// extend child with parent methods
	for ( key in Parent.prototype ) {
		if ( Parent.prototype.hasOwnProperty( key ) ) {
			Child.prototype[ key ] = Parent.prototype[ key ];
		}
	}

	// extend child with specified methods, as long as they don't override Ractive.prototype methods
	for ( key in childProps ) {
		if ( childProps.hasOwnProperty( key ) ) {
			if ( Ractive.prototype.hasOwnProperty( key ) ) {
				throw new Error( 'Cannot override "' + key + '" method or property of Ractive prototype' );
			}

			Child.prototype[ key ] = childProps[ key ];
		}
	}

	Child.extend = Parent.extend;

	return Child;
};
(function ( _internal ) {

	'use strict';

	var define, notifyDependents, wrapArray, unwrapArray, WrappedArrayProto, testObj, mutatorMethods;


	// just in case we don't have Object.defineProperty, we can use this - it doesn't
	// allow us to set non-enumerable properties, but if you're doing for ... in loops on 
	// an array then you deserve what's coming anyway
	if ( !Object.defineProperty ) {
		define = function ( obj, prop, desc ) {
			obj[ prop ] = desc.value;
		};
	} else {
		define = Object.defineProperty;
	}
	

	// Register a keypath to this array. When any of this array's mutator methods are called,
	// it will `set` that keypath on the given Ractive instance
	_internal.addKeypath = function ( array, keypath, root ) {
		var roots, keypathsByIndex, rootIndex, keypaths;

		// If this array hasn't been wrapped, we need to wrap it
		if ( !array._ractive ) {
			define( array, '_ractive', {
				value: {
					roots: [ root ], // there may be more than one Ractive instance depending on this
					keypathsByIndex: [ [ keypath ] ]
				},
				configurable: true
			});

			wrapArray( array );
		}

		else {
		
			roots = array._ractive.roots;
			keypathsByIndex = array._ractive.keypathsByIndex;

			// Does this Ractive instance currently depend on this array?
			rootIndex = roots.indexOf( root );

			// If not, associate them
			if ( rootIndex === -1 ) {
				rootIndex = roots.length;
				roots[ rootIndex ] = root;
			}

			// Find keypaths that reference this array, on this Ractive instance
			if ( !keypathsByIndex[ rootIndex ] ) {
				keypathsByIndex[ rootIndex ] = [];
			}

			keypaths = keypathsByIndex[ rootIndex ];

			// If the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}
	};


	// Unregister keypath from array
	_internal.removeKeypath = function ( array, keypath, root ) {
		var roots, keypathsByIndex, rootIndex, keypaths, keypathIndex;

		if ( !array._ractive ) {
			throw new Error( 'Attempted to remove keypath from non-wrapped array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		roots = array._ractive.roots;
		rootIndex = roots.indexOf( root );

		if ( rootIndex === -1 ) {
			throw new Error( 'Ractive instance was not listed as a dependent of this array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		keypathsByIndex = array._ractive.keypathsByIndex;
		keypaths = keypathsByIndex[ rootIndex ];
		keypathIndex = keypaths.indexOf( keypath );

		if ( keypathIndex === -1 ) {
			throw new Error( 'Attempted to unlink non-linked keypath from array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		keypaths.splice( keypathIndex, 1 );

		if ( !keypaths.length ) {
			roots.splice( rootIndex, 1 );
		}

		if ( !roots.length ) {
			unwrapArray( array ); // It's good to clean up after ourselves
		}
	};


	// Call `set` on each dependent Ractive instance, for each dependent keypath
	notifyDependents = function ( array ) {
		var roots, keypathsByIndex, root, keypaths, i, j;

		roots = array._ractive.roots;
		keypathsByIndex = array._ractive.keypathsByIndex;

		i = roots.length;
		while ( i-- ) {
			root = roots[i];
			keypaths = keypathsByIndex[i];

			j = keypaths.length;
			while ( j-- ) {
				root.set( keypaths[j], array );
			}
		}
	};


		
	WrappedArrayProto = [];
	mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ];

	mutatorMethods.forEach( function ( methodName ) {
		var method = function () {
			var result = Array.prototype[ methodName ].apply( this, arguments );

			this._ractive.setting = true;
			notifyDependents( this );
			this._ractive.setting = false;

			return result;
		};

		define( WrappedArrayProto, methodName, {
			value: method
		});
	});

	
	// can we use prototype chain injection?
	// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
	testObj = {};
	if ( testObj.__proto__ ) {
		// yes, we can
		wrapArray = function ( array ) {
			array.__proto__ = WrappedArrayProto;
		};

		unwrapArray = function ( array ) {
			delete array._ractive;
			array.__proto__ = Array.prototype;
		};
	}

	else {
		// no, we can't
		wrapArray = function ( array ) {
			var i, methodName;

			i = mutatorMethods.length;
			while ( i-- ) {
				methodName = mutatorMethods[i];
				define( array, methodName, {
					value: WrappedArrayProto[ methodName ]
				});
			}
		};

		unwrapArray = function ( array ) {
			var i;

			i = mutatorMethods.length;
			while ( i-- ) {
				delete array[ mutatorMethods[i] ];
			}

			delete array._ractive;

			console.log( 'unwrapped array', array );
		};
	}

}( _internal ));
// These are a subset of the easing equations found at
// https://raw.github.com/danro/easing-js - license info
// follows:

// --------------------------------------------------
// easing.js v0.5.4
// Generic set of easing functions with AMD support
// https://github.com/danro/easing-js
// This code may be freely distributed under the MIT license
// http://danro.mit-license.org/
// --------------------------------------------------
// All functions adapted from Thomas Fuchs & Jeremy Kahn
// Easing Equations (c) 2003 Robert Penner, BSD license
// https://raw.github.com/danro/easing-js/master/LICENSE
// --------------------------------------------------

// In that library, the functions named easeIn, easeOut, and
// easeInOut below are named easeInCubic, easeOutCubic, and
// (you guessed it) easeInOutCubic.
//
// You can add additional easing functions to this list, and they
// will be globally available.

Ractive.easing = {
	linear: function ( pos ) { return pos; },
	easeIn: function ( pos ) { return Math.pow( pos, 3 ); },
	easeOut: function ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
	easeInOut: function ( pos ) {
		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
	}
};
(function ( R, _i ) {

	'use strict';

	var Animation, animationCollection, global;

	global = ( typeof window !== 'undefined' ? window : {} );

	// https://gist.github.com/paulirish/1579671
	(function( vendors, lastTime, global ) {
		
		var x;

		for ( x = 0; x < vendors.length && !global.requestAnimationFrame; ++x ) {
			global.requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
			global.cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if ( !global.requestAnimationFrame ) {
			global.requestAnimationFrame = function(callback) {
				var currTime, timeToCall, id;
				
				currTime = Date.now();
				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				id = global.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
				
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if ( !global.cancelAnimationFrame ) {
			global.cancelAnimationFrame = function( id ) {
				global.clearTimeout( id );
			};
		}
	}( ['ms', 'moz', 'webkit', 'o'], 0, global ));



	animationCollection = {
		animations: [],

		tick: function () {
			var i, animation;

			for ( i=0; i<this.animations.length; i+=1 ) {
				animation = this.animations[i];

				if ( !animation.tick() ) {
					// animation is complete, remove it from the stack, and decrement i so we don't miss one
					this.animations.splice( i--, 1 );
				}
			}

			if ( this.animations.length ) {
				global.requestAnimationFrame( this.boundTick );
			} else {
				this.running = false;
			}
		},

		// bind method to animationCollection
		boundTick: function () {
			animationCollection.tick();
		},

		push: function ( animation ) {
			this.animations[ this.animations.length ] = animation;

			if ( !this.running ) {
				this.running = true;
				this.tick();
			}
		}
	};

	

	Animation = function ( options ) {
		var key;

		this.startTime = Date.now();

		// from and to
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}

		this.interpolator = R.interpolate( this.from, this.to );
		this.running = true;
	};

	Animation.prototype = {
		tick: function () {
			var elapsed, t, value, timeNow;

			if ( this.running ) {
				timeNow = Date.now();
				elapsed = timeNow - this.startTime;

				if ( elapsed >= this.duration ) {
					this.root.set( this.keys, this.to );

					if ( this.complete ) {
						this.complete( 1 );
					}

					this.running = false;
					return false;
				}

				t = this.easing ? this.easing ( elapsed / this.duration ) : ( elapsed / this.duration );
				value = this.interpolator( t );

				this.root.set( this.keys, value );

				if ( this.step ) {
					this.step( t, value );
				}

				return true;
			}

			return false;
		},

		stop: function () {
			this.running = false;
		}
	};


	R.prototype.animate = function ( keypath, to, options ) {
		var easing, duration, animation, i, keys;

		options = options || {};

		// cancel any existing animation
		i = animationCollection.animations.length;
		while ( i-- ) {
			if ( animationCollection.animations[ i ].keypath === keypath ) {
				animationCollection.animations[ i ].stop();
			}
		}

		// easing function
		if ( options.easing ) {
			if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			}

			else {
				if ( this.easing && this.easing[ options.easing ] ) {
					// use instance easing function first
					easing = this.easing[ options.easing ];
				} else {
					// fallback to global easing functions
					easing = R.easing[ options.easing ];
				}
			}

			if ( typeof easing !== 'function' ) {
				easing = null;
			}
		}

		// duration
		duration = ( options.duration === undefined ? 400 : options.duration );

		keys = _i.splitKeypath( keypath );

		animation = new Animation({
			keys: keys,
			from: this.get( keys ),
			to: to,
			root: this,
			duration: duration,
			easing: easing,
			step: options.step,
			complete: options.complete
		});

		animationCollection.push( animation );
	};


}( Ractive, _internal ));
(function ( R, _p ) {

	'use strict';

	R.interpolate = function ( from, to ) {
		if ( _p.isNumeric( from ) && _p.isNumeric( to ) ) {
			return R.interpolators.number( +from, +to );
		}

		if ( _p.isArray( from ) && _p.isArray( to ) ) {
			return R.interpolators.array( from, to );
		}

		if ( _p.isObject( from ) && _p.isObject( to ) ) {
			return R.interpolators.object( from, to );
		}

		throw new Error( 'Could not interpolate values' );
	};

	R.interpolators = {
		number: function ( from, to ) {
			var delta = to - from;

			if ( !delta ) {
				return function () { return from; };
			}

			return function ( t ) {
				return from + ( t * delta );
			};
		},

		array: function ( from, to ) {
			var intermediate, interpolators, len, i;

			intermediate = [];
			interpolators = [];

			i = len = Math.min( from.length, to.length );
			while ( i-- ) {
				interpolators[i] = R.interpolate( from[i], to[i] );
			}

			// surplus values - don't interpolate, but don't exclude them either
			for ( i=len; i<from.length; i+=1 ) {
				intermediate[i] = from[i];
			}

			for ( i=len; i<to.length; i+=1 ) {
				intermediate[i] = to[i];
			}

			return function ( t ) {
				var i = len;

				while ( i-- ) {
					intermediate[i] = interpolators[i]( t );
				}

				return intermediate;
			};
		},

		object: function ( from, to ) {
			var properties = [], len, interpolators, intermediate, prop;

			intermediate = {};
			interpolators = {};

			for ( prop in from ) {
				if ( from.hasOwnProperty( prop ) ) {
					if ( to.hasOwnProperty( prop ) ) {
						properties[ properties.length ] = prop;
						interpolators[ prop ] = R.interpolate( from[ prop ], to[ prop ] );
					}

					else {
						intermediate[ prop ] = from[ prop ];
					}
				}
			}

			for ( prop in to ) {
				if ( to.hasOwnProperty( prop ) && !from.hasOwnProperty( prop ) ) {
					intermediate[ prop ] = to[ prop ];
				}
			}

			len = properties.length;

			return function ( t ) {
				var i = len, prop;

				while ( i-- ) {
					prop = properties[i];

					intermediate[ prop ] = interpolators[ prop ]( t );
				}

				return intermediate;
			};
		}
	};

}( Ractive, _internal ));
_internal.namespaces = {
	html: 'http://www.w3.org/1999/xhtml',
	mathml: 'http://www.w3.org/1998/Math/MathML',
	svg: 'http://www.w3.org/2000/svg',
	xlink: 'http://www.w3.org/1999/xlink',
	xml: 'http://www.w3.org/XML/1998/namespace',
	xmlns: 'http://www.w3.org/2000/xmlns/'
};

// export
if ( typeof module !== "undefined" && module.exports ) module.exports = Ractive // Common JS
else if ( typeof define === "function" && define.amd ) define( function () { return Ractive } ) // AMD
else { global.Ractive = Ractive }

}( this ));