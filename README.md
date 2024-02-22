# Lettercrap

_Lettercrap_ is a JavaScript library that uses an image mask to generate dynamic ASCII art on the web. It looks like this:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/dabico/lettercrap/assets/34584913/5d9e21ea-9301-49d4-a5c0-e685b762590d">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/dabico/lettercrap/assets/34584913/62f87c22-25b6-45f5-b8a4-6715ea9d394e">
  <img alt="GIF showing the animated library name" src="https://github.com/dabico/lettercrap/assets/34584913/5d9e21ea-9301-49d4-a5c0-e685b762590d">
</picture>

## Usage

To use _Lettercrap_, import `lettercrap.js` and `lettercrap.css`. Create a `div` with the `data-lettercrap` 
attribute with the source of a black-and-white image, which will serve as the shape of the generated ASCII art:

```html
<div data-lettercrap='abcs.png' style='width: 500px; height: 200px'></div>
```

Make sure to set a height for your `div`. If you want to set a dynamic height based on the div's fluid width, 
you can specify an aspect ratio using the `data-lettercrap-aspect-ratio` attribute, and _Lettercrap_ will set the height of the `div` for you:

```html
<div data-lettercrap='abcs.png' style='width: 70%' data-lettercrap-aspect-ratio='0.5'></div>
```

By default, _Lettercrap_ uses `0`s, `1`s and the occasional `_` to fill in the shape of your image. You can 
change the set of letters used with the `data-lettercrap-letters` attribute:

```html
<div data-lettercrap='abcs.png' data-lettercrap-letters='ABC'></div>
```

_Lettercrap_ can also throw the occasional _full word_ into the mix—specify the words to choose from using 
the `data-lettercrap-words` attribute:

```html
<div data-lettercrap='words.png' data-lettercrap-words='apple banana peach'></div>
```

_Lettercrap_ allows you to generate a canvas from text if you don't want to generate an image beforehand
with the `data-lettercrap-text` attribute:

```html
<div data-lettercrap-text='CHECK IT OUT' data-lettercrap-aspect-ratio='0.3'></div>
```

Check out the `index.html` file to see how this all fits together.

## Development
To get the example working locally, you can run: 

```bash
npm run dev
```
