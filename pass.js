if (window.matchMedia("(max-width: 750px)").matches) {
    // Load mobile styles
    document.write('<link rel="stylesheet" type="text/css" href="m-stylefile.css">');
} else {
    // Load desktop styles
    document.write('<link rel="stylesheet" type="text/css" href="stylefile.css">');
}
