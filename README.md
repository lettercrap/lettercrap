# Lettercrap

_Lettercrap_ is a JavaScript library that uses an image mask to generate dynamic ASCII art on the web. It looks like this:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/dabico/lettercrap/assets/34584913/5d9e21ea-9301-49d4-a5c0-e685b762590d">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/dabico/lettercrap/assets/34584913/62f87c22-25b6-45f5-b8a4-6715ea9d394e">
  <img alt="GIF showing the animated library name" src="https://github.com/dabico/lettercrap/assets/34584913/5d9e21ea-9301-49d4-a5c0-e685b762590d">
</picture>

## Usage

To use the library in your project, include _both_ `lettercrap.min.js` and `lettercrap.min.css`. The JS file exports some functions you can use to generate ASCII art.
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

For initializing elements on the page, you can use one of three methods:

1. Initialize a single element by passing its `Node` to the `initElement` method of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from './lettercrap.min.js';
     const element = document.getElementById('...');
     Lettercrap.initElement(element);
   </script>
   ```

2. Initialize multiple elements by passing a `NodeList` to the `initElements` method of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from './lettercrap.min.js';
     const elements = document.querySelectorAll('...');
     Lettercrap.initElements(elements);
   </script>
   ```

3. Initialize all elements on the page by calling the `init` method of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from './lettercrap.min.js';
     Lettercrap.init();
   </script>
   ```

For resetting initialized elements, you can use one of three methods:

1. Reset a single element by passing its `Node` to the `resetElement` method of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from './lettercrap.min.js';
     const element = document.getElementById('...');
     Lettercrap.resetElement(element);
   </script>
   ```

2. Reset multiple elements by passing a `NodeList` to the `resetElements` method of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from './lettercrap.min.js';
     const elements = document.querySelectorAll('...');
     Lettercrap.resetElements(elements);
   </script>
   ```

3. Reset all elements on the page by calling the `reset` method of `Lettercrap`:

   ```html
   <script type="module">
     import * as Lettercrap from './lettercrap.min.js';
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
  import * as Lettercrap from './lettercrap.min.js';
  Lettercrap.configure({ letters: 'AB' });
  Lettercrap.init();
</script>
```

Check out the [example](example/index.html) to see how this all fits together.

## Development

To get the example working locally, you can run:

```bash
npm run dev
```

This will start a local HTTP server on port `8080`.
