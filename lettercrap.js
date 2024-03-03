const Lettercrap = (function() {

    const charWidth = 6;
    const charHeight = 10;
    const updateInterval = 150;
    const likelihoodOfReplacingWord = 0.05;
    const likelihoodOfChangingExistingText = 0.1;
    const randomChoice = list => list[Math.floor(Math.random() * list.length)];

    function getTextContentWithImageAtSize(image, width, height, existingText, words, letters) {
        existingText = existingText?.replace(/\r?\n|\r/g, '') || null;
        const shouldReplaceWord = () => Math.random() < likelihoodOfReplacingWord;
        const shouldReplaceExistingText = () => !existingText || Math.random() < likelihoodOfChangingExistingText;

        const canvas = document.createElement('canvas');
        canvas.width = width / charWidth;
        canvas.height = height / charHeight;
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
        return setTimeout(callback, updateInterval);
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

    async function createSVG(content = 'LETTERCRAP', font_family = 'monospace', font_weight = 'normal') {
        return new Promise(resolve => {
            const namespace = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(namespace, 'svg');
            const text = document.createElementNS(namespace, 'text');
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
    }

    async function initTextElement(element) {
        convertTextToImageElement(element).then(() => initElement(element));
    }

    async function init() {
        document.querySelectorAll('[data-lettercrap]').forEach(initElement);
        document.querySelectorAll('[data-lettercrap-text]').forEach(initTextElement);
    }

    return { initElement, initTextElement, init };
})();
