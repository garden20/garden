simple-uuid
===========

A simple uuid generator, in a AMD module.

Install
-------

```
jam install simple-uuid
```

```
define('app/ui', ['simple-uuid'], function(uuid) {
    uuid.uuid();
})
```


Usage
------

uuid(length, radix)

 - __length__  the desired number of characters
 - __radix__  the number of allowable values for each character.

EXAMPLES:

No arguments  - returns RFC4122, version 4 ID

```
uuid.uuid() // returns a string like "92329D39-6F5C-4520-ABFC-AAB64544E172"
```

One argument - returns ID of the specified length

```
uuid.uuid(15)     // 15 character ID (default base=62) "VcydxgltxrVZSTV"
```

Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)

```
uuid.uuid(8, 2)  // 8 character ID (base=2)  "01001010"
uuid.uuid(8, 10) // 8 character ID (base=10) "47473046"
uuid.uuid(8, 16) // 8 character ID (base=16) "098F4D35"
```

A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance by minimizing calls to random()

```
uuid.uuidFast()
```

A more compact, but less performant, RFC4122v4 solution:

```
uuid.uuidCompact()
```


