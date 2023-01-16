---
title: Repeatable UUIDs
date: 2019-02-27T23:23:00Z
---

I recently wanted to identify the records coming from a server to apply [uniqueness constraints](https://developer.apple.com/videos/play/wwdc2015/220/?time=613) while caching them locally using [Core Data](https://developer.apple.com/documentation/coredata). The rub with this, as it often seems to be with APIs I consume, is having data with no unique identifier as a sub-structure of some larger payload that _is_ uniquely identified. For instance, a blog post will have an ID, but a taxonomy on that blog post won’t:

```json
{
  "id": 9001,
  "title": "Lorem ipsum dolor amet",
  "content": "<p>Microdosing chambray church-key green juice schlitz locavore lumbersexual…</p>",
  "categories": [
    {
      "name": "sample content",
      "color": "#f07d71",
      "parent": null
    },
    {
      "name": "lorem ipsum",
      "color": "#99fc8b",
      "parent": "sample content"
    }
  ]
}
```

Update using find-or-create for the blog post with id `9001` usually requires dumping all of the post’s tags and finding-or-creating new ones. I hate doing that; it’s a lot of I/O churn and plays poorly with dynamically-updating UI. It’s also not correct for this hierarchical data! `"name"` isn’t a good primary key; the items’ identity involves its position in the hierarchy. Finally, it doesn’t play nice with uniqueness constraints, which infects the entire object graph with its not working. This sucks!

As I played with the problem, I thought back on my recent tinkering with HomeKit and [`HAP-NodeJS`](https://github.com/KhaosT/HAP-NodeJS) in particular. I recalled references to “consistent [UUIDs]”:

```js
// We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate("hap-nodejs:accessories:temperature-sensor")
```

This code is doing _something_ to turn a string into the same UUID each time, so that it can survive reboots of the code or wipes of its persistent cache. That sounds like what I’m looking for! Looking further into its `uuid.generate` pointed to a neat [Stack Overflow answer](http://stackoverflow.com/a/25951500/66673), which mentions v4 and v5 UUIDs. Curiosity sufficiently piqued — you can revise 128 bits of randomness? [Wikipedia](http://en.wikipedia.org/wiki/UUID) to the rescue.

Having [high-quality random numbers](https://www.xkcd.com/221/) is pretty recent relative to computing as a whole. The need for globally unique identifiers across problem spaces existed much earlier. The very first UUIDs (now known as versions 1 and 2 under [RFC4122](http://tools.ietf.org/html/4122)) combined information like the current time and your MAC address. The random-number-driven UUIDs you’re probably familiar with from your platform API are actually version 4 under this scheme.

It’s turns out there’s also versions 3 and 5, which are namespace-based. You take a separate, statically-known UUID — a “namespace”— and some arbitrary string — a “name”— and hash them together using MD5 for version 3, or SHA-1 for version 5). The “name” is a string in the C sense — any bag of bytes. As long as you can produce the same bytes for the same string after normalizing for Unicode, you can generate the same UUID.

To create a UUID from scratch, you need 128 bits of data. Few languages consistently expose a type like `UInt128`, but may have a more catch-all `BigInt`. Platforms generally represent UUIDs as an equivalent tuple or array (like two `UInt64`, four `UInt32`, etc.) Apple’s Foundation is 16 `UInt8`, likely to make it easier to work with plain bytes.

```swift
UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)) // => 00000000-0000-0000-0000-000000000000
UUID(uuid: (0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x99, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF)) // => 00112233-4455-6677-9999-AABBCCDDEEFF
```

If we’re looking to do cryptographic hashing, look no further than [`CommonCrypto`](https://developer.apple.com/library/archive/documentation/Security/Conceptual/cryptoservices/Introduction/Introduction.html). In Xcode 10.2 (beta at time of writing), you can finally `import CommonCrypto` without doing any gymnastics. It’s a C library, but because of Swift’s pointer bridging, you can squint really hard and pretend it’s not.

```swift
import CommonCrypto

var context = CC_SHA1_CTX()
CC_SHA1_Init(&context)
```

Given some separate `namespace: UUID`, combine its raw bytes (those 16 `UInt8`) into the hasher:

```swift
_ = withUnsafeBytes(of: namespace.uuid) { (buffer) in
    CC_SHA1_Update(&context, buffer.baseAddress, CC_LONG(buffer.count))
}
```

And do the same with a `value: String`, bridging it to C.

```swift
_ = value.withCString { (cString) in
    CC_SHA1_Update(&context, cString, CC_LONG(strlen(cString)))
}
```

Now,output the hash into a sized array. There are lots of ways to do this bit; `Data` is probably a more logical one, or you can even write out your own `(UInt8, …)`, but both of those require more code.

```swift
var array = [UInt8](repeating: 0, count: Int(CC_SHA1_DIGEST_LENGTH))
CC_SHA1_Final(&array, &context)
```

With the hash done, according to the RFC4122, we should to twiddle some specific bits to discourage code that is aware of the certain formats from trying to parse it as theirs. In terms of the hex representation `xxxxxxxx-xxxx-Yxxx-Zxxx-xxxxxxxxxxxx`, we want `Y` to read `5` (version 5) and `Z` to read `8`, `9`, `A`, or `B` (its upper bits indicating that it’s generated according to RFC4122).

```swift
array[6] = (array[6] & 0x0F) | 0x50 // set version number nibble to 5
array[8] = (array[8] & 0x3F) | 0x80 // reset clock nibbles to indicate RFC4122
```

And we have our 16 bytes! (Actually 20, but we’re obliged to ignore the rest.)

```swift
// truncate to first 16
let uuid = UUID(uuid: (array[0], array[1], array[2], array[3],
                       array[4], array[5], array[6], array[7],
                       array[8], array[9], array[10], array[11],
                       array[12], array[13], array[14], array[15]))
```

Wrap that up into a nice initializer (mine is `UUID(hashing:inNamespace:)`, the naming logic of which could be a whole other post) and generate yourself some namespaces. Finally, I can do this magic trick where I guess what your UUID is going to be!

```swift
// predefined by RFC4122, generate your own using “uuidgen”
let dns = UUID(uuidString: "6BA7B810-9DAD-11D1-80B4-00C04FD430C8")!

let expected = UUID(string: "2F5B7779-4ED7-570A-82AC-634B872ABF8A")!
let result = UUID(hashing: "waldowski.me", inNamespace: dns)
expected == result // => true
```

You can find the full code with unit tests on my [snippets repository on GitHub](https://github.com/zwaldowski/ParksAndRecreation/tree/master/Latest/Repeatable%20UUID.playground).

---

Oh, and this was all promptly cut out of the project I worked it on. Code is like that sometimes.
