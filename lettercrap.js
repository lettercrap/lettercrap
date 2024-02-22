(function() {
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
        let chars = "";
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
                    chars += " ";
                    startOfFilledInSequence = null;
                }
                i++;
            }
            chars += "\n";
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
        setTimeout(callback, updateInterval);
    }

    function initElement(element) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = element.getAttribute('data-lettercrap');
        img.onload = () => render(element, img, null);
    }

    function createImageURL(text, font = 'monospace') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontsize = measureTextBinaryMethod(text, 0, 10, canvas.width);
        canvas.height = fontsize + 1;
        canvas.width = context.measureText(text).width + 2;
        context.fillText(text, 1, fontsize);
        return canvas.toDataURL();

        // https://jsfiddle.net/be6ppdre/29/
        function measureTextBinaryMethod(text, min, max, desiredWidth) {
            if (max - min < 1) return min;
            const pixels = min + (max - min) / 2;
            context.font = `${pixels}px ${font}`;
            const measuredWidth = context.measureText(text).width;

            const condition = measuredWidth > desiredWidth;
            const minChoice = condition ? min : pixels;
            const maxChoice = condition ? pixels : max;
            return measureTextBinaryMethod(text, minChoice, maxChoice, desiredWidth);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        for (const textElement of document.querySelectorAll('[data-lettercrap-text]')) {
            const text = textElement.getAttribute('data-lettercrap-text');
            const font = textElement.getAttribute('data-lettercrap-font') || undefined;
            const data = createImageURL(text, font);
            textElement.setAttribute('data-lettercrap', data);
            textElement.removeAttribute('data-lettercrap-text');
        }

        for (const element of document.querySelectorAll('[data-lettercrap]')) {
            initElement(element);
        }
    });
})()
