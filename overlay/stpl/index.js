OVERLAY = 'stpl';

specificUpdate = (() => {
    const unflippedChars = ['pichu', 'iceclimbers', 'marth', 'roy'];

    return () => {
        const stockIcons = $('.stock_icon:not(.hidden)');

        fitPlayerTags(false);

        stockIcons.toArray()
            .slice(Math.ceil(stockIcons.length / 2))
            .forEach((el) => {
                el.classList.toggle(
                    'flipped',
                    !unflippedChars.includes(el.getAttribute('character'))
                );
            });
    };
})();