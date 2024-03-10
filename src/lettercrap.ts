const default_content = 'LETTERCRAP';
const default_letters = '01';
const default_words: string[] = [];
const default_font_family = 'monospace';
const default_font_weight = 'normal';
const default_svg_namespace = 'http://www.w3.org/2000/svg';
const default_char_width: number = 6;
const default_char_height: number = 10;
const default_update_interval: number = 150;
const default_replace_word_probability: number = 0.05;
const default_replace_existing_text_probability: number = 0.1;

const instances = new Map<HTMLDivElement, InitializedInstance>();

class InitializedInstance {
  constructor(intervalId: number, observer: ResizeObserver) {
    this.intervalId = intervalId;
    this.observer = observer;
  }

  destroy() {
    clearInterval(this.intervalId);
    this.observer.disconnect();
  }
}

export default {
  resetElement,
  resetElements,
  reset,
  init,
  initElements,
  initElement,
};

async function resetElement(element: HTMLDivElement) {
  return new Promise<void>((resolve, reject) => {
    const metadata = instances.get(element);
    if (element instanceof Node && !!metadata) {
      metadata.destroy();
      instances.delete(element);
      element.textContent = null;
      element.style.height = '';
      resolve();
    } else if (!metadata) {
      const error = new Error('Element not initialized');
      reject(error);
    } else {
      const error = new Error('Input is not a Node instance');
      reject(error);
    }
  });
}

async function resetElements(elements: HTMLDivElement[]) {
  return Promise.all(Array.from(elements).map(resetElement));
}

async function reset() {
  return resetElements(instances.keys());
}

async function init() {
  const elements = document.querySelectorAll('[data-lettercrap], [data-lettercrap-text]');
  return initElements(elements);
}

async function initElements(elements: HTMLDivElement[]) {
  return Promise.all(Array.from(elements).map(initElement));
}

async function initElement(element: HTMLDivElement) {
  if (instances.has(element)) return;

  if (element.hasAttribute('data-lettercrap-text')) {
    const text = element.getAttribute('data-lettercrap-text') || undefined;
    const font_family = element.getAttribute('data-lettercrap-font-family') || undefined;
    const font_weight = element.getAttribute('data-lettercrap-font-weight') || undefined;
    const svg = createSVG(text, font_family, font_weight);
    const data = await getImageData(svg);
    element.setAttribute('data-lettercrap', data.toString());
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = element.getAttribute('data-lettercrap');
    image.onerror = reject;
    image.onload = () => {
      const metadata = render(element, image);
      instances.set(element, metadata);
      resolve();
    };
  });

  function createSVG(content = default_content, font_family = default_font_family, font_weight = default_font_weight) {
    const svg = document.createElementNS(default_svg_namespace, 'svg');
    const text = document.createElementNS(default_svg_namespace, 'text');
    text.setAttributeNS(null, 'x', '50%');
    text.setAttributeNS(null, 'y', '50%');
    text.setAttributeNS(null, 'text-anchor', 'middle');
    text.setAttributeNS(null, 'dominant-baseline', 'central');
    text.setAttributeNS(null, 'font-family', font_family);
    text.setAttributeNS(null, 'font-weight', font_weight);
    text.textContent = content;
    svg.appendChild(text);
    document.body.appendChild(svg);
    const bounding_box = text.getBBox();
    document.body.removeChild(svg);
    const height = Math.round(bounding_box.height);
    const width = Math.round(bounding_box.width);
    svg.setAttributeNS(null, 'height', height.toString());
    svg.setAttributeNS(null, 'width', width.toString());
    return svg;
  }
}

async function getImageData(svg: SVGElement) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const serializer = new XMLSerializer();
    const serialized = serializer.serializeToString(svg);
    image.src = `data:image/svg+xml;base64,${btoa(serialized)}`;
    image.onerror = reject;
    image.onload = () => {
      const scale = 10;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      const widthAttr = svg.getAttribute('width');
      if (widthAttr === null) throw new Error('Invalid image width');
      const width = Number(widthAttr) * scale;
      const heightAttr = svg.getAttribute('height');
      if (heightAttr === null) throw new Error('Invalid image height');
      const height = Number(heightAttr) * scale;
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL());
    };
  });
}

function render(element: HTMLDivElement, image: HTMLImageElement) {
  let text: string | undefined = undefined;
  const aspectAttr = parseFloat(element.getAttribute('data-lettercrap-aspect-ratio') ?? '0');
  const aspect = aspectAttr || image.height / image.width;
  resetText();

  const letters = element.getAttribute('data-lettercrap-letters') ?? default_letters;
  const words = element.getAttribute('data-lettercrap-words')?.split(' ') ?? default_words;
  const interval = parseInt(
    element.getAttribute('data-lettercrap-update-interval') ?? default_update_interval.toString()
  );
  const observer = new ResizeObserver(resetText);
  observer.observe(element);
  const id = setInterval(write(), interval);
  return new InitializedInstance(id, observer);

  function resetText() {
    text = undefined;
    const width = element.clientWidth;
    element.style.height = `${width * aspect}px`;
  }

  function write() {
    const width = element.clientWidth;
    const height = element.clientHeight;
    text = getTextContentWithImageAtSize(image, width, height, text, words, letters);
    element.textContent = text;
    return write;
  }
}

function getTextContentWithImageAtSize(
  image: HTMLImageElement,
  width: number,
  height: number,
  existingText: string | undefined,
  words: string[],
  letters: string
) {
  existingText = existingText?.replace(/\r?\n|\r/g, '');
  const shouldReplaceWord = () => Math.random() < default_replace_word_probability;
  const shouldReplaceExistingText = () => {
    return !existingText || Math.random() < default_replace_existing_text_probability;
  };

  function randomChoice<T>(list: T[]) {
    return list[Math.floor(Math.random() * list.length)];
  }

  const canvas = document.createElement('canvas');
  canvas.width = width / default_char_width;
  canvas.height = height / default_char_height;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height);
  let chars = '';
  let start_of_filled_in_sequence = 0;
  let i = 0;

  for (const _y of Array(data.height).keys()) {
    for (const _x of Array(data.width).keys()) {
      const black = data.data[i * 4] < 120;
      const transparent = data.data[i * 4 + 3] < 50;
      if (black && !transparent) {
        if (start_of_filled_in_sequence === null) start_of_filled_in_sequence = i;
        chars += shouldReplaceExistingText() ? randomChoice(letters.split('')) : existingText[i];
        if (words.length > 0 && shouldReplaceWord() && shouldReplaceExistingText()) {
          const word = randomChoice(words);
          if (i + 1 - start_of_filled_in_sequence >= word.length) {
            chars = chars.substring(0, chars.length - word.length) + word;
          }
        }
      } else {
        chars += ' ';
        start_of_filled_in_sequence = null;
      }
      i++;
    }
    chars += '\n';
    start_of_filled_in_sequence = null;
  }
  return chars;
}
