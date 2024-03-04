// eslint-disable-next-line no-unused-vars
const Lettercrap = (function() {

    const instances = new Map();

    class Metadata {
        constructor(intervalId, observer) {
            this.intervalId = intervalId;
            this.observer = observer;
        }

        destroy() {
            clearInterval(this.intervalId);
            this.observer.disconnect();
        }
    }


    const default_content = 'LETTERCRAP';
    const default_letters = '01';
    const default_words = [];
    const default_font_family = 'monospace';
    const default_font_weight = 'normal';
    const default_svg_namespace = 'http://www.w3.org/2000/svg';
    const default_char_width = 6;
    const default_char_height = 10;
    const default_update_interval = 150;
    const default_replace_word_probability = 0.05;
    const default_replace_existing_text_probability = 0.1;

    return { resetElement, resetElements, reset, init, initElements, initElement };

    async function resetElement(element) {
        return new Promise((resolve, reject) => {
            const metadata = instances.get(element);
            if (element instanceof Node && !!metadata) {
                metadata.destroy();
                instances.delete(element);
                element.textContent = null;
                element.style.height = null;
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

    async function resetElements(elements) {
        return Promise.all(
            Array.from(elements).map(resetElement)
        );
    }

    async function reset() {
        return resetElements(instances.keys());
    }

    async function init() {
        const elements = document.querySelectorAll('[data-lettercrap], [data-lettercrap-text]');
        return initElements(elements);
    }

    async function initElements(elements) {
        return Promise.all(
            Array.from(elements).map(initElement)
        );
    }

    async function initElement(element) {
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

        function createSVG(
            content = default_content,
            font_family = default_font_family,
            font_weight = default_font_weight
        ) {
            const svg = document.createElementNS(default_svg_namespace, 'svg');
            const text = document.createElementNS(default_svg_namespace, 'text');
            text.setAttributeNS(null, 'y', '10');
            text.setAttributeNS(null, 'font-family', font_family);
            text.setAttributeNS(null, 'font-weight', font_weight);
            text.textContent = content;
            svg.appendChild(text);
            document.body.appendChild(svg);
            const bounding_box = text.getBBox();
            document.body.removeChild(svg);
            svg.setAttributeNS(null, 'height', bounding_box.height.toString());
            svg.setAttributeNS(null, 'width', bounding_box.width.toString());
            return svg;
        }
    }

    async function getImageData(svg) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const serializer = new XMLSerializer();
            const serialized = serializer.serializeToString(svg);
            image.src = `data:image/svg+xml;base64,${btoa(serialized)}`;
            image.onerror = reject;
            image.onload = () => {
                const scale = 10;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const width = svg.getAttribute('width') * scale;
                const height = svg.getAttribute('height') * scale;
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0, width, height);
                resolve(canvas.toDataURL());
            };
        });
    }

    function render(element, image, text = undefined) {
        const aspect = element.hasAttribute('data-lettercrap-aspect-ratio')
            ? parseFloat(element.getAttribute('data-lettercrap-aspect-ratio'))
            : image.height / image.width;
        resetText();

        const letters = element.getAttribute('data-lettercrap-letters') || default_letters;
        const words = element.getAttribute('data-lettercrap-words')?.split(' ') || default_words;
        const interval = element.getAttribute('data-lettercrap-update-interval') || default_update_interval;
        const observer = new ResizeObserver(resetText);
        observer.observe(element);
        const id = setInterval(write(), interval);
        return new Metadata(id, observer);

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

    function getTextContentWithImageAtSize(image, width, height, existingText, words, letters) {
        existingText = existingText?.replace(/\r?\n|\r/g, '') || null;
        const randomChoice = list => list[Math.floor(Math.random() * list.length)];
        const shouldReplaceWord = () => Math.random() < default_replace_word_probability;
        const shouldReplaceExistingText = () => {
            return !existingText || Math.random() < default_replace_existing_text_probability;
        };

        const canvas = document.createElement('canvas');
        canvas.width = width / default_char_width;
        canvas.height = height / default_char_height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = context.getImageData(0, 0, canvas.width, canvas.height);
        let chars = '';
        let startOfFilledInSequence = 0;
        let i = 0;

        for (const _y of Array(data.height).keys()) {
            for (const _x of Array(data.width).keys()) {
                const black = data.data[i * 4] < 120;
                const transparent = data.data[i * 4 + 3] < 50;
                if (black && !transparent) {
                    if (startOfFilledInSequence === null) startOfFilledInSequence = i;
                    chars += shouldReplaceExistingText() ? randomChoice(letters) : existingText[i];
                    if (words.length > 0 && shouldReplaceWord() && shouldReplaceExistingText()) {
                        const word = randomChoice(words);
                        if (i + 1 - startOfFilledInSequence >= word.length) {
                            chars = chars.substring(0, chars.length - word.length) + word;
                        }
                    }
                } else {
                    chars += ' ';
                    startOfFilledInSequence = null;
                }
                i++;
            }
            chars += '\n';
            startOfFilledInSequence = null;
        }
        return chars;
    }
})();
