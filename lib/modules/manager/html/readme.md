The `html` manager updates `<script>` tags and CSS `<link>` tags that point to the [cdnjs content delivery network](https://cdnjs.com/) or the [jsDelivr content delivery network](https://www.jsdelivr.com/).
It also updates Subresource Integrity (SRI) hashes in `integrity` attributes.

jsDelivr URLs are supported for both its `npm` and `gh` (GitHub) upstreams, for example:

```
https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js
https://cdn.jsdelivr.net/gh/twbs/bootstrap@5.3.8/dist/js/bootstrap.min.js
```

Key differences between the `cdnurl` manager and the `html` manager:

- The `html` manager updates SRI hashes, the `cndurl` manager does not
- The `html` manager automatically finds some files to update, the `cndurl` manager must be given a `managerFilePatterns`
