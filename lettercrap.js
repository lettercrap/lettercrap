// eslint-disable-next-line no-unused-vars
const Lettercrap = (function() {

    const default_content = 'LETTERCRAP';
    const default_font_family = 'monospace';
    const default_font_weight = 'normal';
    const default_svg_namespace = 'http://www.w3.org/2000/svg';
    const default_char_width = 6;
    const default_char_height = 10;
    const default_update_interval = 150;
    const default_replace_word_probability = 0.05;
    const default_replace_existing_text_probability = 0.1;

    return { initElement, initTextElement, init };

    async function init() {
        document.querySelectorAll('[data-lettercrap]').forEach(initElement);
        document.querySelectorAll('[data-lettercrap-text]').forEach(initTextElement);
    }

    async function initTextElement(element) {
        convertTextToImageElement(element).then(initElement);
    }

    async function convertTextToImageElement(element) {
        const text = element.getAttribute('data-lettercrap-text') || undefined;
        const font_family = element.getAttribute('data-lettercrap-font-family') || undefined;
        const font_weight = element.getAttribute('data-lettercrap-font-weight') || undefined;
        const svg = await createSVG(text, font_family, font_weight);
        const data = await getImageData(svg);
        element.setAttribute('data-lettercrap', data.toString());
        element.removeAttribute('data-lettercrap-text');
        element.removeAttribute('data-lettercrap-font-family');
        element.removeAttribute('data-lettercrap-font-weight');
        return element;
    }

    async function createSVG(
        content = default_content,
        font_family = default_font_family,
        font_weight = default_font_weight
    ) {
        return new Promise(resolve => {
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
            return resolve(svg);
        });
    }

    async function getImageData(svg) {
        return new Promise(resolve => {
            const image = new Image();
            const serializer = new XMLSerializer();
            const serialized = serializer.serializeToString(svg);
            image.src = `data:image/svg+xml;base64,${btoa(serialized)}`;
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

    async function initElement(element) {
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = element.getAttribute('data-lettercrap');
            img.onload = () => {
                const id = render(element, img, null);
                resolve(id);
            };
        });
    }

    function render(element, image, prev) {
        const aspect = element.hasAttribute('data-lettercrap-aspect-ratio')
            ? parseFloat(element.getAttribute('data-lettercrap-aspect-ratio'))
            : image.height / image.width;
        element.style.height = `${element.clientWidth * aspect}px`;

        const words = element.getAttribute('data-lettercrap-words')?.split(' ') || [];
        const letters = element.getAttribute('data-lettercrap-letters') || '0101010101';
        const existingTextCondition = !!prev &&
            prev.width === element.clientWidth &&
            prev.height === element.clientHeight;
        const existingText = existingTextCondition ? prev.text : null;
        const text = getTextContentWithImageAtSize(
            image, element.clientWidth, element.clientHeight, existingText, words, letters
        );

        element.textContent = text;
        const callback = () => render(element, image, {
            text: text,
            width: element.clientWidth,
            height: element.clientHeight,
        });
        return setTimeout(callback, default_update_interval);
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
