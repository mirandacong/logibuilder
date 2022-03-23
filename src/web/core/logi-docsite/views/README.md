# How Docsite Component Works

The docsite component takes one major input `menuGroup`:

```text
title: 'Docs',
group: [{
        title: 'Start',
        group: [{
            title: 'Quickstart',
            url: 'docs/external/start/quickstart'},
            {
            title: 'Overview',
            url: 'docs/external/start/overview'}]},
        {
        title: 'LogiBuilder',
        group: [{
            title: 'Hierarchy',
            url: 'docs/external/logibuilder/hierarchy'},
            {
            title: 'Hierarchy_expression',
            url: 'docs/external/logibuilder/hierarchy_expression'}]}]
```

## Side Menu

The data above will be used by `side-menu` component to generate a menu tree
that has the same structure as the data above. The `url` of each item will be
used as `routerLink` to navigate between documents.

## Docs View

When clicking on a link, the `location` service captures the router
navigation event in an `Observable` (created from `fromEvent`) and `next` a
document url. Then `document` service (the `subscriber`) receives the url,
uses that url to request the document file, and `next` the document content.
After that, the `docs-view` component receives the content, and renders the
content to the view.

Before rendering, the `docs-view` component changes the image urls and
relative links to correct urls.

After rendering, the `docs-view` component calls the `toc` service to
generate the table of content.

## Toc View

TOC = Table of Contents

The `toc` service queries all `h1, h2, h3` elements in the document as the
table of content, and `next` the toc. Then the `toc-view` component receives
it and shows on the right side.

The `toc` service also spies on the scroll event of the document page and
detects which heading (h1, h2, h3) element is showing on the page (not
covered). This heading is called the active heading, the `toc-view` component
will highlight the active heading in the table of content.

## Others

The services mentioned above locates in 'src/web/services/docsite'.

The usage examples locates in 'src/web/projects/docsite' and
'src/web/core/logi-docsite'.
