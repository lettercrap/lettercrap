(function() {
    const charWidth = 6;
    const charHeight = 10;
    const updateInterval = 150;
    const likelihoodOfReplacingWord = 0.05;
    const likelihoodOfChangingExistingText = 0.1;
    const randomChoice = list => list[Math.floor(Math.random() * list.length)];

    function createImageURL(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontsize = measureTextBinaryMethod(text, 'monospace', 0, 10, canvas.width);
        canvas.height = fontsize + 1;
        canvas.width = context.measureText(text).width + 2;
        context.fillText(text, 1, fontsize);
        return canvas.toDataURL();

        // https://jsfiddle.net/be6ppdre/29/
        function measureTextBinaryMethod(text, fontface, min, max, desiredWidth) {
            if (max - min < 1) return min;
            const test = min + ((max - min) / 2);
            context.font = `${test}px ${fontface}`;
            const measuredWidth = context.measureText(text).width;

            const condition = measuredWidth > desiredWidth;
            const minChoice = condition ? min : test;
            const maxChoice = condition ? test : max;
            return measureTextBinaryMethod(text, fontface, minChoice, maxChoice, desiredWidth);
        }
    }

    function initElement(element) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = element.getAttribute('data-letter-crap');
        img.onload = () => render(element, img, null);
    }

    function getTextContentWithImageAtSize(image, width, height, existingText, words, letters) {
        existingText = existingText ? existingText.replace(/\r?\n|\r/g, '') : null;
        const shouldReplaceExisting = () => !existingText || Math.random() < likelihoodOfChangingExistingText;

        const canvas = document.createElement('canvas');
        canvas.width = parseInt(width / charWidth);
        canvas.height = parseInt(height / charHeight);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        let chars = "";
        let startOfFilledInSequence = 0;
        let i = 0;

        for (let y = 0; y < data.height; y++) {
            for (let x = 0; x < data.width; x++) {
                let black = data.data[i * 4] < 120;
                let transparent = data.data[i * 4 +3] < 50;
                if (black && !transparent) {
                    if (startOfFilledInSequence === null) startOfFilledInSequence = i;
                    chars += shouldReplaceExisting() ? randomChoice(letters) : existingText[i];
                    if (words.length > 0 && Math.random() < likelihoodOfReplacingWord && shouldReplaceExisting()) {
                        let word = randomChoice(words);
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
        const existingTextCondition = !!prev && prev.width === element.clientWidth && prev.height === element.clientHeight;
        const existingText = existingTextCondition ? prev.text : null;
        const text = getTextContentWithImageAtSize(
            image, element.clientWidth, element.clientHeight, existingText, words, letters
        );

        element.textContent = text;
        const data = {
            text: text,
            width: element.clientWidth,
            height: element.clientHeight,
        };
        setTimeout(() => render(element, image, data), updateInterval);
    }

    document.addEventListener('DOMContentLoaded', function() {
        for (const textElement of document.querySelectorAll('[data-lettercrap-text]')) {
            const text = textElement.getAttribute('data-lettercrap-text');
            const imageURL = createImageURL(text);
            textElement.setAttribute('data-letter-crap', imageURL);
        }

        for (const element of document.querySelectorAll('[data-letter-crap]')) {
            initElement(element);
        }
    });
})()
