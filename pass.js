if (window.matchMedia("(max-width: 750px)").matches) {
    // Load mobile style
    document.write('<link rel="stylesheet" type="text/css" href="m-stylefile.css">');
} else {
    // Load pc style
    document.write('<link rel="stylesheet" type="text/css" href="stylefile.css">');
}
