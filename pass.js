if (window.matchMedia("(max-width: 750px)").matches) {
    // load mobile styles
    document.write('<link rel="stylesheet" type="text/css" href="m-stylefile.css">');
} else {
    // load pc styles
    document.write('<link rel="stylesheet" type="text/css" href="stylefile.css">');
}
