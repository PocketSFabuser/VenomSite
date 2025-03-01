// JavaScript code to apply styles based on media queries
if (window.matchMedia("(max-width: 750px)").matches) {
    // Load mobile styles
    document.write('<link rel="stylesheet" type="text/css" href="m-stylefile.css">');
} else {
    // Load desktop styles
    document.write('<link rel="stylesheet" type="text/css" href="stylefile.css">');
}

// Add an event listener to handle window resizing
window.addEventListener('resize', function() {
    if (window.matchMedia("(max-width: 750px)").matches) {
        // Load mobile styles
        document.write('<link rel="stylesheet" type="text/css" href="m-stylefile.css">');
    } else {
        // Load desktop styles
        document.write('<link rel="stylesheet" type="text/css" href="stylefile.css">');
    }
});
