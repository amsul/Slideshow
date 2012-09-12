/*!
       _______    __        __
      / __/ (_)__/ /__ ___ / /  ___ _    __
     _\ \/ / / _  / -_|_-</ _ \/ _ \ |/|/ /
    /___/_/_/\_,_/\__/___/_//_/\___/__,__/

    =======================================

    Slideshow v0.9.0
    By Amsul (http://amsul.ca)
    Inspired by http://slidesjs.com

    Updated: 12 September, 2012

    (c) Amsul Naeem, 2012 - http://amsul.ca
    Licensed under MIT ("expat" flavour) license.
    Hosted on http://github.com/amsul/slideshow
*/

/*jshint debug: true, browser: true, devel: true */


/* */
(function( $, window, document, undefined ) {
/* */


    var Slideshower = function( slideshow, options ) {

        var

            // use for public methods
            Slideshower = {},

            // use for private methods
            _self = {}



        /*
            Initialize a slideshow
        ======================================================================== */

        _self.initialize = function( slideshow, options ) {

            // store the slideshow element
            _self.$elem = $( slideshow )

            // set the new options
            _self.options = $.extend( {}, $.fn.slideshow.options, options )

            // set the stage
            _self.setStage( slideshow )

            return _self
        }



        /*
            Set the stage for a slideshow
        ======================================================================== */

        _self.setStage = function( slideshow ) {

            var absolutePosition = {
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }


            // store the dimensions
            _self.width = _self.$elem.innerWidth()
            _self.height = _self.$elem.innerHeight()


            // wrap and contain the slideshow
            slideshow.innerHTML = '<div class="' + _self.options.container + '"><div class="' + _self.options.wrapper + '">' + slideshow.innerHTML + '</div></div>'


            // store the container while declaring the styles
            _self.$container = _self.$elem.find( '.' + _self.options.container ).css({ width: _self.width, height: _self.height, overflow: 'hidden', position: 'relative' })


            // store the wrapper while declaring the styles
            _self.$wrap = _self.$elem.find( '.' + _self.options.wrapper ).css( absolutePosition )


            // store the slides while declaring the styles
            _self.$slides = _self.$elem.find( '.' + _self.options.slides ).css( absolutePosition ).css({ left: '100%', width: _self.width, height: _self.height })


            // store the number of slides
            _self.slidesCount = _self.$slides.length


            // show the first slide
            _self.showSlide()


            // generate the pagination
            if ( _self.options.generatePagination ) {
                _self.generatePagination()
            }


            // generate the navigation
            if ( _self.options.generateNavigation ) {
                _self.generateNavigation()
            }


            // if slideshow should auto play
            if ( _self.options.play ) {

                // set the speed based on the play option
                _self.speed = ( typeof _self.options.play === 'number' ) ? _self.options.play : 10000

                // bind the auto play
                _self.bindPlay()
            }



            // if there is no width or height
            if ( !_self.$elem.innerWidth() || !_self.$elem.innerHeight() ) {
                console.log( 'crap' )
            }

            return _self
        }



        /*
            Generate the pagination
        ======================================================================== */

        _self.generatePagination = function() {

            var
                method,

                // open the pagination list
                pagination = '<nav class="' + _self.options.pagination + '"><ul class="' + _self.options.paginationList + '">'


            // according to the number of slides, add the slide links
            for ( var i = 0, len = _self.slidesCount; i < len; i += 1 ) {
                pagination += '<li class="' + _self.options.paginationItem + '"><a href="" data-index="' + i + '" class="' + _self.options.paginationLink + '">' + (i+1) + '</a></li>'
            }


            // close the list
            pagination += '</ul></nav>'


            // set the appending method
            if ( _self.options.paginationPrepend ) { method = 'before' }
            else { method = 'after' }

            // paint the pagination
            _self.$container[ method ]( pagination )


            // bind click events on the pagination
            _self.$pagination = _self.$elem.find( '.' + _self.options.pagination ).on( 'click', '.' + _self.options.paginationLink, _self.paginationClick )
            _self.$paginationItems = _self.$pagination.find( '.' + _self.options.paginationItem )


            // update the state of the slide pagination link
            _self.activatePagination( _self.activeSlide )

            return _self
        }



        /*
            Generate the navigation
        ======================================================================== */

        _self.generateNavigation = function() {

            var
                method,

                // create the navigation block
                navigation      =   '<nav class="' + _self.options.navigation + '">' +
                                        '<ul class="' + _self.options.navigationList + '">' +
                                            '<li class="' + _self.options.navigationItem + ' ' + _self.options.navigationPrev + '"><a href="" data-direction="prev" class="' + _self.options.navigationLink + '">Previous</a></li>' +
                                            '<li class="' + _self.options.navigationItem + ' ' + _self.options.navigationNext + '"><a href="" data-direction="next" class="' + _self.options.navigationLink + '">Next</a></li>' +
                                        '</ul>' +
                                    '</nav>'


            // set the appending method
            if ( _self.options.navigationPrepend ) { method = 'before' }
            else { method = 'after' }

            // paint the navigation
            _self.$container[ method ]( navigation )


            // bind the click events on the navigation
            _self.$navigation = _self.$elem.find( '.' + _self.options.navigation ).on( 'click', '.' + _self.options.navigationLink, _self.navigationClick )

            return _self
        }



        /*
            Change the active state of a pagination link
        ======================================================================== */

        _self.activatePagination = function( index ) {
            _self.$paginationItems.slice( index, (index+1) ).addClass( _self.options.paginationActive )
            return _self
        }

        _self.deactivatePagination = function( index ) {
            _self.$paginationItems.slice( index, (index+1) ).removeClass( _self.options.paginationActive )
            return _self
        }



        /*
            Delegate a pagination click
        ======================================================================== */

        _self.paginationClick = function( e ) {

            var rightward, holder, $button, targetSlide

            // prevent the default action
            e.preventDefault()


            // if it's animating or there's no slide change
            if ( _self.animating || targetSlide === _self.activeSlide ) {
                return _self
            }


            // assign the holder
            holder = this

            // set the target button
            $button = $( e.originalEvent.target )

            // figure out the target slide
            targetSlide = $button.data( 'index' )


            // if the direction should be rightward
            if ( targetSlide < _self.activeSlide ) {
                rightward = true
            }


            // update the slides
            _self.updateSlides( targetSlide, rightward )

            return _self
        }



        /*
            Delegate a navigation click
        ======================================================================== */

        _self.navigationClick = function( e ) {

            var holder, $button, rightward, targetSlide

            // prevent the default action
            e.preventDefault()

            if ( _self.animating ) {
                return _self
            }


            // assign the holder
            holder = this

            // set the target button
            $button = $( e.originalEvent.target )

            // set the direction
            rightward = ( $button.data( 'direction' ) === 'prev' )

            // figure out the target slide
            targetSlide = ( rightward ) ? _self.activeSlide - 1 : _self.activeSlide + 1


            // normalize the target slide index
            targetSlide = _self.normalizeTarget( targetSlide )


            // update the slides
            _self.updateSlides( targetSlide, rightward )

            return _self
        }



        /*
            Normalize the index of a target slide
        ======================================================================== */

        _self.normalizeTarget = function( targetSlide ) {

            // if first slide is active and `prev` is clicked
            if ( targetSlide < 0 ) {

                // set last slide as target
                targetSlide = _self.slidesCount - 1
            }

            // if last slide is active and `next` is clicked
            else if ( targetSlide === _self.slidesCount ) {

                // set first slide as target
                targetSlide = 0
            }

            return targetSlide
        }



        /*
            Update everything on a slide change
        ======================================================================== */

        _self.updateSlides = function( targetSlide, rightward ) {

            // if the target is the active slide
            if ( targetSlide === _self.activeSlide ) {
                return _self
            }


            // reset the play timer, if that
            if ( _self.options.play ) {
                _self.bindPlay()
            }


            // update the pagination, if that
            if ( _self.options.generatePagination ) {

                _self.

                    // deactivate the current pagination
                    deactivatePagination( _self.activeSlide ).

                    // activate the target pagination
                    activatePagination( targetSlide )
            }


            // update the slides
            _self.

                // hide the active slide, possibly going `rightward`
                hideSlide( _self.activeSlide, rightward ).

                // show the target slide, possibly going `rightward`
                showSlide( targetSlide, rightward )

            return _self
        }



        /*
            Reset the position and state of a hidden slide
        ======================================================================== */

        _self.resetSlide = function( index ) {

            _self.$slides.

                // get this slide
                slice( index, (index+1) ).

                // move to the right and reset z-index
                css({
                    left: '100%',
                    zIndex: ''
                }).

                // remove the active state
                removeClass( _self.options.slidesActive )

            return _self
        }



        /*
            Bind the slideshow auto play
        ======================================================================== */

        _self.bindPlay = function() {

            // declare the speed and default to 10 seconds
            var targetSlide


            // if the speed is less than the slide speed with a 50ms buffer
            if ( _self.speed < _self.options.speed + 50 ) {
                return _self
            }


            // bind the hover on pause, if that
            if ( _self.options.hoverPause ) {
                _self.bindHoverPause()
            }


            // animate after a timeout
            _self.player = setTimeout( function() {

                // if it's not animating
                if ( !_self.animating ) {

                    // normalize the target slide index with the slide after the active
                    targetSlide = _self.normalizeTarget( _self.activeSlide + 1 )

                    // update the slides
                    _self.updateSlides( targetSlide )
                }

            }, _self.speed )

            return _self
        }



        /*
            Pause the slideshow on hover
        ======================================================================== */

        _self.bindHoverPause = function() {

            // bind the listener
            _self.$elem.on({
                'mouseover.enterPause': function() {

                    // switch off the player
                    clearTimeout( _self.player )

                    // switch off the listener
                    _self.$elem.off( '.enterPause' )
                },
                'mouseleave.leavePause': function() {

                    // switch off the listener
                    _self.$elem.off( '.leavePause' )

                    // bind the play again
                    _self.bindPlay()
                }
            })

            return _self
        }




        /*
            Hide the specified slide
        ======================================================================== */

        _self.hideSlide = function( index, rightward ) {

            var position, animationEffect, speed, $targetSlide,

                // callback when done animating
                callback = function() {

                    // reset the slide to the right
                    _self.resetSlide( index )

                    // set the status as done hiding
                    _self.animatingHide = false

                    // update animating status if it's also done showing
                    if ( !_self.animatingShow ) {
                        _self.animating = false
                    }
                }


            // return if the index is not a number or there's no change in index
            if ( typeof index !== 'number' ) {
                return _self
            }


            // set animating status as true
            _self.animating = true
            _self.animatingHide = true


            // set the speed
            speed = _self.options.speed


            // get the target slide
            $slideToHide = _self.$slides.slice( index, (index+1) )


            // if the effect should be a fade
            if ( _self.options.effect === 'fade' ) {
                animationEffect = { opacity: 0 }
            }

            // otherwise default to slide effect
            else {

                // check the direction
                if ( rightward ) {
                    position = '100%'
                }
                else {
                    position = '-100%'
                }

                // assign the animation effect
                animationEffect = { left: position }
            }


            // animate the slide
            _self.animateSlide( $slideToHide, animationEffect, speed, callback )


            return _self
        }



        /*
            Show the specified slide
        ======================================================================== */

        _self.showSlide = function( index, rightward ) {

            var position, animationEffect, speed, $targetSlide,

                // callback when done animating
                callback = function() {

                    // store the active slide
                    _self.$activeSlide = $targetSlide

                    // add the active class
                    $targetSlide.addClass( _self.options.slidesActive )

                    // update the showing status
                    _self.animatingShow = false

                    // update animating status if it's also done hiding
                    if ( !_self.animatingHide ) {
                        _self.animating = false
                    }
                }


            // make sure there is a valid index and speed
            if ( typeof index !== 'number' ) {
                index = 0
                speed = 0
            }
            else {
                speed = _self.options.speed
            }


            // set animating status as true
            _self.animating = true
            _self.animatingShow = true


            // set this as the active slide
            _self.activeSlide = index


            // get the target slide
            $targetSlide = _self.$slides.slice( index, (index+1) )


            // if the effect should be a fade
            if ( _self.options.effect === 'fade' ) {

                // position active slide above
                if ( _self.$activeSlide ) {
                    _self.$activeSlide.css( 'z-index', 110 )
                }

                // move initial position to 0 and layer below active slide
                $targetSlide.css({
                    zIndex: 100,
                    left: '0%'
                })

                // assign the animation effect
                animationEffect = { opacity: 1 }
            }


            // otherwise default to slide effect
            else {

                // if it's rightward
                if ( rightward ) {

                    // move initial position to the left
                    $targetSlide.css( 'left', '-100%' )
                }

                // assign the animation effect
                animationEffect = { left: '0%' }
            }


            // animate the slide
            _self.animateSlide( $targetSlide, animationEffect, speed, callback )


            return _self
        }



        /*
            Animate a target slide based on effect, speed, and callback
        ======================================================================== */

        _self.animateSlide = function( $target, effect, speed, callback ) {

            $target.

                // animate slide in to view
                stop().animate(

                    // do the assigned effect
                    effect,

                    // at the declared speed
                    speed,

                    // once done animating, do callback
                    callback
                )

            return _self
        }





        /* ==========================================================================

            Public methods begin

        ========================================================================== */


        /*
            Get the index of the active slide
        ======================================================================== */

        Slideshower.getActiveSlide = function() {
            return _self.activeSlide
        }




        /*
            And finally, we initialize then return
        ======================================================================== */

        _self.initialize( slideshow, options )


        return Slideshower
    }




    /*
        Extend jQuery
    ======================================================================== */

    $.fn.slideshow = function( options ) {
        return this.each( function() {

            if ( !$.data( this, 'slideshow' )) {

                $.data(
                    this,
                    'slideshow',
                    new Slideshower( this, options )
                )
            }

            return this
        })
    }


    // default options

    $.fn.slideshow.options = {

        container: 'slides-container', // string, Class name for slides container. Default is "slides_container"
        wrapper: 'slides-wrapper',

        slides: 'slide', // string, Class name for each slide
        slidesActive: 'active-slide', // string, Class name for current class

        generatePagination: true, // boolean, Auto generate pagination
        pagination: 'slides-pagination', // string, Class name for pagination
        paginationList: 'slides-pagination-list', // string, Class name for pagination list
        paginationItem: 'slides-pagination-item', // string, Class name for pagination items
        paginationLink: 'slides-pagination-link', // string, Class name for pagination links
        paginationActive: 'active-pagination', // string, Class name for active pagination item
        paginationPrepend: false, // boolean, prepend pagination

        generateNavigation: false, // boolean, Auto generate next/prev buttons
        navigation: 'slides-navigation', // string, Class name for navigation
        navigationList: 'slides-navigation-list', // string, Class name for navigation list
        navigationItem: 'slides-navigation-item', // string, Class name for navigation items
        navigationLink: 'slides-navigation-link', // string, Class name for navigation links
        navigationNext: 'slides-navigation-next', // string, Class name for next button
        navigationPrev: 'slides-navigation-prev', // string, Class name for previous button
        navigationPrepend: false, // boolean, prepend navigation

        speed: 350, // number, Set the speed of the animation in milliseconds
        effect: 'slide', // string, '[next/prev], [pagination]', 'slide' or 'fade'

        play: false, // number or boolean, Autoplay slideshow, a positive number will set to true and be the time between slide animation in milliseconds or true would set to default speed
        hoverPause: false//, // boolean, Set to true and hovering over slideshow will pause it


        //// TODO

        //////randomize: false, // boolean, Set to true to randomize slides
        //////pause: 0, // number, Pause slideshow on click of next/prev or pagination. A positive number will set to true and be the time of pause in milliseconds
        //////start: 1, // number, Set the speed of the sliding animation in milliseconds

        //////preload: false, // boolean, Set true to preload images in an image based slideshow
        //////preloadImage: '/img/loading.gif', // string, Name and location of loading image for preloader. Default is "/img/loading.gif"

        //////fadeSpeed: 350, // number, Set the speed of the fading animation in milliseconds
        //////fadeEasing: '', // string, must load jQuery's easing plugin before http://gsgd.co.uk/sandbox/jquery/easing/
        //////slideEasing: '', // string, must load jQuery's easing plugin before http://gsgd.co.uk/sandbox/jquery/easing/

        //////crossfade: false, // boolean, Crossfade images in a image based slideshow
        //////autoHeight: false, // boolean, Set to true to auto adjust height
        //////autoHeightSpeed: 350, // number, Set auto height animation time in milliseconds
        //////bigTarget: false, // boolean, Set to true and the whole slide will link to next slide on click


        //////animationStart: function(){}, // Function called at the start of animation
        //////animationComplete: function(){}, // Function called at the completion of animation
        //////slidesLoaded: function() {} // Function is called when slides is fully loaded
    }


/* */
})( jQuery, window, document )
/* */





