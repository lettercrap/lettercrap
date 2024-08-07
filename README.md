# Lettercrap &middot; ![version](https://img.shields.io/npm/v/@lettercrap/web?label=version) ![npm](https://img.shields.io/npm/dm/@lettercrap/web?label=npm) ![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@lettercrap/web?label=jsDelivr) ![GitHub](https://img.shields.io/github/license/lettercrap/lettercrap?label=license)

_Lettercrap_ is a JavaScript library that uses an image mask to generate dynamic ASCII art on the web. It looks like this:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/dabico/lettercrap/assets/34584913/5d9e21ea-9301-49d4-a5c0-e685b762590d">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/dabico/lettercrap/assets/34584913/62f87c22-25b6-45f5-b8a4-6715ea9d394e">
  <img alt="GIF showing the animated library name" src="https://github.com/dabico/lettercrap/assets/34584913/5d9e21ea-9301-49d4-a5c0-e685b762590d">
</picture>

## Usage

To use the library in the browser, include `lettercrap.min.js` as follows:

```html
<!doctype html>
<html lang="en">
  <head>
    <title />
  </head>
  <body>
    <!-- TARGETED ELEMENTS GO HERE -->
    <script type="module">
      import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
      // CODE THAT USES THE LIBRARY GOES HERE
    </script>
  </body>
</html>
```

The JS file exports some functions you can use to generate ASCII art.
You can define the data holders (and subsequent rendering sections) in your HTML in one of two ways:

1. Create a `<div>` with the `data-lettercrap` attribute and set the value to the source of a black-and-white image.

   ```html
   <div data-lettercrap="example.png"></div>
   ```

2. Create a `<div>` with the `data-lettercrap-text` attribute and set
   the value to the text you want to generate the ASCII art from.

   ```html
   <div data-lettercrap-text="LETTERCRAP"></div>
   ```

For initializing elements on the page, you can use one of three functions:

1. Initialize a single element by passing its `Node` to the `initElement` function of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
     const element = document.getElementById('...');
     Lettercrap.initElement(element);
   </script>
   ```

2. Initialize multiple elements by passing a `NodeList` to the `initElements` function of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
     const elements = document.querySelectorAll('...');
     Lettercrap.initElements(elements);
   </script>
   ```

3. Initialize all elements on the page by calling the `init` function of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
     Lettercrap.init();
   </script>
   ```

For resetting initialized elements, you can use one of three functions:

1. Reset a single element by passing its `Node` to the `resetElement` function of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
     const element = document.getElementById('...');
     Lettercrap.resetElement(element);
   </script>
   ```

2. Reset multiple elements by passing a `NodeList` to the `resetElements` function of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
     const elements = document.querySelectorAll('...');
     Lettercrap.resetElements(elements);
   </script>
   ```

3. Reset all elements on the page by calling the `reset` function of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
     Lettercrap.reset();
   </script>
   ```

Although the library comes pre-configured with a set of default settings,
we provide further means for customizing the output on a per-element basis:

- By default, `0` and `1` are used to fill in the shape of your image or text.
  You can change the set of symbols used with the `data-lettercrap-letters` attribute:

  ```html
  <div data-lettercrap="example.png" data-lettercrap-letters="ABC"></div>
  ```

- To throw in the occasional _full word_ into the mix, you can specify a space-delimited string
  of words to choose from using the `data-lettercrap-words` attribute:

  ```html
  <div data-lettercrap="example.png" data-lettercrap-words="APPLE BANANA CHERRY"></div>
  ```

- You can change the time interval in milliseconds between updates to the ASCII art
  with the `data-lettercrap-update-interval` attribute (default is `150`):

  ```html
  <div data-lettercrap="example.png" data-lettercrap-interval="200"></div>
  ```

- When using `data-lettercrap-text`, you can set the font of the generated
  ASCII art with the `data-lettercrap-font-family` attribute (default is `monospace`):

  ```html
  <div data-lettercrap-text="LETTERCRAP" data-lettercrap-font-family="times"></div>
  ```

- When using `data-lettercrap-text`, you can set the font weight of the generated
  ASCII art with the `data-lettercrap-font-weight` attribute (default is `normal`):

  ```html
  <div data-lettercrap-text="LETTERCRAP" data-lettercrap-font-weight="bold"></div>
  ```

You can also configure how the library behaves by using the exported `configure` function to overwrite the default options:

```html
<script type="module">
  import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
  Lettercrap.configure({ letters: 'AB' });
  Lettercrap.init();
</script>
```

The following table shows the correspondence between the global `Config` properties and the per-instance `data` equivalents:

| Global `Config` property | Per-instance `data` equivalent | Accepted values                                                             |
| ------------------------ | ------------------------------ | --------------------------------------------------------------------------- |
| `content`                | `data-lettercrap`              | Non-blank string                                                            |
| `letters`                | `data-lettercrap-letters`      | Non-blank string                                                            |
| `words`                  | `data-lettercrap-words`        | Non-blank string array                                                      |
| `font_family`            | `data-lettercrap-font-family`  | [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) |
| `font_weight`            | `data-lettercrap-font-weight`  | [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) |
| `update_interval`        | `data-lettercrap-interval`     | Positive integer or zero                                                    |

Please note that changes to default options will not propagate to instances that have already been rendered.
To synchronize the rendered instances that rely on default settings, you can call the `refresh` function:

```html
<script type="module">
  import * as Lettercrap from 'https://cdn.jsdelivr.net/npm/@lettercrap/web/dist/lettercrap.min.js';
  Lettercrap.init().then(async () => {
    Lettercrap.configure({ letters: 'AB' });
    return Lettercrap.refresh();
  });
</script>
```

Check out the [example](example/index.html) to see how this all fits together.

## Development

To get the example working locally, you can run:

```bash
npm run dev
```

This will start a local HTTP server on port `8080`.

## FAQ

### How can I request a feature or ask a question?

If you have ideas for a feature you would like to see implemented or if you have any questions, we encourage you to
create a new [discussion](https://github.com/lettercrap/lettercrap/discussions/). By initiating a discussion, you can
engage with the community and our team, and we'll respond promptly to address your queries or consider your feature
requests.

### How can I report a bug?

To report any issues or bugs you encounter, please create a [new issue](https://github.com/lettercrap/lettercrap/issues/).
Providing detailed information about the problem you're facing will help us understand and address it more effectively.
Rest assured, we are committed to promptly reviewing and responding to the issues you raise, working collaboratively
to resolve any bugs and improve the overall user experience.

### How do I contribute to the project?

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
