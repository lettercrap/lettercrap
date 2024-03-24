import { z } from 'zod';

const NonBlankStringSchema = z.string().refine((val) => val.trim().length > 0);
const FontWeightSchema = z.union([
  z.literal('100'),
  z.literal('200'),
  z.literal('300'),
  z.literal('400'),
  z.literal('500'),
  z.literal('600'),
  z.literal('700'),
  z.literal('800'),
  z.literal('900'),
  z.literal('lighter'),
  z.literal('normal'),
  z.literal('bold'),
  z.literal('bolder'),
]);
const UpdateIntervalSchema = z.number().nonnegative();
const WordsSchema = z.array(NonBlankStringSchema);
const FontFamilySchema = z.string();
const ConfigSchema = z.object({
  content: NonBlankStringSchema,
  letters: NonBlankStringSchema,
  words: WordsSchema,
  font_family: FontFamilySchema,
  font_weight: FontWeightSchema,
  update_interval: UpdateIntervalSchema,
});

export type Config = z.infer<typeof ConfigSchema>;

const config: Config = {
  content: 'LETTERCRAP',
  letters: '01',
  words: [],
  font_family: 'monospace',
  font_weight: 'normal',
  update_interval: 150,
};

export function configure(userConfig: Partial<Config>) {
  const cleanUserConfig = Object.fromEntries(Object.entries(userConfig).filter(([_key, val]) => val !== undefined));
  const preview = ConfigSchema.parse({ ...config, ...cleanUserConfig });
  const keys = Object.keys(preview) as (keyof Config)[];
  keys.forEach(<T extends keyof Config>(key: T) => (config[key] = userConfig[key] ?? config[key]));
}

const instances = new Map<HTMLDivElement, InitializedInstance>();

class InitializedInstance {
  intervalId: number;
  observer: ResizeObserver;

  constructor(intervalId: number, observer: ResizeObserver) {
    this.intervalId = intervalId;
    this.observer = observer;
  }

  destroy() {
    clearInterval(this.intervalId);
    this.observer.disconnect();
  }
}

export async function refresh() {
  const elements = Array.from(instances.keys());
  await resetElements(elements);
  await initElements(elements);
}

export async function resetElement(element: HTMLDivElement) {
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

export async function resetElements(elements: HTMLDivElement[]) {
  return Promise.all(Array.from(elements).map(resetElement));
}

export async function reset() {
  return resetElements(Array.from(instances.keys()));
}

export async function init() {
  const elements = document.querySelectorAll<HTMLDivElement>('div[data-lettercrap], div[data-lettercrap-text]');
  return initElements(Array.from(elements));
}

export async function initElements(elements: HTMLDivElement[]) {
  return Promise.all(Array.from(elements).map(initElement));
}

export async function initElement(element: HTMLDivElement) {
  if (instances.has(element)) return;

  if (element.hasAttribute('data-lettercrap-text')) {
    const text = NonBlankStringSchema.parse(element.getAttribute('data-lettercrap-text') ?? config.content);
    const font_family = FontFamilySchema.parse(
      element.getAttribute('data-lettercrap-font-family') ?? config.font_family
    );
    const font_weight = FontWeightSchema.parse(
      element.getAttribute('data-lettercrap-font-weight') ?? config.font_weight
    );
    const svg = createSVG(text, font_family, font_weight);
    const data = await getImageData(svg);
    element.setAttribute('data-lettercrap', data.toString());
  }

  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    const src = element.getAttribute('data-lettercrap');
    if (!src) throw new Error('No image data provided');
    image.crossOrigin = 'anonymous';
    image.src = src;
    image.onerror = reject;
    image.onload = () => {
      const metadata = render(element, image);
      instances.set(element, metadata);
      resolve();
    };
  });

  function createSVG(
    content: Config['content'],
    font_family: Config['font_family'],
    font_weight: Config['font_weight']
  ) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
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

  const letters = NonBlankStringSchema.parse(element.getAttribute('data-lettercrap-letters') ?? config.letters).trim();
  const words = WordsSchema.parse(element.getAttribute('data-lettercrap-words')?.split(' ') ?? config.words);
  const interval = UpdateIntervalSchema.parse(
    parseInt(element.getAttribute('data-lettercrap-update-interval') ?? config.update_interval.toString())
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
  const char_width = 6;
  const char_height = 10;
  const shouldReplaceWord = () => Math.random() < 0.05;
  const shouldReplaceExistingText = () => !existingText || Math.random() < 0.1;

  function randomChoice<T>(list: T[]) {
    return list[Math.floor(Math.random() * list.length)];
  }

  const canvas = document.createElement('canvas');
  canvas.width = width / char_width;
  canvas.height = height / char_height;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height);
  let chars = '';
  let start_of_filled_in_sequence: number | null = 0;
  let i = 0;

  for (const _y of Array(data.height).keys()) {
    for (const _x of Array(data.width).keys()) {
      const [r, g, b, a] = data.data.slice(i * 4, (i + 1) * 4);
      if (r === undefined || g === undefined || b === undefined || a === undefined) {
        throw new Error('Array index out of bound');
      }
      const black = r < 120;
      const transparent = a < 50;
      if (black && !transparent) {
        if (start_of_filled_in_sequence === null) start_of_filled_in_sequence = i;
        chars += shouldReplaceExistingText() ? randomChoice(letters.split('')) : existingText![i];
        if (words.length > 0 && shouldReplaceWord() && shouldReplaceExistingText()) {
          const word = randomChoice(words);
          if (word && i + 1 - start_of_filled_in_sequence >= word.length) {
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
