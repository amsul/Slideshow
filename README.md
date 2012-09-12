Slideshow
=========

Current build: v1.0.0 – 12 September, 2012

Yet another jQuery slider plugin. Triggered with:

```
$( '.slides' ).slideshow()
```

<br>
### Markup


Set up your slides like this:

```
<section class="slides">
    <div class="slide">Slide 01</div>
    <div class="slide">Slide 02</div>
    <div class="slide">Slide 03</div>
    <div class="slide">Slide 04</div>        
</section>
```

<br>
### Options

You can pass in options into the slideshow. Here are the default options:

```
options = {
	container: 'slides-container',             // string, Class name for slides container
	wrapper: 'slides-wrapper',                 // string, Class name for slides wrapper
	slides: 'slide',                           // string, Class name for each slide
	slidesActive: 'active-slide',              // string, Class name for active slide
	
	generatePagination: true,                  // boolean, Auto generate pagination
    pagination: 'slides-pagination',           // string, Class name for pagination
    paginationList: 'slides-pagination-list',  // string, Class name for pagination list
    paginationItem: 'slides-pagination-item',  // string, Class name for pagination items
    paginationLink: 'slides-pagination-link',  // string, Class name for pagination links
    paginationActive: 'active-pagination',     // string, Class name for active pagination item
    paginationPrepend: false,                  // boolean, prepend pagination

    generateNavigation: false,                 // boolean, Auto generate next/prev buttons
    navigation: 'slides-navigation',           // string, Class name for navigation
    navigationList: 'slides-navigation-list',  // string, Class name for navigation list
    navigationItem: 'slides-navigation-item',  // string, Class name for navigation items
    navigationLink: 'slides-navigation-link',  // string, Class name for navigation links
    navigationNext: 'slides-navigation-next',  // string, Class name for next button
    navigationPrev: 'slides-navigation-prev',  // string, Class name for previous button
    navigationPrepend: false,                  // boolean, prepend navigation

    speed: 350,                                // number, Speed of the animation in milliseconds
    effect: 'slide',                           // string, 'slide' or 'fade'

    play: false,                               // number or boolean, Autoplay slideshow, a positive number will be the time between slide animation in milliseconds, `true` would set to default speed
    pauseOnHover: false,                       // boolean, Set to true and hovering over slideshow will pause it

    animationStart: function(slideshow) {},    // Function called at the start of a slide animation - has a few slideshow methods in scope
    animationComplete: function(slideshow) {}  // Function called at the completion of a slide animation - has a few slideshow methods in scope
}

$( '.slides' ).slideshow( options )
```





<br><br>


---
This code is (c) Amsul, 2012 – Licensed under the MIT ("expat" flavor) license.
